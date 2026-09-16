const validateIssue = (req, res, next) => {
    const { title, description, priority, status, due_date } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
        errors.push('Title is required and must be at least 3 characters long.');
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
        errors.push('Description is required and must be at least 5 characters long.');
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (priority && !validPriorities.includes(priority)) {
        errors.push(`Priority must be one of: ${validPriorities.join(', ')}.`);
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
    }

    if (!due_date || isNaN(Date.parse(due_date))) {
        errors.push('Due date must be a valid date format (YYYY-MM-DD).');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

module.exports = { validateIssue };