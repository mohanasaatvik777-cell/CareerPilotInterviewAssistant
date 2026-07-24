const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
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

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Pilot API is running smoothly!"
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentor', mentorRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Interview Assistant Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = app;
