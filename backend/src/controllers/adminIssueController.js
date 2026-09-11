const Issue = require("../models/Issue");
const AppError = require("../utils/AppError");
const User = require("../models/User");

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
    if (req.query.assignedOfficer)
      filter.assignedOfficer = req.query.assignedOfficer;

    const issues = await Issue.find(filter)
      .populate("category", "name")
      .populate("reportedBy", "name email")
      .populate("assignedOfficer", "name department")
      .skip(startIndex)
      .limit(limit)
      .sort("-createdAt");

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: issues.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get a single issue for Admin review
// @route   GET /api/admin/issues/:id
// @access  Private (Admin)
exports.getIssueDetails = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("category", "name")
      .populate("reportedBy", "name email")
      .populate("assignedOfficer", "name department")
      .populate({
        path: "statusHistory.changedBy",
        select: "name role",
      })
      .populate({
        path: "comments",
        select: "text createdAt",
        populate: {
          path: "user",
          select: "name role",
        },
      });

    if (!issue) {
      return next(
        new AppError(
          `No issue found with id ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status as Admin
// @route   PATCH /api/admin/issues/:id/status
// @access  Private (Admin)
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    if (!status) {
      return next(
        new AppError("Please provide a new status", 400)
      );
    }

    const allowedStatuses = [
      "Under Review",
      "Rejected",
      "Reopened",
    ];

    if (!allowedStatuses.includes(status)) {
      return next(
        new AppError(
          "Invalid Admin status update",
          400
        )
      );
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return next(
        new AppError(
          `No issue found with id ${req.params.id}`,
          404
        )
      );
    }

    // Submitted → Under Review
    if (status === "Under Review") {
      if (issue.status !== "Submitted") {
        return next(
          new AppError(
            `An issue with status "${issue.status}" cannot be moved to Under Review`,
            400
          )
        );
      }
    }

    // Submitted / Under Review → Rejected
    if (status === "Rejected") {
      if (!["Submitted", "Under Review"].includes(issue.status)) {
        return next(
          new AppError(
            `An issue with status "${issue.status}" cannot be rejected`,
            400
          )
        );
      }

      if (!remarks || !remarks.trim()) {
        return next(
          new AppError(
            "A rejection reason is required",
            400
          )
        );
      }

      // A rejected issue should not remain assigned.
      issue.assignedOfficer = null;
    }

    // Resolved → Reopened
    if (status === "Reopened") {
      if (issue.status !== "Resolved") {
        return next(
          new AppError(
            `Only resolved issues can be reopened. Current status: ${issue.status}`,
            400
          )
        );
      }

      // Admin will review/reassign it again.
      issue.assignedOfficer = null;
    }

    issue.status = status;

    issue.statusHistory.push({
      status,
      changedBy: req.user.id,
      remarks:
        remarks?.trim() ||
        `Status changed to ${status} by Admin`,
    });

    await issue.save();

    await issue.populate("category", "name");
    await issue.populate("reportedBy", "name email");
    await issue.populate(
      "assignedOfficer",
      "name department"
    );

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign, reassign, or unassign an officer
// @route   PATCH /api/admin/issues/:id/assign
// @access  Private (Admin)
exports.assignOfficer = async (req, res, next) => {
  try {
    const { officerId } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    /*
     * Empty officerId means the admin
     * intentionally wants to unassign
     * the issue.
     */
    const isUnassigning = !officerId || officerId.trim() === "";

    if (isUnassigning) {
      issue.assignedOfficer = null;

      /*
       * If the issue was only assigned,
       * move it back to Submitted.
       *
       * Don't overwrite statuses such as
       * In Progress or Resolved.
       */
      if (issue.status === "Assigned") {
        issue.status = "Submitted";
      }

      issue.statusHistory.push({
        status: issue.status,
        changedBy: req.user.id,
        remarks: "Issue unassigned from officer",
      });
    } else {
      /*
       * Make sure the selected user
       * actually exists and is an Officer.
       */
      const officer = await User.findOne({
        _id: officerId,
        role: "Officer",
        isActive: true,
      });

      if (!officer) {
        return next(
          new AppError("Selected officer does not exist or is inactive", 400),
        );
      }

      issue.assignedOfficer = officer._id;

      /*
       * Automatically move newly assigned
       * issues into Assigned status.
       */
      if (["Submitted", "Under Review"].includes(issue.status)) {
        issue.status = "Assigned";
      }

      issue.statusHistory.push({
        status: issue.status,
        changedBy: req.user.id,
        remarks: `Issue assigned/reassigned to officer: ${officer.name}`,
      });
    }

    await issue.save();

    await issue.populate("assignedOfficer", "name department");

    res.status(200).json({
      success: true,
      data: issue,
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
      return next(new AppError("Please provide a priority level", 400));
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true, runValidators: true },
    );

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: issue,
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
    const [
      totalIssues,
      resolvedIssues,
      totalUsers,
      totalOfficers,
      criticalIssues,
    ] = await Promise.all([
      Issue.countDocuments(),

      Issue.countDocuments({
        status: "Resolved",
      }),

      User.countDocuments(),

      User.countDocuments({
        role: "Officer",
      }),

      Issue.countDocuments({
        priority: "Critical",
      }),
    ]);

    const pendingIssues = await Issue.countDocuments({
      status: { $ne: "Resolved" },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOfficers,
        totalIssues,
        pendingIssues,
        resolvedIssues,
        criticalIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};
