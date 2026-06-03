import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import payrollRoutes from './routes/payroll.js';
import performanceRoutes from './routes/performance.js';
import recruitmentRoutes from './routes/recruitment.js';
import aiRoutes from './routes/ai.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import documentRoutes from './routes/documents.js';
import reportRoutes from './routes/reports.js';
import onboardingRoutes from './routes/onboarding.js';
import videoInterviewRoutes from './routes/videoInterviews.js';


dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET','POST'], credentials: true }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/api/', rateLimiter);
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/interviews', videoInterviewRoutes);


app.get('/health', (_, res) => res.json({ status: 'ok', version: '3.0', timestamp: new Date().toISOString() }));

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => socket.join(`user_${userId}`));
  socket.on('disconnect', () => {});
});

export const sendNotification = (userId, data) => {
  io.to(`user_${userId}`).emit('notification', data);
};

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 FWC HRMS v3.0 Server running on port ${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}\n`);
});
