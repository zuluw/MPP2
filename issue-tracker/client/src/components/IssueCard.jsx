import React from 'react';

export default function IssueCard({ issue, onEdit, onDelete }) {
    const formattedDate = new Date(issue.due_date).toLocaleDateString();

    return (
        <div className="issue-card">
            <div className="issue-header">
                <div>
                    <h3 className="issue-title">{issue.title}</h3>
                    <div className="badges" style={{ marginTop: '0.4rem' }}>
                        <span className={`badge badge-${issue.status}`}>
                            {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`badge badge-${issue.priority}`}>
                            {issue.priority}
                        </span>
                    </div>
                </div>
            </div>

            <p className="issue-desc">{issue.description}</p>

            <div className="issue-footer">
                <div>
                    <span style={{ color: 'var(--text-muted)' }}>Due: </span>
                    <strong>{formattedDate}</strong>
                    
                    {issue.attachment_name && (
                        <span style={{ marginLeft: '1rem' }}>
                            📎 <a
                                href={`http://localhost:5000/uploads/${issue.attachment_name}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent)', textDecoration: 'none' }}
                            >
                                Download Attachment
                            </a>
                        </span>
                    )}
                </div>

                <div className="actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(issue)}>
                        Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(issue.id)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}