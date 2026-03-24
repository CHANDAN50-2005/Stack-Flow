import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));

// Routing configuration
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  problem: process.env.PROBLEM_SERVICE_URL || 'http://localhost:5002',
  submission: process.env.SUBMISSION_SERVICE_URL || 'http://localhost:5003',
  leaderboard: process.env.LEADERBOARD_SERVICE_URL || 'http://localhost:5004',
};

// Proxies
app.use('/api/auth', createProxyMiddleware({ target: services.auth, changeOrigin: true }));
app.use('/api/problems', createProxyMiddleware({ target: services.problem, changeOrigin: true }));
app.use('/api/submissions', createProxyMiddleware({ target: services.submission, changeOrigin: true }));
app.use('/api/leaderboard', createProxyMiddleware({ target: services.leaderboard, changeOrigin: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
