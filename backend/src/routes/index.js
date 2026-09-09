const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const issueRoutes = require('./issueRoutes');
const officerRoutes = require('./officerRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const adminIssueRoutes = require('./adminIssueRoutes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/issues', issueRoutes); // Citizen routes
router.use('/officer', officerRoutes);

// Admin namespace
router.use('/admin/users', adminUserRoutes);
router.use('/admin/issues', adminIssueRoutes);

module.exports = router;