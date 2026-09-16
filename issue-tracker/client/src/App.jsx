import React, { useState, useEffect } from 'react';
import { fetchIssues, createIssue, updateIssue, deleteIssue } from './api/issues';
import IssueForm from './components/IssueForm';
import IssueCard from './components/IssueCard';
import FilterBar from './components/FilterBar';
import Modal from './components/Modal';
import Toast from './components/Toast';

export default function App() {
    const [issues, setIssues] = useState([]);
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
    const [editingIssue, setEditingIssue] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const loadIssues = async () => {
        try {
            const res = await fetchIssues(filters);
            setIssues(res.data || []);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIssues();
    }, [filters]);

    const handleCreate = async (formData) => {
        try {
            const res = await createIssue(formData);
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
            const res = await updateIssue(id, formData);
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
            const res = await deleteIssue(id);
            showToast(res.message || 'Issue deleted successfully!');
            loadIssues();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="container">
            <Toast toast={toast} onClose={() => setToast(null)} />

            <header>
                <h1>Issue Tracker</h1>
            </header>

            <div className="layout">
                <aside>
                    <IssueForm onSubmit={handleCreate} />
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
                                    onEdit={setEditingIssue}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <Modal
                issue={editingIssue}
                onClose={() => setEditingIssue(null)}
                onSave={handleUpdate}
            />
        </div>
    );
}