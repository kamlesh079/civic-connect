const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.ObjectId,
      ref: 'Issue',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Please provide comment text'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  { timestamps: true }
);

// Index to quickly fetch all comments for a specific issue
commentSchema.index({ issue: 1 });

module.exports = mongoose.model('Comment', commentSchema);