const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Global Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount all API routes under /api
app.use('/api', routes);

// Handle 404 - Route not found
// If a request bypasses the above routes, it hits this middleware
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});