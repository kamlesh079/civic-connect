const Category = require('../models/Category');
const AppError = require('../utils/AppError');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Private (All Roles)
exports.getCategories = async (req, res, next) => {
  try {
    // Only return active categories for normal fetching
    const categories = await Category.find({ isActive: true }).sort('name');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return next(new AppError(`No category found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};