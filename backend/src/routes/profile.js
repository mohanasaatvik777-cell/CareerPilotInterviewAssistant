const express = require('express');
const { z } = require('zod');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  target_role: z.string().optional(),
  experience_level: z.string().optional(),
  industry: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  target_jd: z.string().optional()
});

// GET Profile
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, name, email, target_role, experience_level, industry, bio, skills_json, target_jd, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    res.json({
      success: true,
      profile: {
        ...user,
        skills: JSON.parse(user.skills_json || '[]')
      }
    });
  } catch (err) {
    next(err);
  }
});

// UPDATE Profile
router.put('/', authMiddleware, validate(updateProfileSchema), (req, res, next) => {
  try {
    const { name, target_role, experience_level, industry, bio, skills, target_jd } = req.body;

    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedRole = target_role !== undefined ? target_role : current.target_role;
    const updatedExp = experience_level !== undefined ? experience_level : current.experience_level;
    const updatedIndustry = industry !== undefined ? industry : current.industry;
    const updatedBio = bio !== undefined ? bio : current.bio;
    const updatedSkills = skills !== undefined ? JSON.stringify(skills) : current.skills_json;
    const updatedJd = target_jd !== undefined ? target_jd : current.target_jd;

    const stmt = db.prepare(`
      UPDATE users
      SET name = ?, target_role = ?, experience_level = ?, industry = ?, bio = ?, skills_json = ?, target_jd = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(updatedName, updatedRole, updatedExp, updatedIndustry, updatedBio, updatedSkills, updatedJd, req.user.id);

    const user = db.prepare('SELECT id, name, email, target_role, experience_level, industry, bio, skills_json, target_jd, created_at, updated_at FROM users WHERE id = ?').get(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        ...user,
        skills: JSON.parse(user.skills_json || '[]')
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
