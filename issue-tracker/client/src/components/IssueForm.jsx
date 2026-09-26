import React, { useState, useRef } from 'react';

export default function IssueForm({ userRole, onSubmit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('open');
    const [dueDate, setDueDate] = useState('');
    const fileInputRef = useRef(null);

    const isViewer = userRole === 'viewer';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewer) return;

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

            {isViewer && (
                <div style={{ background: '#3b2a1a', borderLeft: '4px solid #f59e0b', padding: '0.6rem 0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', color: '#fde68a' }}>
                    You are signed in as <strong>Viewer</strong>. Creating issues is disabled for your role.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>TITLE *</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Auth token expires unexpectedly"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={isViewer}
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
                        disabled={isViewer}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className="form-group">
                        <label>PRIORITY</label>
                        <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)} disabled={isViewer}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>STATUS</label>
                        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} disabled={isViewer}>
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
                        onClick={e => e.target.showPicker && e.target.showPicker()}
                        disabled={isViewer}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>ATTACHMENT (Optional, max 5MB)</label>
                    <input
                        type="file"
                        className="form-control"
                        ref={fileInputRef}
                        disabled={isViewer}
                        accept=".jpg,.jpeg,.png,.pdf,.zip,.txt,.log"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                        marginTop: '0.5rem',
                        opacity: isViewer ? 0.4 : 1,
                        cursor: isViewer ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isViewer}
                >
                    Create Issue
                </button>
            </form>
        </div>
    );
}