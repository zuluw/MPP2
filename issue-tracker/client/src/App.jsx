import React, { useState, useEffect } from 'react';
import { fetchIssues, createIssue, updateIssue, deleteIssue } from './api/issues';
import IssueForm from './components/IssueForm';
import IssueCard from './components/IssueCard';
import FilterBar from './components/FilterBar';
import Modal from './components/Modal';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import SessionsModal from './components/SessionsModal';

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

    const [issues, setIssues] = useState([]);
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
    const [editingIssue, setEditingIssue] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showSessionsModal, setShowSessionsModal] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    useEffect(() => {
        const kickReason = sessionStorage.getItem('kick_reason');
        if (kickReason) {
            showToast(kickReason, 'error');
            sessionStorage.removeItem('kick_reason');
        }
    }, []);

    const handleLoginSuccess = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const handleLogout = (reason = 'Signed out.') => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIssues([]);
        setShowSessionsModal(false);
        setEditingIssue(null);
        showToast(reason, reason.includes('revoked') || reason.includes('terminated') ? 'error' : 'success');
    };

    useEffect(() => {
        if (!token) return;

        const checkSession = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    clearInterval(interval);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.setItem('kick_reason', 'Session was terminated from another device. Please sign in again.');
                    window.location.reload(); 
                }
            } catch (err) {
            
            }
        };

        const interval = setInterval(checkSession, 1000);
        return () => clearInterval(interval);
    }, [token]);

    const loadIssues = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetchIssues(filters, token);
            setIssues(res.data || []);
        } catch (err) {
            showToast(err.message, 'error');
            if (err.message.includes('expired') || err.message.includes('401') || err.message.includes('revoked')) {
                handleLogout('Session expired or revoked.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadIssues();
        }
    }, [filters, token]);

    const handleCreate = async (formData) => {
        try {
            const res = await createIssue(formData, token);
            showToast(res.message || 'Issue created successfully!');
            loadIssues();
            return true;
        } catch (err) {
            showToast(err.message, 'error');
            return false;
        }
    };

    const handleUpdate = async (id, formData) => {
        try {
            const res = await updateIssue(id, formData, token);
            showToast(res.message || 'Issue updated successfully!');
            setEditingIssue(null);
            loadIssues();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            const res = await deleteIssue(id, token);
            showToast(res.message || 'Issue deleted successfully!');
            loadIssues();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="container">
            <Toast toast={toast} onClose={() => setToast(null)} />

            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--card-bg)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--accent)', margin: 0 }}>Issue Tracker</h2>

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>
                            {user.email} <span className={`badge badge-${user.role === 'admin' ? 'critical' : user.role === 'developer' ? 'in_progress' : 'closed'}`}>{user.role}</span>
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowSessionsModal(true)}>
                            Devices
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleLogout('Signed out.')}>
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            {!user ? (
                <AuthModal
                    onLoginSuccess={handleLoginSuccess}
                    showToast={showToast}
                />
            ) : (
                <div className="layout">
                    <aside>
                        <IssueForm userRole={user.role} onSubmit={handleCreate} />
                    </aside>

                    <main>
                        <FilterBar filters={filters} setFilters={setFilters} />

                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading issues...</p>
                        ) : issues.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                No issues found matching the criteria.
                            </div>
                        ) : (
                            <div className="issues-grid">
                                {issues.map(issue => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        userRole={user.role}
                                        onEdit={setEditingIssue}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            )}

            <Modal
                issue={editingIssue}
                onClose={() => setEditingIssue(null)}
                onSave={handleUpdate}
            />

            <SessionsModal
                isOpen={showSessionsModal}
                onClose={() => setShowSessionsModal(false)}
                token={token}
                showToast={showToast}
                onLogout={handleLogout}
            />
        </div>
    );
}