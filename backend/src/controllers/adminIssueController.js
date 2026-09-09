const Issue = require('../models/Issue');
const AppError = require('../utils/AppError');

// @desc    Get all issues system-wide
// @route   GET /api/admin/issues
// @access  Private (Admin)
exports.getAllIssues = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.assignedOfficer) filter.assignedOfficer = req.query.assignedOfficer;

    const issues = await Issue.find(filter)
      .populate('category', 'name')
      .populate('reportedBy', 'name email')
      .populate('assignedOfficer', 'name department')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: issues.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign or reassign an officer to an issue
// @route   PATCH /api/admin/issues/:id/assign
// @access  Private (Admin)
exports.assignOfficer = async (req, res, next) => {
  try {
    const { officerId } = req.body;

    if (!officerId) {
      return next(new AppError('Please provide an officer ID', 400));
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    const previousStatus = issue.status;
    
    issue.assignedOfficer = officerId;
    
    // Automatically update status if it was unassigned
    if (['Submitted', 'Under Review'].includes(issue.status)) {
      issue.status = 'Assigned';
    }

    issue.statusHistory.push({
      status: issue.status,
      changedBy: req.user.id,
      remarks: `Issue assigned/reassigned to officer ID: ${officerId}`
    });

    await issue.save();

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change issue priority
// @route   PATCH /api/admin/issues/:id/priority
// @access  Private (Admin)
exports.updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;

    if (!priority) {
      return next(new AppError('Please provide a priority level', 400));
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id, 
      { priority },
      { new: true, runValidators: true }
    );

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

// @desc    Get system statistics
// @route   GET /api/admin/issues/stats
// @access  Private (Admin)
exports.getIssueStats = async (req, res, next) => {
  try {
    // MongoDB Aggregation to get counts by status
    const statusStats = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format the array into a clean object (e.g., { "Resolved": 10, "Submitted": 5 })
    const formattedStatusStats = statusStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalIssues = await Issue.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        total: totalIssues,
        byStatus: formattedStatusStats
      }
    });
  } catch (error) {
    next(error);
  }
};