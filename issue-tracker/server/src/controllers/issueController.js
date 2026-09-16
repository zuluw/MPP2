const db = require('../database/db');
const path = require('path');
const fs = require('fs');

exports.getAllIssues = (req, res) => {
    const { status, priority, search } = req.query;
    let sql = "SELECT * FROM issues WHERE 1=1";
    let params = [];

    if (status && status !== 'all') {
        sql += " AND status = ?";
        params.push(status);
    }

    if (priority && priority !== 'all') {
        sql += " AND priority = ?";
        params.push(priority);
    }

    if (search) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database read error', error: err.message });
        }
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
};

exports.getIssueById = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM issues WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: `Issue with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, data: row });
    });
};

exports.createIssue = (req, res) => {
    const { title, description, priority = 'medium', status = 'open', due_date } = req.body;
    const attachmentName = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO issues (title, description, priority, status, due_date, attachment_name)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [title, description, priority, status, due_date, attachmentName], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to create issue', error: err.message });
        }

        db.get("SELECT * FROM issues WHERE id = ?", [this.lastID], (fetchErr, newIssue) => {
            if (fetchErr) {
                return res.status(201).json({ success: true, id: this.lastID });
            }
            res.status(201).json({
                success: true,
                message: 'Issue created successfully',
                data: newIssue
            });
        });
    });
};

exports.updateIssue = (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, due_date } = req.body;

    db.get("SELECT * FROM issues WHERE id = ?", [id], (err, existingIssue) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        if (!existingIssue) {
            return res.status(404).json({ success: false, message: `Issue with ID ${id} not found.` });
        }

        let newAttachment = existingIssue.attachment_name;
        if (req.file) {
            if (existingIssue.attachment_name) {
                const oldFilePath = path.join(__dirname, '../../uploads', existingIssue.attachment_name);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            }
            newAttachment = req.file.filename;
        }

        const sql = `
            UPDATE issues 
            SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, attachment_name = ?
            WHERE id = ?
        `;

        db.run(sql, [
            title || existingIssue.title,
            description || existingIssue.description,
            priority || existingIssue.priority,
            status || existingIssue.status,
            due_date || existingIssue.due_date,
            newAttachment,
            id
        ], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ success: false, message: 'Failed to update issue', error: updateErr.message });
            }

            db.get("SELECT * FROM issues WHERE id = ?", [id], (getErr, updatedIssue) => {
                res.status(200).json({
                    success: true,
                    message: 'Issue updated successfully',
                    data: updatedIssue
                });
            });
        });
    });
};

exports.deleteIssue = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM issues WHERE id = ?", [id], (err, issue) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        if (!issue) {
            return res.status(404).json({ success: false, message: `Issue with ID ${id} not found.` });
        }

        if (issue.attachment_name) {
            const filePath = path.join(__dirname, '../../uploads', issue.attachment_name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        db.run("DELETE FROM issues WHERE id = ?", [id], (delErr) => {
            if (delErr) {
                return res.status(500).json({ success: false, message: 'Failed to delete issue', error: delErr.message });
            }
            res.status(200).json({
                success: true,
                message: `Issue with ID ${id} was deleted successfully.`
            });
        });
    });
};