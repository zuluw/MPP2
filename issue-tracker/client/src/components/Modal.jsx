import React, { useState } from 'react';

export default function Modal({ issue, onClose, onSave }) {
    if (!issue) return null;

    const [title, setTitle] = useState(issue.title);
    const [description, setDescription] = useState(issue.description);
    const [priority, setPriority] = useState(issue.priority);
    const [status, setStatus] = useState(issue.status);
    const [dueDate, setDueDate] = useState(issue.due_date ? issue.due_date.split('T')[0] : '');

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('priority', priority);
        formData.append('status', status);
        formData.append('due_date', dueDate);

        onSave(issue.id, formData);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '1.2rem' }}>Edit Issue #{issue.id}</h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>TITLE</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>DESCRIPTION</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div className="form-group">
                            <label>PRIORITY</label>
                            <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>STATUS</label>
                            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>DUE DATE</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}