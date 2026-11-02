import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Resolve current directory for reliable .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Connect to MongoDB Database
connectDB();

// CORS Configuration for Angular frontend
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:4200',
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Root API Welcome & Health Route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Course Registration System REST API (MEAN Stack)',
    version: '1.0.0',
    documentation: {
      students: '/api/students',
      courses: '/api/courses',
      registrations: '/api/registrations',
      dashboard: '/api/dashboard',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    database: {
      name: mongoose.connection.name || 'course_registration_db',
      status: dbStatus,
    },
    uptime: `${Math.floor(process.uptime())} seconds`,
    serverPort: PORT,
  });
});

// Mount Routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch 404 for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('\x1b[31m✖ Global Error:\x1b[0m', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎓 Course Registration Backend Server is Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`👥 Students API: http://localhost:${PORT}/api/students`);
  console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`📝 Registrations API: http://localhost:${PORT}/api/registrations`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`🩺 Health API: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

process.on('unhandledRejection', (err) => {
  console.error('\x1b[31m✖ Unhandled Rejection:\x1b[0m', err);
});

export default app;
