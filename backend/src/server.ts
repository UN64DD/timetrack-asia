import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
const xss = require('xss-clean');
import dotenv from 'dotenv';
import authRoutes from './modules/auth/routes/auth.routes';
import eventsRoutes from './modules/events/routes/events.routes';
import registrationsRoutes from './modules/registrations/routes/registrations.routes';
import paymentsRoutes from './modules/payments/routes/payments.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import raceDayRoutes from './modules/race_day/routes/race_day.routes';
import resultsRoutes from './modules/results/routes/results.routes';
import './modules/notifications/jobs/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 0. Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 1. Global Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body (limit to prevent large payloads)
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// 2. Rate Limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many requests from this IP, please try again in a minute'
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/race-day', raceDayRoutes);
app.use('/api/results', resultsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
