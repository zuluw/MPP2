const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const upload = require('../middleware/upload');
const { validateIssue } = require('../middleware/validator');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);

router.post(
    '/',
    checkRole(['admin', 'developer']),
    upload.single('attachment'),
    validateIssue,
    issueController.createIssue
);

router.put(
    '/:id',
    checkRole(['admin', 'developer']),
    upload.single('attachment'),
    validateIssue,
    issueController.updateIssue
);

router.delete(
    '/:id',
    checkRole(['admin']),
    issueController.deleteIssue
);

module.exports = router;