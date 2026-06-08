const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const aiRoutes = require('./routes/ai.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin === process.env.FRONTEND_URL ||
      origin.endsWith('.vercel.app') ||
      origin === 'http://localhost:3000'
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'AI rate limit reached' });
app.use('/api/', limiter);
app.use('/api/ai/', aiLimiter);

app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;