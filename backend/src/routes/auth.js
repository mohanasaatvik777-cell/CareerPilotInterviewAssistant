const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('../db');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_interview_assistant_2026';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  targetRole: z.string().optional(),
  experienceLevel: z.string().optional(),
  industry: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// Register User
router.post('/register', validate(registerSchema), (req, res, next) => {
  try {
    const { name, email, password, targetRole, experienceLevel, industry } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, target_role, experience_level, industry)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      targetRole || 'Full Stack Developer',
      experienceLevel || 'Mid-Level (3-5 years)',
      industry || 'Software & Technology'
    );

    const userId = result.lastInsertRowid;
    const user = db.prepare('SELECT id, name, email, target_role, experience_level, industry, bio, skills_json, created_at FROM users WHERE id = ?').get(userId);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        ...user,
        skills: JSON.parse(user.skills_json || '[]')
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login User
router.post('/login', validate(loginSchema), (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        target_role: user.target_role,
        experience_level: user.experience_level,
        industry: user.industry,
        bio: user.bio,
        skills: JSON.parse(user.skills_json || '[]')
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get Logged In User Profile
router.get('/me', authMiddleware, (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, name, email, target_role, experience_level, industry, bio, skills_json, target_jd, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        ...user,
        skills: JSON.parse(user.skills_json || '[]')
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
