const express = require('express');
const { z } = require('zod');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const geminiService = require('../services/geminiService');

const router = express.Router();

const explainRoleSchema = z.object({
  targetRole: z.string().min(2, 'Target role required'),
  experienceLevel: z.string().min(2, 'Experience level required'),
  industry: z.string().min(2, 'Industry required'),
  interviewType: z.string().min(2, 'Interview type required')
});

const prepCardsSchema = z.object({
  targetRole: z.string().optional(),
  experienceLevel: z.string().optional(),
  jobDescription: z.string().optional()
});

// Explain Role & Format
router.post('/explain-role', authMiddleware, validate(explainRoleSchema), async (req, res, next) => {
  try {
    const explanation = await geminiService.explainRoleAndFormat(req.body);
    res.json({
      success: true,
      explanation
    });
  } catch (err) {
    next(err);
  }
});

// Generate Preparation Cards
router.post('/prep-cards', authMiddleware, validate(prepCardsSchema), async (req, res, next) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const targetRole = req.body.targetRole || user.target_role;
    const experienceLevel = req.body.experienceLevel || user.experience_level;
    const jobDescription = req.body.jobDescription || user.target_jd;

    const cards = await geminiService.generatePrepCards({
      targetRole,
      experienceLevel,
      jobDescription,
      candidateSkills: user.skills_json
    });

    // Save generated cards to user profile prep cards
    const stmt = db.prepare(`
      INSERT INTO prep_cards (user_id, card_type, title, content_json)
      VALUES (?, ?, ?, ?)
    `);

    cards.forEach(c => {
      stmt.run(req.user.id, c.cardType || 'achievement', c.title, JSON.stringify(c));
    });

    res.json({
      success: true,
      cards
    });
  } catch (err) {
    next(err);
  }
});

// GET Saved User Prep Cards
router.get('/prep-cards', authMiddleware, (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM prep_cards WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const cards = rows.map(r => ({
      ...r,
      content: JSON.parse(r.content_json || '{}')
    }));

    res.json({
      success: true,
      cards
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
