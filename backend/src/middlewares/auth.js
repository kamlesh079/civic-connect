const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route. Please log in.', 401));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4. Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated.', 403));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(error); // Will be caught by global error handler
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};