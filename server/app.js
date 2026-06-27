const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');

// Route files
const auth = require('./routes/authRoutes');
const properties = require('./routes/propertyRoutes');
const bookings = require('./routes/bookingRoutes');
const favorites = require('./routes/favoriteRoutes');
const reviews = require('./routes/reviewRoutes');
const admin = require('./routes/adminRoutes');
const connectDB = require('./config/db');

// Connect to database (for serverless environments)
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(
  cors({
    origin: true, // Allow request origin dynamically to support credentials/cookies
    credentials: true,
  })
);

// Set static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/bookings', bookings);
app.use('/api/favorites', favorites);
app.use('/api/reviews', reviews);
app.use('/api/admin', admin);

// Test endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy!' });
});

// Centralized error handler middleware
app.use(errorHandler);

module.exports = app;
