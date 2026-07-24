const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Ensure Database schema is initialized
require('./db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const interviewRoutes = require('./routes/interviews');
const aiRoutes = require('./routes/ai');
const mentorRoutes = require('./routes/mentor');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration explicitly supporting Render domains and HTTPS credentials
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps) or any frontend domain
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI-Interview-Assistant Backend API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentor', mentorRoutes);

// Serve Production Frontend Static Files
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root Route Fallback
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: "Career Pilot API is running smoothly!"
    });
  });
}

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Interview Assistant Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = app;
