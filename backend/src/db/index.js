const fs = require('fs');
const path = require('path');
const { supabase, isSupabaseConfigured } = require('../lib/supabase');

const dbPath = path.join(__dirname, '..', '..', 'interview_assistant.json');

// Local fallback store loader
function loadLocalData() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [],
      interview_sessions: [],
      questions: [],
      answers: [],
      feedback: [],
      prep_cards: [],
      session_shares: [],
      practice_plans: [],
      auto_ids: { users: 1, interview_sessions: 1, questions: 1, answers: 1, feedback: 1, prep_cards: 1, session_shares: 1, practice_plans: 1 }
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    const initialData = {
      users: [],
      interview_sessions: [],
      questions: [],
      answers: [],
      feedback: [],
      prep_cards: [],
      session_shares: [],
      practice_plans: [],
      auto_ids: { users: 1, interview_sessions: 1, questions: 1, answers: 1, feedback: 1, prep_cards: 1, session_shares: 1, practice_plans: 1 }
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function saveLocalData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

let store = loadLocalData();

/**
 * Universal Database Interface supporting Supabase & Local Fallback Store
 */
class QueryStatement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  get(...params) {
    const results = this.all(...params);
    return results.length > 0 ? results[0] : undefined;
  }

  all(...params) {
    const sqlLower = this.sql.toLowerCase();
    store = loadLocalData();

    // 1. COUNT Users
    if (sqlLower.includes('select count(*) as count from users')) {
      return [{ count: store.users.length }];
    }

    // 2. Select User by Email
    if (sqlLower.includes('select * from users where email = ?')) {
      const email = (params[0] || '').toLowerCase().trim();
      const u = store.users.find(x => x.email.toLowerCase() === email);
      return u ? [u] : [];
    }

    if (sqlLower.includes('select id from users where email = ?')) {
      const email = (params[0] || '').toLowerCase().trim();
      const u = store.users.find(x => x.email.toLowerCase() === email);
      return u ? [{ id: u.id }] : [];
    }

    // 3. Select User by ID
    if (sqlLower.includes('select id, name, email, target_role, experience_level, industry, bio, skills_json') || sqlLower.includes('select * from users where id = ?')) {
      const id = Number(params[0]);
      const u = store.users.find(x => x.id === id);
      return u ? [u] : [];
    }

    // 4. Select Sessions for User (With Filters & Stats)
    if (sqlLower.includes('from interview_sessions s')) {
      const userId = Number(params[0]);
      let items = store.interview_sessions.filter(s => s.user_id === userId);

      let paramIdx = 1;
      if (this.sql.includes('s.title LIKE ?')) {
        const term = (params[paramIdx] || '').replace(/%/g, '').toLowerCase();
        items = items.filter(s =>
          (s.title || '').toLowerCase().includes(term) ||
          (s.target_role || '').toLowerCase().includes(term) ||
          (s.job_description || '').toLowerCase().includes(term)
        );
        paramIdx += 3;
      }

      if (this.sql.includes('s.interview_type = ?')) {
        const typeVal = params[paramIdx];
        items = items.filter(s => s.interview_type === typeVal);
        paramIdx++;
      }

      if (this.sql.includes('s.status = ?')) {
        const statusVal = params[paramIdx];
        items = items.filter(s => s.status === statusVal);
        paramIdx++;
      }

      if (this.sql.includes('s.overall_score >= ?')) {
        const minScore = Number(params[paramIdx]);
        items = items.filter(s => (s.overall_score || 0) >= minScore);
        paramIdx++;
      }

      const formatted = items.map(s => {
        const sessionQs = store.questions.filter(q => q.session_id === s.id);
        const answeredQIds = new Set(
          store.answers.filter(a => sessionQs.some(q => q.id === a.question_id)).map(a => a.question_id)
        );
        return {
          ...s,
          total_questions: sessionQs.length,
          answered_questions: answeredQIds.size
        };
      });

      formatted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return formatted;
    }

    // 5. Select Single Session by ID & User ID
    if (sqlLower.includes('interview_sessions') && (sqlLower.includes('id = ? and user_id = ?') || sqlLower.includes('s.id = ? and s.user_id = ?'))) {
      const id = Number(params[0]);
      const userId = Number(params[1]);
      const s = store.interview_sessions.find(x => x.id === id && x.user_id === userId);
      return s ? [s] : [];
    }

    if (sqlLower.includes('interview_sessions') && (sqlLower.includes('where id = ?') || sqlLower.includes('where s.id = ?'))) {
      const id = Number(params[0]);
      const s = store.interview_sessions.find(x => x.id === id);
      return s ? [s] : [];
    }

    // 6. Select Questions for Session / Question queries
    if (sqlLower.includes('from questions')) {
      if (sqlLower.includes('max(question_number)')) {
        const sId = Number(params[0]);
        const list = store.questions.filter(q => q.session_id === sId);
        const maxNum = list.reduce((max, cur) => cur.question_number > max ? cur.question_number : max, 0);
        return [{ max_num: maxNum }];
      }

      if (sqlLower.includes('where id = ? and session_id = ?')) {
        const qId = Number(params[0]);
        const sId = Number(params[1]);
        const q = store.questions.find(x => x.id === qId && x.session_id === sId);
        return q ? [q] : [];
      }

      if (sqlLower.includes('where id = ?') || sqlLower.includes('where q.id = ?')) {
        const qId = Number(params[0]);
        const q = store.questions.find(x => x.id === qId);
        return q ? [q] : [];
      }

      if (sqlLower.includes('session_id = ?') || sqlLower.includes('q.session_id = ?')) {
        const sessionId = Number(params[0]);
        const list = store.questions.filter(q => q.session_id === sessionId);
        list.sort((a, b) => a.question_number - b.question_number);

        return list.map(q => {
          const ansList = store.answers.filter(a => a.question_id === q.id);
          ansList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          const latestAns = ansList[0];

          let fb = null;
          if (latestAns) {
            fb = store.feedback.find(f => f.answer_id === latestAns.id);
          }

          return {
            ...q,
            answer_id: latestAns ? latestAns.id : null,
            user_answer: latestAns ? (latestAns.user_answer || latestAns.answer_text) : null,
            duration_seconds: latestAns ? latestAns.duration_seconds : 0,
            answered_at: latestAns ? latestAns.created_at : null,
            feedback_id: fb ? fb.id : null,
            relevance_score: fb ? fb.relevance_score : null,
            clarity_score: fb ? fb.clarity_score : null,
            evidence_score: fb ? fb.evidence_score : null,
            star_score: fb ? fb.star_score : null,
            strengths_json: fb ? fb.strengths_json : '[]',
            improvements_json: fb ? (fb.improvements_json || fb.areas_for_improvement_json) : '[]',
            improved_answer_model: fb ? (fb.improved_answer_model || fb.improved_star_response) : ''
          };
        });
      }
    }

    // 7. Select Answers
    if (sqlLower.includes('from answers')) {
      if (sqlLower.includes('where question_id = ?') || sqlLower.includes('where a.question_id = ?')) {
        const qId = Number(params[0]);
        const list = store.answers.filter(a => a.question_id === qId);
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list;
      }
    }

    // 8. Select Feedback
    if (sqlLower.includes('from feedback')) {
      if (sqlLower.includes('where answer_id = ?') || sqlLower.includes('where f.answer_id = ?')) {
        const ansId = Number(params[0]);
        const fb = store.feedback.find(f => f.answer_id === ansId);
        return fb ? [fb] : [];
      }
    }

    // 9. Select Prep Cards
    if (sqlLower.includes('from prep_cards')) {
      if (sqlLower.includes('where session_id = ?')) {
        const sId = Number(params[0]);
        return store.prep_cards.filter(c => c.session_id === sId);
      }
      if (sqlLower.includes('where user_id = ?')) {
        const uId = Number(params[0]);
        const list = store.prep_cards.filter(c => c.user_id === uId);
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list;
      }
    }

    // 10. Select Practice Plan
    if (sqlLower.includes('from practice_plans')) {
      if (sqlLower.includes('where session_id = ?')) {
        const sId = Number(params[0]);
        const list = store.practice_plans.filter(p => p.session_id === sId);
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return list;
      }
    }

    // 11. Select Session Shares for Mentor
    if (sqlLower.includes('from session_shares')) {
      if (sqlLower.includes('where ss.shared_with_email = ?') || sqlLower.includes('where shared_with_email = ?')) {
        const email = (params[0] || '').toLowerCase().trim();
        const shares = store.session_shares.filter(ss => ss.shared_with_email === email);
        return shares.map(ss => {
          const s = store.interview_sessions.find(x => x.id === ss.session_id) || {};
          const u = store.users.find(x => x.id === ss.shared_by_user_id) || {};
          return {
            ...ss,
            title: s.title,
            target_role: s.target_role,
            experience_level: s.experience_level,
            interview_type: s.interview_type,
            overall_score: s.overall_score,
            candidate_name: u.name,
            candidate_email: u.email
          };
        });
      }
      if (sqlLower.includes('where share_code = ?')) {
        const code = params[0];
        const ss = store.session_shares.find(x => x.share_code === code);
        return ss ? [ss] : [];
      }
    }

    // 12. Compare Metrics
    if (sqlLower.includes('avg(f.relevance_score)')) {
      const sessionId = Number(params[0]);
      const sessionQs = store.questions.filter(q => q.session_id === sessionId);
      const qIds = sessionQs.map(q => q.id);
      const answers = store.answers.filter(a => qIds.includes(a.question_id));
      const ansIds = answers.map(a => a.id);
      const fbs = store.feedback.filter(f => ansIds.includes(f.answer_id));

      if (fbs.length === 0) {
        return [{ avg_score: 0, avg_relevance: 0, avg_clarity: 0, avg_evidence: 0, avg_star: 0, avg_overall: 0 }];
      }

      const sumRel = fbs.reduce((acc, f) => acc + f.relevance_score, 0);
      const sumCla = fbs.reduce((acc, f) => acc + f.clarity_score, 0);
      const sumEvi = fbs.reduce((acc, f) => acc + f.evidence_score, 0);
      const sumStar = fbs.reduce((acc, f) => acc + f.star_score, 0);
      const sumOvr = fbs.reduce((acc, f) => acc + (f.overall_score || f.relevance_score), 0);

      const avg = Math.round(sumRel / fbs.length);
      return [{
        avg_score: avg,
        avg_relevance: avg,
        avg_clarity: Math.round(sumCla / fbs.length),
        avg_evidence: Math.round(sumEvi / fbs.length),
        avg_star: Math.round(sumStar / fbs.length),
        avg_overall: Math.round(sumOvr / fbs.length)
      }];
    }

    return [];
  }

  run(...params) {
    store = loadLocalData();
    const sqlLower = this.sql.toLowerCase();
    const now = new Date().toISOString();

    // INSERT INTO users
    if (sqlLower.startsWith('insert into users')) {
      const id = store.auto_ids.users++;
      const newUser = {
        id,
        name: params[0],
        email: params[1],
        password_hash: params[2],
        target_role: params[3] || 'Full Stack Developer',
        experience_level: params[4] || 'Mid-Level (3-5 years)',
        industry: params[5] || 'Software & Technology',
        bio: params[6] || '',
        skills_json: params[7] || '[]',
        target_jd: '',
        created_at: now,
        updated_at: now
      };
      store.users.push(newUser);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // UPDATE users
    if (sqlLower.startsWith('update users')) {
      const userId = Number(params[7]);
      const user = store.users.find(u => u.id === userId);
      if (user) {
        user.name = params[0];
        user.target_role = params[1];
        user.experience_level = params[2];
        user.industry = params[3];
        user.bio = params[4];
        user.skills_json = params[5];
        user.target_jd = params[6];
        user.updated_at = now;
        saveLocalData(store);
      }
      return { changes: user ? 1 : 0 };
    }

    // INSERT INTO interview_sessions
    if (sqlLower.startsWith('insert into interview_sessions')) {
      const id = store.auto_ids.interview_sessions++;
      const newSession = {
        id,
        user_id: Number(params[0]),
        title: params[1],
        target_role: params[2],
        experience_level: params[3],
        industry: params[4],
        interview_type: params[5],
        job_description: params[6] || '',
        role_explanation: params[7] || '',
        status: 'in_progress',
        overall_score: 0,
        duration_seconds: 0,
        summary: '',
        strengths_json: '[]',
        weaknesses_json: '[]',
        improvement_plan_json: '[]',
        created_at: now,
        updated_at: now
      };
      store.interview_sessions.push(newSession);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // UPDATE interview_sessions
    if (sqlLower.includes('update interview_sessions set duration_seconds')) {
      const duration = Number(params[0]);
      const id = Number(params[1]);
      const s = store.interview_sessions.find(x => x.id === id);
      if (s) {
        s.duration_seconds = (s.duration_seconds || 0) + duration;
        s.updated_at = now;
        saveLocalData(store);
      }
      return { changes: s ? 1 : 0 };
    }

    if (sqlLower.includes('update interview_sessions set status = \'completed\'')) {
      const score = Number(params[0]);
      const summary = params[1];
      const strengths = params[2];
      const weaknesses = params[3];
      const plan = params[4];
      const id = Number(params[5]);

      const s = store.interview_sessions.find(x => x.id === id);
      if (s) {
        s.status = 'completed';
        s.overall_score = score;
        s.summary = summary;
        s.strengths_json = strengths;
        s.weaknesses_json = weaknesses;
        s.improvement_plan_json = plan;
        s.updated_at = now;
        saveLocalData(store);
      }
      return { changes: s ? 1 : 0 };
    }

    if (sqlLower.includes('update interview_sessions set status = ?')) {
      const status = params[0];
      const id = Number(params[1]);
      const s = store.interview_sessions.find(x => x.id === id);
      if (s) {
        s.status = status;
        s.updated_at = now;
        saveLocalData(store);
      }
      return { changes: s ? 1 : 0 };
    }

    // DELETE FROM interview_sessions
    if (sqlLower.startsWith('delete from interview_sessions')) {
      const id = Number(params[0]);
      const idx = store.interview_sessions.findIndex(x => x.id === id);
      if (idx !== -1) {
        store.interview_sessions.splice(idx, 1);
        const qIds = store.questions.filter(q => q.session_id === id).map(q => q.id);
        store.questions = store.questions.filter(q => q.session_id !== id);
        const ansIds = store.answers.filter(a => qIds.includes(a.question_id)).map(a => a.id);
        store.answers = store.answers.filter(a => !qIds.includes(a.question_id));
        store.feedback = store.feedback.filter(f => !ansIds.includes(f.answer_id));
        saveLocalData(store);
        return { changes: 1 };
      }
      return { changes: 0 };
    }

    // INSERT INTO questions
    if (sqlLower.startsWith('insert into questions')) {
      const id = store.auto_ids.questions++;
      const newQ = {
        id,
        session_id: Number(params[0]),
        question_number: Number(params[1]),
        question_text: params[2],
        category: params[3],
        difficulty: params[4],
        expected_competencies_json: params[5],
        star_guidance: params[6],
        is_follow_up: params[7] || (this.sql.includes('1, ?') ? 1 : 0),
        parent_question_id: params[8] || null,
        created_at: now
      };
      store.questions.push(newQ);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // INSERT INTO answers
    if (sqlLower.startsWith('insert into answers')) {
      const id = store.auto_ids.answers++;
      const newAns = {
        id,
        question_id: Number(params[0]),
        user_id: Number(params[1]),
        answer_text: params[2],
        duration_seconds: Number(params[3] || 0),
        self_assessment_score: Number(params[4] || 3),
        created_at: now
      };
      store.answers.push(newAns);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // INSERT INTO feedback
    if (sqlLower.startsWith('insert into feedback')) {
      const id = store.auto_ids.feedback++;
      const newFb = {
        id,
        answer_id: Number(params[0]),
        relevance_score: Number(params[1]),
        clarity_score: Number(params[2]),
        evidence_score: Number(params[3]),
        star_score: Number(params[4]),
        confidence_score: Number(params[5]),
        overall_score: Number(params[6]),
        feedback_summary: params[7],
        star_breakdown_json: params[8],
        improved_star_response: params[9],
        strengths_json: params[10],
        areas_for_improvement_json: params[11],
        created_at: now
      };
      store.feedback.push(newFb);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // INSERT INTO prep_cards
    if (sqlLower.startsWith('insert into prep_cards')) {
      const id = store.auto_ids.prep_cards++;
      const newCard = {
        id,
        user_id: Number(params[0]),
        session_id: params[1] ? Number(params[1]) : null,
        card_type: params[2] || 'achievement',
        title: params[3] || '',
        content_json: params[4] || '{}',
        created_at: now
      };
      if (!this.sql.includes('session_id')) {
        newCard.card_type = params[1];
        newCard.title = params[2];
        newCard.content_json = params[3];
      }
      store.prep_cards.push(newCard);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // INSERT INTO practice_plans
    if (sqlLower.startsWith('insert into practice_plans')) {
      const id = store.auto_ids.practice_plans++;
      const newPlan = {
        id,
        user_id: Number(params[0]),
        session_id: Number(params[1]),
        title: params[2],
        plan_days_json: params[3],
        created_at: now
      };
      store.practice_plans.push(newPlan);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    // INSERT INTO session_shares
    if (sqlLower.startsWith('insert into session_shares')) {
      const id = store.auto_ids.session_shares++;
      const newShare = {
        id,
        session_id: Number(params[0]),
        shared_by_user_id: Number(params[1]),
        shared_with_email: params[2],
        share_code: params[3],
        created_at: now
      };
      store.session_shares.push(newShare);
      saveLocalData(store);
      return { lastInsertRowid: id, changes: 1 };
    }

    return { lastInsertRowid: 1, changes: 1 };
  }
}

const db = {
  exec: (sql) => console.log('Database initialized.'),
  prepare: (sql) => new QueryStatement(sql)
};

module.exports = db;
