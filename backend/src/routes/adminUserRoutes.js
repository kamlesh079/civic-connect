const express = require('express');
const { getUsers, updateUser } = require('../controllers/adminUserController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .patch(updateUser);

module.exports = router;