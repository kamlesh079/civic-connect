const Issue = require('../models/Issue');
const AppError = require('../utils/AppError');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (Citizen)
exports.createIssue = async (req, res, next) => {
  try {
    // Note: Actual image file uploads (Multer) are handled in Phase 15.
    // For now, we accept image URLs as strings in the request body.
    const { title, description, category, images, location, address, priority } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      images,
      location, 
      address,
      priority,
      reportedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's submitted issues
// @route   GET /api/issues/my
// @access  Private
exports.getMyIssues = async (req, res, next) => {
  try {
    // Pagination setup
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filtering setup
    const filter = { reportedBy: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const issues = await Issue.find(filter)
      .populate('category', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt'); // Newest first

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: issues.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single issue by ID
// @route   GET /api/issues/:id
// @access  Private
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('category', 'name')
      .populate('reportedBy', 'name')
      .populate('assignedOfficer', 'name department')
      .populate({
        path: 'comments', // Uses the virtual defined in Phase 4
        select: 'text createdAt',
        populate: { path: 'user', select: 'name role' }
      });

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle upvote on an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
exports.upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    // Check if the user has already upvoted
    const hasUpvoted = issue.upvotes.some((id) => id.toString() === req.user.id);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter((id) => id.toString() !== req.user.id);
    } else {
      // Add upvote
      issue.upvotes.push(req.user.id);
    }

    await issue.save();

    res.status(200).json({
      success: true,
      upvotes: issue.upvotes.length,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen a resolved issue
// @route   POST /api/issues/:id/reopen
// @access  Private (Creator only)
exports.reopenIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    // Authorization: Only the original citizen who reported it can reopen it
    if (issue.reportedBy.toString() !== req.user.id) {
      return next(new AppError('You are not authorized to modify this issue', 403));
    }

    // State validation: Can only reopen resolved issues
    if (issue.status !== 'Resolved') {
      return next(new AppError(`Cannot reopen an issue with status: ${issue.status}. Only Resolved issues can be reopened.`, 400));
    }

    issue.status = 'Reopened';
    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue successfully reopened',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};