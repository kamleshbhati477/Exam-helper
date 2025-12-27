const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Exam routes
app.get('/api/exams', (req, res) => {
  // TODO: Fetch all exams from database
  res.status(200).json({
    status: 'success',
    message: 'Exams retrieved successfully',
    data: []
  });
});

app.get('/api/exams/:id', (req, res) => {
  // TODO: Fetch exam by ID from database
  const { id } = req.params;
  res.status(200).json({
    status: 'success',
    message: `Exam ${id} retrieved successfully`,
    data: {}
  });
});

app.post('/api/exams', (req, res) => {
  // TODO: Create new exam in database
  const { title, description, duration, totalQuestions } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({
      status: 'error',
      message: 'Title and description are required'
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Exam created successfully',
    data: {
      id: Date.now(),
      title,
      description,
      duration,
      totalQuestions
    }
  });
});

app.put('/api/exams/:id', (req, res) => {
  // TODO: Update exam in database
  const { id } = req.params;
  const { title, description, duration, totalQuestions } = req.body;

  res.status(200).json({
    status: 'success',
    message: `Exam ${id} updated successfully`,
    data: {
      id,
      title,
      description,
      duration,
      totalQuestions
    }
  });
});

app.delete('/api/exams/:id', (req, res) => {
  // TODO: Delete exam from database
  const { id } = req.params;

  res.status(200).json({
    status: 'success',
    message: `Exam ${id} deleted successfully`
  });
});

// Question routes
app.get('/api/exams/:examId/questions', (req, res) => {
  // TODO: Fetch all questions for an exam
  const { examId } = req.params;

  res.status(200).json({
    status: 'success',
    message: `Questions for exam ${examId} retrieved successfully`,
    data: []
  });
});

app.post('/api/exams/:examId/questions', (req, res) => {
  // TODO: Create new question for an exam
  const { examId } = req.params;
  const { questionText, options, correctAnswer, difficulty } = req.body;

  if (!questionText || !options || !correctAnswer) {
    return res.status(400).json({
      status: 'error',
      message: 'Question text, options, and correct answer are required'
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Question created successfully',
    data: {
      id: Date.now(),
      examId,
      questionText,
      options,
      correctAnswer,
      difficulty
    }
  });
});

// User attempt/score routes
app.get('/api/attempts/:userId', (req, res) => {
  // TODO: Fetch all attempts by a user
  const { userId } = req.params;

  res.status(200).json({
    status: 'success',
    message: `Attempts for user ${userId} retrieved successfully`,
    data: []
  });
});

app.post('/api/attempts', (req, res) => {
  // TODO: Create new exam attempt
  const { userId, examId, answers, score } = req.body;

  if (!userId || !examId) {
    return res.status(400).json({
      status: 'error',
      message: 'User ID and Exam ID are required'
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Exam attempt recorded successfully',
    data: {
      id: Date.now(),
      userId,
      examId,
      answers,
      score,
      completedAt: new Date().toISOString()
    }
  });
});

app.get('/api/attempts/:userId/:examId', (req, res) => {
  // TODO: Fetch specific attempt details
  const { userId, examId } = req.params;

  res.status(200).json({
    status: 'success',
    message: `Attempt details retrieved successfully`,
    data: {}
  });
});

// User routes
app.post('/api/users/register', (req, res) => {
  // TODO: Register new user
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      id: Date.now(),
      email,
      name
    }
  });
});

app.post('/api/users/login', (req, res) => {
  // TODO: Authenticate user
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully',
    data: {
      id: Date.now(),
      email,
      token: 'sample_jwt_token'
    }
  });
});

app.get('/api/users/:id', (req, res) => {
  // TODO: Fetch user profile
  const { id } = req.params;

  res.status(200).json({
    status: 'success',
    message: `User ${id} profile retrieved successfully`,
    data: {}
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Exam Helper API server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
