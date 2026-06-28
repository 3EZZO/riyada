import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payment';
import universityRoutes from './routes/university';
import applicationRoutes from './routes/application';
import storeRoutes from './routes/store';
import lmsRoutes from './routes/lms';
import analyticsRoutes from './routes/analytics';
import scheduleRoutes from './routes/schedule';
import feedbackRoutes from './routes/feedback';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'OK', message: 'Riyada API is running' });
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '..', '..', 'dist');
app.use(express.static(frontendPath));
app.get('*', (_req: any, res: any) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
