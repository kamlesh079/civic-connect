const express = require('express');

const {
  getAssignedIssues,
  getIssueDetails,
  updateIssueStatus,
  resolveIssue,
  getDashboardStats
} = require('../controllers/officerController');

const {
  protect,
  authorize
} = require('../middlewares/auth');

const {
  uploadResolutionImages
} = require('../middlewares/upload');

const router = express.Router();

router.use(protect);

router.use(
  authorize('Officer')
);

router.get(
  '/stats',
  getDashboardStats
);

router.get(
  '/issues',
  getAssignedIssues
);

router.get(
  '/issues/:id',
  getIssueDetails
);

router.patch(
  '/issues/:id/status',
  updateIssueStatus
);

router.patch(
  '/issues/:id/resolve',
  uploadResolutionImages,
  resolveIssue
);

module.exports = router;