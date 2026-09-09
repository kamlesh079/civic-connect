const express = require('express');
const {
  createIssue,
  getMyIssues,
  getIssue,
  upvoteIssue,
  reopenIssue
} = require('../controllers/issueController');
const { addComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All citizen issue routes require the user to be logged in
router.use(protect);

router.post('/', createIssue);
router.get('/my', getMyIssues);
router.get('/:id', getIssue);
router.post('/:id/upvote', upvoteIssue);
router.post('/:id/reopen', reopenIssue);
router.post('/:id/comments', addComment);

module.exports = router;