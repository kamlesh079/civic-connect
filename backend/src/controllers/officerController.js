const Issue = require('../models/Issue');
const AppError = require('../utils/AppError');

const {
  getPublicFileUrl
} = require('../middlewares/upload');

// @desc    Get dashboard statistics for logged-in officer
// @route   GET /api/officer/stats
// @access  Private (Officer)
exports.getDashboardStats = async (
  req,
  res,
  next
) => {
  try {
    const officerId = req.user.id;

    const totalAssigned =
      await Issue.countDocuments({
        assignedOfficer: officerId
      });

    const pending =
      await Issue.countDocuments({
        assignedOfficer: officerId,
        status: 'Assigned'
      });

    const inProgress =
      await Issue.countDocuments({
        assignedOfficer: officerId,
        status: 'In Progress'
      });

    const resolved =
      await Issue.countDocuments({
        assignedOfficer: officerId,
        status: 'Resolved'
      });

    res.status(200).json({
      success: true,

      data: {
        totalAssigned,
        pending,
        inProgress,
        resolved
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issues assigned to the logged-in officer
// @route   GET /api/officer/issues
// @access  Private (Officer)
exports.getAssignedIssues = async (
  req,
  res,
  next
) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      100
    );

    const startIndex =
      (page - 1) * limit;

    const filter = {
      assignedOfficer: req.user.id
    };

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.category) {
      filter.category =
        req.query.category;
    }

    if (req.query.priority) {
      filter.priority =
        req.query.priority;
    }

    const issues = await Issue.find(filter)
      .populate('category', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const total =
      await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: issues.length,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        )
      },

      data: issues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific issue details
// @route   GET /api/officer/issues/:id
// @access  Private (Officer)
exports.getIssueDetails = async (
  req,
  res,
  next
) => {
  try {
    const issue =
      await Issue.findById(
        req.params.id
      )
        .populate(
          'category',
          'name'
        )
        .populate(
          'reportedBy',
          'name'
        )
        .populate({
          path: 'comments',
          select:
            'text createdAt',
          populate: {
            path: 'user',
            select:
              'name role'
          }
        });

    if (!issue) {
      return next(
        new AppError(
          `No issue found with id ${req.params.id}`,
          404
        )
      );
    }

    if (
      issue.assignedOfficer?.toString() !==
      req.user.id
    ) {
      return next(
        new AppError(
          'You are not authorized to view an issue not assigned to you',
          403
        )
      );
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status
// @route   PATCH /api/officer/issues/:id/status
// @access  Private (Officer)
exports.updateIssueStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      remarks
    } = req.body;

    if (!status) {
      return next(
        new AppError(
          'Please provide a new status',
          400
        )
      );
    }

    const allowedStatuses = [
      'Assigned',
      'In Progress'
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return next(
        new AppError(
          'Only Assigned and In Progress are valid status updates here',
          400
        )
      );
    }

    const issue =
      await Issue.findById(
        req.params.id
      );

    if (!issue) {
      return next(
        new AppError(
          `No issue found with id ${req.params.id}`,
          404
        )
      );
    }

    if (
      issue.assignedOfficer?.toString() !==
      req.user.id
    ) {
      return next(
        new AppError(
          'You are not authorized to modify this issue',
          403
        )
      );
    }

    issue.status = status;

    issue.statusHistory.push({
      status,
      changedBy:
        req.user.id,
      remarks:
        remarks ||
        'Status updated by assigned officer'
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

// @desc    Mark issue resolved and upload resolution proof
// @route   PATCH /api/officer/issues/:id/resolve
// @access  Private (Officer)
exports.resolveIssue = async (
  req,
  res,
  next
) => {
  try {
    const {
      remarks
    } = req.body;

    const uploadedImages =
      (req.files || []).map(
        (file) =>
          getPublicFileUrl(
            req,
            file
          )
      );

    if (
      !remarks ||
      !remarks.trim()
    ) {
      return next(
        new AppError(
          'Resolution remarks are required',
          400
        )
      );
    }

    const issue =
      await Issue.findById(
        req.params.id
      );

    if (!issue) {
      return next(
        new AppError(
          `No issue found with id ${req.params.id}`,
          404
        )
      );
    }

    if (
      issue.assignedOfficer?.toString() !==
      req.user.id
    ) {
      return next(
        new AppError(
          'You are not authorized to resolve this issue',
          403
        )
      );
    }

    if (
      issue.status === 'Resolved'
    ) {
      return next(
        new AppError(
          'This issue is already resolved',
          400
        )
      );
    }

    issue.status = 'Resolved';

    issue.resolutionDetails = {
      remarks: remarks.trim(),

      imageUrls:
        uploadedImages,

      // Backward compatibility
      imageUrl:
        uploadedImages[0] || null,

      resolvedAt: Date.now()
    };

    issue.statusHistory.push({
      status: 'Resolved',
      changedBy:
        req.user.id,
      remarks:
        remarks.trim()
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