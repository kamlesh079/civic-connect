const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = `Resource not found with id of ${error.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key (e.g., Duplicate email)
  if (error.code === 11000) {
    const message = 'Duplicate field value entered. Please use a different value.';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT Invalid Token
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401);
  }

  // JWT Expired Token
  if (error.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401);
  }

  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    status: error.status || 'error',
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;