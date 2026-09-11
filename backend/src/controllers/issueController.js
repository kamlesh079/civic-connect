const Issue = require("../models/Issue");
const AppError = require("../utils/AppError");
const { getPublicFileUrl } = require("../middlewares/upload");

const parseLocation = (location) => {
  if (!location) {
    return location;
  }

  if (typeof location === "object") {
    return location;
  }

  try {
    return JSON.parse(location);
  } catch (error) {
    throw new AppError("Location must be valid JSON", 400);
  }
};

const getUploadedImageUrls = (req) => {
  if (!req.files || req.files.length === 0) {
    return [];
  }

  return req.files.map((file) => getPublicFileUrl(req, file));
};

const getLegacyImageUrls = (images) => {
  if (!images) {
    return [];
  }

  const values = Array.isArray(images) ? images : [images];

  return values.filter((image) => {
    if (typeof image !== "string") {
      return false;
    }

    try {
      const url = new URL(image);

      return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
      return image.startsWith("/uploads/");
    }
  });
};

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (Citizen)
// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private (Citizen)
exports.createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      images,
      location,
      address,
      priority,
    } = req.body;

    const uploadedImages = getUploadedImageUrls(req);

    /*
     * Backward compatibility:
     *
     * Existing JSON clients that send image URLs
     * can still create an issue.
     *
     * New clients use actual uploaded files.
     */
    const legacyImages =
      uploadedImages.length === 0 ? getLegacyImageUrls(images) : [];

    const allImages = [...uploadedImages, ...legacyImages];

    if (allImages.length > 5) {
      return next(new AppError("You can upload a maximum of 5 images", 400));
    }

    const parsedLocation = parseLocation(location);

    let normalizedLocation;

    if (parsedLocation && typeof parsedLocation === "object") {
      const coordinates = parsedLocation.coordinates;

      if (Array.isArray(coordinates) && coordinates.length === 2) {
        const longitude = Number(coordinates[0]);

        const latitude = Number(coordinates[1]);

        if (
          Number.isFinite(longitude) &&
          Number.isFinite(latitude) &&
          longitude >= -180 &&
          longitude <= 180 &&
          latitude >= -90 &&
          latitude <= 90
        ) {
          normalizedLocation = {
            type: "Point",
            coordinates: [longitude, latitude],
          };
        } else {
          return next(new AppError("Location coordinates are invalid", 400));
        }
      } else if (coordinates !== undefined) {
        return next(
          new AppError(
            "Location must contain longitude and latitude coordinates",
            400,
          ),
        );
      }
    }

    const issueData = {
      title,
      description,
      category,
      images: allImages,
      priority,
      reportedBy: req.user.id,
    };

    /*
     * Location is optional.
     *
     * This means issue creation continues
     * even when browser location permission
     * is denied.
     */
    if (normalizedLocation) {
      issueData.location = normalizedLocation;
    }

    if (typeof address === "string" && address.trim()) {
      issueData.address = address.trim();
    }

    const issue = await Issue.create(issueData);

    res.status(201).json({
      success: true,
      data: issue,
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100,
    );

    const startIndex = (page - 1) * limit;

    const filter = {
      reportedBy: req.user.id,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const issues = await Issue.find(filter)
      .populate("category", "name")
      .skip(startIndex)
      .limit(limit)
      .sort("-createdAt");

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: issues.length,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },

      data: issues,
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
      .populate("category", "name")
      .populate("reportedBy", "name")
      .populate("assignedOfficer", "name department")
      .populate({
        path: "comments",
        select: "text createdAt",
        populate: {
          path: "user",
          select: "name role",
        },
      });

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

// @desc    Toggle upvote on an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
exports.upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    const hasUpvoted = issue.upvotes.some(
      (id) => id.toString() === req.user.id,
    );

    if (hasUpvoted) {
      issue.upvotes = issue.upvotes.filter(
        (id) => id.toString() !== req.user.id,
      );
    } else {
      issue.upvotes.push(req.user.id);
    }

    await issue.save();

    res.status(200).json({
      success: true,
      upvotes: issue.upvotes.length,
      data: issue,
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

    if (issue.reportedBy.toString() !== req.user.id) {
      return next(
        new AppError("You are not authorized to modify this issue", 403),
      );
    }

    if (issue.status !== "Resolved") {
      return next(
        new AppError(
          `Cannot reopen an issue with status: ${issue.status}. Only Resolved issues can be reopened.`,
          400,
        ),
      );
    }

    issue.status = "Reopened";

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue successfully reopened",
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};
