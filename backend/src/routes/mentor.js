const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET Sessions Shared with Current Mentor (By Email)
router.get('/shared-sessions', authMiddleware, (req, res, next) => {
  try {
    const shares = db.prepare(`
      SELECT ss.*, s.title, s.target_role, s.experience_level, s.interview_type, s.overall_score, u.name as candidate_name, u.email as candidate_email
      FROM session_shares ss
      JOIN interview_sessions s ON ss.session_id = s.id
      JOIN users u ON ss.shared_by_user_id = u.id
      WHERE ss.shared_with_email = ?
      ORDER BY ss.created_at DESC
    `).all(req.user.email.toLowerCase().trim());

    res.json({
      success: true,
      sharedSessions: shares
    });
  } catch (err) {
    next(err);
  }
});

// GET Shared Session Detail by Share Code (Mentor View - View Only)
router.get('/shared-sessions/:code', (req, res, next) => {
  try {
    const { code } = req.params;

    const share = db.prepare('SELECT * FROM session_shares WHERE share_code = ?').get(code);
    if (!share) {
      return res.status(404).json({ success: false, error: 'Invalid or expired share link.' });
    }

    const session = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(share.session_id);
    const candidate = db.prepare('SELECT name, email, target_role, experience_level FROM users WHERE id = ?').get(share.shared_by_user_id);

    const questions = db.prepare('SELECT * FROM questions WHERE session_id = ? ORDER BY question_number ASC').all(session.id);

    const questionsWithDetails = questions.map(q => {
      const answer = db.prepare('SELECT * FROM answers WHERE question_id = ? ORDER BY created_at DESC LIMIT 1').get(q.id);
      let feedback = null;
      if (answer) {
        const fbRow = db.prepare('SELECT * FROM feedback WHERE answer_id = ?').get(answer.id);
        if (fbRow) {
          feedback = {
            ...fbRow,
            star_breakdown: JSON.parse(fbRow.star_breakdown_json || '{}'),
            strengths: JSON.parse(fbRow.strengths_json || '[]'),
            areas_for_improvement: JSON.parse(fbRow.areas_for_improvement_json || '[]')
          };
        }
      }

      return {
        ...q,
        expected_competencies: JSON.parse(q.expected_competencies_json || '[]'),
        answer,
        feedback
      };
    });

    res.json({
      success: true,
      candidate,
      session: {
        ...session,
        strengths: JSON.parse(session.strengths_json || '[]'),
        weaknesses: JSON.parse(session.weaknesses_json || '[]'),
        improvement_plan: JSON.parse(session.improvement_plan_json || '[]'),
        role_explanation: session.role_explanation ? JSON.parse(session.role_explanation) : null,
        questions: questionsWithDetails
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
