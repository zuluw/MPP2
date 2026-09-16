const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const upload = require('../middleware/upload');
const { validateIssue } = require('../middleware/validator');

router.get('/', issueController.getAllIssues);

router.get('/:id', issueController.getIssueById);

router.post('/', upload.single('attachment'), validateIssue, issueController.createIssue);

router.put('/:id', upload.single('attachment'), validateIssue, issueController.updateIssue);

router.delete('/:id', issueController.deleteIssue);

module.exports = router;