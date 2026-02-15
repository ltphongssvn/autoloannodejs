// src/server.js
// Maps: config/application.rb + config/puma.rb
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import appConfig from './config/app.js';
import { securityHeaders, hstsHeader } from './middleware/securityHeaders.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';

const app = express();

// Core middleware
app.use(cors(appConfig.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Security
app.use(securityHeaders);
app.use(hstsHeader);
app.use(generalLimiter);

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = appConfig.port;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`AutoLoan API server running on port ${PORT}`);
    logger.info(`Environment: ${appConfig.env}`);
  });
}

export default app;
