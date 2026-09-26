import React, { useEffect, useState } from 'react';
import { fetchSessions, terminateSession } from '../api/auth';

export default function SessionsModal({ isOpen, onClose, token, showToast, onLogout }) {
    if (!isOpen) return null;

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadSessions = async () => {
        try {
            const data = await fetchSessions(token);
            setSessions(data.data || []);
        } catch (err) {
            showToast(err.message, 'error');
            if (err.message.includes('revoked') || err.message.includes('401') || err.message.includes('expired')) {
                onClose();
                if (onLogout) onLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleTerminate = async (sessionId) => {
        try {
            await terminateSession(token, sessionId);
            showToast('Device session terminated.');
            await loadSessions();
        } catch (err) {
            showToast(err.message, 'error');
            if (err.message.includes('revoked') || err.message.includes('401') || err.message.includes('expired')) {
                onClose();
                if (onLogout) onLogout();
            }
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '1rem' }}>Active Device Sessions</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    Control authorized connections to your account. Revoking access from the current device will sign you out immediately.
                </p>

                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading sessions...</p>
                ) : (
                    <div style={{ display: 'grid', gap: '0.8rem', maxHeight: '350px', overflowY: 'auto' }}>
                        {sessions.map(s => (
                            <div key={s.id} style={{ background: '#0b1120', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>IP: {s.ip_address}</div>
                                    <small style={{ color: 'var(--text-muted)', display: 'block' }}>{s.user_agent}</small>
                                    <small style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Connected: {new Date(s.created_at).toLocaleString()}</small>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleTerminate(s.id)}>Revoke</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="modal-actions" style={{ marginTop: '1.2rem' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}