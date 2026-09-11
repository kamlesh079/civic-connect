const express = require('express');

const {
  createIssue,
  getMyIssues,
  getIssue,
  upvoteIssue,
  reopenIssue
} = require('../controllers/issueController');

const {
  addComment
} = require('../controllers/commentController');

const {
  protect
} = require('../middlewares/auth');

const {
  uploadIssueImages
} = require('../middlewares/upload');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  uploadIssueImages,
  createIssue
);

router.get(
  '/my',
  getMyIssues
);

router.get(
  '/:id',
  getIssue
);

router.post(
  '/:id/upvote',
  upvoteIssue
);

router.post(
  '/:id/reopen',
  reopenIssue
);

router.post(
  '/:id/comments',
  addComment
);

module.exports = router;