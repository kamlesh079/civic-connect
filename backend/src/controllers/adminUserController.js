const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get all users (with filtering)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive;

    const users = await User.find(filter)
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError(`No user found with id ${req.params.id}`, 404));
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === user._id.toString() && isActive === false) {
      return next(new AppError('You cannot deactivate your own admin account', 400));
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (department !== undefined) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};