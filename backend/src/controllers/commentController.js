const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const AppError = require('../utils/AppError');

// @desc    Add a comment to an issue
// @route   POST /api/issues/:id/comments
// @access  Private (Citizen/Officer/Admin)
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new AppError('Please provide comment text', 400));
    }

    // Verify the issue exists
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return next(new AppError(`No issue found with id ${req.params.id}`, 404));
    }

    const comment = await Comment.create({
      issue: req.params.id,
      user: req.user.id,
      text
    });

    // Populate the user data before returning the response
    await comment.populate('user', 'name role');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};