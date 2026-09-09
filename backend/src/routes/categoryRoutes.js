const express = require('express');
const { getCategories, createCategory, updateCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All routes require login

// Citizens and Officers can read categories; only Admins can write
router.route('/')
  .get(getCategories)
  .post(authorize('Admin'), createCategory);

router.route('/:id')
  .put(authorize('Admin'), updateCategory);

module.exports = router;