const express = require('express');
const { z } = require('zod');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const geminiService = require('../services/geminiService');

const router = express.Router();

const createSessionSchema = z.object({
  targetRole: z.string().optional(),
  target_role: z.string().optional(),
  experienceLevel: z.string().optional(),
  experience_level: z.string().optional(),
  industry: z.string().optional(),
  interviewType: z.string().optional(),
  interview_type: z.string().optional(),
  jobDescription: z.string().optional().default(''),
  job_description: z.string().optional().default(''),
  focusTopics: z.string().optional().default(''),
  focus_topics: z.string().optional().default(''),
  totalQuestions: z.number().optional().default(5),
  total_questions: z.number().optional().default(5)
}).transform((data) => ({
  targetRole: data.targetRole || data.target_role || 'Full Stack Developer',
  experienceLevel: data.experienceLevel || data.experience_level || 'Mid-Level (2-5 yrs)',
  industry: data.industry || 'Software & Technology',
  interviewType: data.interviewType || data.interview_type || 'Technical',
  jobDescription: data.jobDescription || data.job_description || '',
  focusTopics: data.focusTopics || data.focus_topics || '',
  totalQuestions: data.totalQuestions || data.total_questions || 5
}));

const submitAnswerSchema = z.object({
  questionId: z.number().optional(),
  question_id: z.number().optional(),
  userAnswer: z.string().optional(),
  user_answer: z.string().optional(),
  answerText: z.string().optional(),
  timeSpentSeconds: z.number().optional().default(0),
  time_spent_seconds: z.number().optional().default(0),
  durationSeconds: z.number().optional().default(0)
}).transform((data) => ({
  questionId: Number(data.questionId || data.question_id || 0),
  userAnswer: data.userAnswer || data.user_answer || data.answerText || '',
  timeSpentSeconds: data.timeSpentSeconds || data.time_spent_seconds || data.durationSeconds || 0
}));

// CREATE Interview Session
router.post('/', authMiddleware, validate(createSessionSchema), async (req, res, next) => {
  try {
    const { targetRole, experienceLevel, industry, interviewType, jobDescription, focusTopics, totalQuestions } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    // 1. Explain Role & Interview Format via AI
    const roleExplanation = await geminiService.explainRoleAndFormat({
      targetRole,
      experienceLevel,
      industry,
      interviewType
    });

    // 2. Generate Role & Focus-Specific Questions via AI
    const questionsData = await geminiService.generateQuestions({
      targetRole,
      experienceLevel,
      industry,
      interviewType,
      jobDescription,
      focusTopics,
      totalQuestions,
      candidateProfile: `${user?.name || 'Candidate'} - ${user?.bio || ''} - Skills: ${user?.skills_json || '[]'}`
    });

    const title = focusTopics
      ? `${interviewType} (${focusTopics}) — ${targetRole}`
      : `${interviewType} Practice — ${targetRole}`;

    // 3. Save Interview Session to DB
    const sessionStmt = db.prepare(`
      INSERT INTO interview_sessions (
        user_id, title, target_role, experience_level, industry, interview_type,
        job_description, role_explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = sessionStmt.run(
      req.user.id,
      title,
      targetRole,
      experienceLevel,
      industry,
      interviewType,
      jobDescription || '',
      JSON.stringify(roleExplanation)
    );

    const sessionId = result.lastInsertRowid;

    // 4. Save Questions to DB
    const questionStmt = db.prepare(`
      INSERT INTO questions (
        session_id, question_number, question_text, category, difficulty,
        expected_competencies_json, star_guidance
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const savedQuestions = [];
    questionsData.forEach((q, idx) => {
      const qResult = questionStmt.run(
        sessionId,
        idx + 1,
        q.questionText || q.question_text || 'Describe a key challenge in your work.',
        q.category || interviewType,
        q.difficulty || 'Medium',
        JSON.stringify(q.expectedCompetencies || q.expected_competencies || []),
        q.starGuidance || q.star_guidance || ''
      );

      savedQuestions.push({
        id: qResult.lastInsertRowid,
        question_number: idx + 1,
        question_text: q.questionText || q.question_text,
        category: q.category || interviewType,
        difficulty: q.difficulty || 'Medium',
        expected_competencies: q.expectedCompetencies || [],
        star_guidance: q.starGuidance || ''
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Practice session created successfully',
      session: {
        id: sessionId,
        title,
        target_role: targetRole,
        experience_level: experienceLevel,
        industry,
        interview_type: interviewType,
        job_description: jobDescription,
        status: 'in_progress',
        created_at: new Date().toISOString()
      },
      questions: savedQuestions
    });
  } catch (err) {
    console.error('Error creating interview session:', err);
    next(err);
  }
});

// GET All Sessions for User
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { search, interview_type, status, min_score } = req.query;

    let query = `
      SELECT s.*, 
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT a.id) as answered_questions,
        AVG(f.relevance_score) as overall_score,
        SUM(a.duration_seconds) as duration_seconds
      FROM interview_sessions s
      LEFT JOIN questions q ON q.session_id = s.id
      LEFT JOIN answers a ON a.question_id = q.id
      LEFT JOIN feedback f ON f.answer_id = a.id
      WHERE s.user_id = ?
    `;

    const params = [req.user.id];

    if (search) {
      query += ` AND (s.title LIKE ? OR s.target_role LIKE ? OR s.job_description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (interview_type) {
      query += ` AND s.interview_type = ?`;
      params.push(interview_type);
    }

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY s.id ORDER BY s.created_at DESC`;

    const sessions = db.prepare(query).all(...params);

    let filtered = sessions.map(s => ({
      ...s,
      overall_score: s.overall_score ? Math.round(s.overall_score) : 0,
      duration_seconds: s.duration_seconds || 0
    }));

    if (min_score) {
      filtered = filtered.filter(s => s.overall_score >= Number(min_score));
    }

    res.json({
      success: true,
      sessions: filtered
    });
  } catch (err) {
    next(err);
  }
});

// GET Session Details with Questions & Answers
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const session = db.prepare(`
      SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const questions = db.prepare(`
      SELECT q.*, 
        a.id as answer_id, a.user_answer, a.duration_seconds, a.created_at as answered_at,
        f.id as feedback_id, f.relevance_score, f.clarity_score, f.evidence_score, f.star_score,
        f.strengths_json, f.improvements_json, f.improved_answer_model
      FROM questions q
      LEFT JOIN answers a ON a.question_id = q.id
      LEFT JOIN feedback f ON f.answer_id = a.id
      WHERE q.session_id = ?
      ORDER BY q.question_number ASC
    `).all(session.id);

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question_number: q.question_number,
      question_text: q.question_text,
      category: q.category,
      difficulty: q.difficulty,
      expected_competencies: JSON.parse(q.expected_competencies_json || '[]'),
      star_guidance: q.star_guidance,
      user_answer: q.user_answer || null,
      feedback: q.feedback_id ? {
        id: q.feedback_id,
        relevance_score: q.relevance_score,
        clarity_score: q.clarity_score,
        evidence_score: q.evidence_score,
        star_score: q.star_score,
        strengths: JSON.parse(q.strengths_json || '[]'),
        improvements: JSON.parse(q.improvements_json || '[]'),
        improved_answer_model: q.improved_answer_model
      } : null
    }));

    res.json({
      success: true,
      session: {
        ...session,
        role_explanation: JSON.parse(session.role_explanation || '{}')
      },
      questions: formattedQuestions
    });
  } catch (err) {
    next(err);
  }
});

// SUBMIT Answer to a Question
router.post('/answers', authMiddleware, async (req, res, next) => {
  try {
    const { session_id, question_id, user_answer, time_spent_seconds } = req.body;
    const qId = Number(question_id || req.body.questionId);

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(qId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const session = db.prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?').get(question.session_id, req.user.id);
    if (!session) {
      return res.status(403).json({ success: false, message: 'Unauthorized session access' });
    }

    // Save Answer
    const answerStmt = db.prepare(`
      INSERT INTO answers (question_id, user_id, user_answer, duration_seconds)
      VALUES (?, ?, ?, ?)
    `);

    const ansResult = answerStmt.run(qId, req.user.id, user_answer, time_spent_seconds || 0);
    const answerId = ansResult.lastInsertRowid;

    // Evaluate via Gemini STAR Feedback Service
    const feedbackData = await geminiService.evaluateAnswer({
      questionText: question.question_text,
      userAnswer: user_answer,
      category: question.category,
      expectedCompetencies: JSON.parse(question.expected_competencies_json || '[]'),
      targetRole: session.target_role,
      experienceLevel: session.experience_level
    });

    // Save Feedback
    const feedbackStmt = db.prepare(`
      INSERT INTO feedback (
        answer_id, relevance_score, clarity_score, evidence_score, star_score,
        strengths_json, improvements_json, improved_answer_model
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const relScore = typeof feedbackData.relevanceScore === 'number' ? feedbackData.relevanceScore : 0;
    const claScore = typeof feedbackData.clarityScore === 'number' ? feedbackData.clarityScore : 0;
    const eviScore = typeof feedbackData.evidenceScore === 'number' ? feedbackData.evidenceScore : 0;
    const stScore = typeof feedbackData.starScore === 'number' ? feedbackData.starScore : 0;

    feedbackStmt.run(
      answerId,
      relScore,
      claScore,
      eviScore,
      stScore,
      JSON.stringify(feedbackData.strengths || []),
      JSON.stringify(feedbackData.improvements || []),
      feedbackData.improvedAnswerModel || ''
    );

    res.status(201).json({
      success: true,
      message: 'Answer evaluated successfully',
      feedback: {
        relevance_score: relScore,
        clarity_score: claScore,
        evidence_score: eviScore,
        star_score: stScore,
        strengths: feedbackData.strengths || [],
        improvements: feedbackData.improvements || [],
        improved_answer_model: feedbackData.improvedAnswerModel || ''
      }
    });
  } catch (err) {
    console.error('Error evaluating answer:', err);
    next(err);
  }
});

// COMPLETE Session
router.post('/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    db.prepare(`UPDATE interview_sessions SET status = 'completed' WHERE id = ? AND user_id = ?`)
      .run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Session completed successfully' });
  } catch (err) {
    next(err);
  }
});

// ARCHIVE Session
router.post('/:id/archive', authMiddleware, async (req, res, next) => {
  try {
    db.prepare(`UPDATE interview_sessions SET status = 'archived' WHERE id = ? AND user_id = ?`)
      .run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Session archived successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE Session
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    db.prepare(`DELETE FROM interview_sessions WHERE id = ? AND user_id = ?`)
      .run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// COMPARE Two Sessions
router.get('/compare/:id1/:id2', authMiddleware, async (req, res, next) => {
  try {
    const s1 = db.prepare(`SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?`).get(req.params.id1, req.user.id);
    const s2 = db.prepare(`SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?`).get(req.params.id2, req.user.id);

    if (!s1 || !s2) {
      return res.status(404).json({ success: false, message: 'One or both sessions not found' });
    }

    const s1Scores = db.prepare(`
      SELECT AVG(f.relevance_score) as avg_score FROM feedback f
      JOIN answers a ON a.id = f.answer_id
      JOIN questions q ON q.id = a.question_id
      WHERE q.session_id = ?
    `).get(s1.id);

    const s2Scores = db.prepare(`
      SELECT AVG(f.relevance_score) as avg_score FROM feedback f
      JOIN answers a ON a.id = f.answer_id
      JOIN questions q ON q.id = a.question_id
      WHERE q.session_id = ?
    `).get(s2.id);

    res.json({
      success: true,
      comparison: {
        session1: { ...s1, overall_score: Math.round(s1Scores.avg_score || 0) },
        session2: { ...s2, overall_score: Math.round(s2Scores.avg_score || 0) },
        analysis: `Comparison between ${s1.title} (${Math.round(s1Scores.avg_score || 0)}%) and ${s2.title} (${Math.round(s2Scores.avg_score || 0)}%).`
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
