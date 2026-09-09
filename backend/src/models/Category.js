const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);