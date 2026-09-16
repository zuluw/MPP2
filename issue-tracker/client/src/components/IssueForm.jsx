import React, { useState, useRef } from 'react';

export default function IssueForm({ onSubmit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('open');
    const [dueDate, setDueDate] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('priority', priority);
        formData.append('status', status);
        formData.append('due_date', dueDate);

        if (fileInputRef.current && fileInputRef.current.files[0]) {
            formData.append('attachment', fileInputRef.current.files[0]);
        }

        const success = await onSubmit(formData);
        if (success) {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setStatus('open');
            setDueDate('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Report New Issue</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>TITLE *</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Auth token expires unexpectedly"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>DESCRIPTION *</label>
                    <textarea
                        className="form-control"
                        placeholder="Provide detailed reproduction steps..."
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
                    <label>DUE DATE *</label>
                    <input
                        type="date"
                        className="form-control"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>ATTACHMENT (Optional, max 5MB)</label>
                    <input
                        type="file"
                        className="form-control"
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png,.pdf,.zip,.txt,.log"
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Create Issue
                </button>
            </form>
        </div>
    );
}