const express = require('express');
const {
  getAllIssues,
  assignOfficer,
  updatePriority,
  getIssueStats
} = require('../controllers/adminIssueController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/', getAllIssues);
router.get('/stats', getIssueStats);
router.patch('/:id/assign', assignOfficer);
router.patch('/:id/priority', updatePriority);

module.exports = router;