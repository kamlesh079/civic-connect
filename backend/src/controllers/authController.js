const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Helper function to generate token and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // Remove password from output just in case
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

// @desc    Register user (Citizens only)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create user - Force role to Citizen to prevent unauthorized admin creation
    const user = await User.create({
      name,
      email,
      password,
      role: 'Citizen'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new AppError("Please provide an email and password", 400));
    }

    // Check for user (must explicitly select password since we hid it in the model)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated", 403));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
