import React, { useState } from 'react';
import { loginUser, registerUser, requestPasswordReset, submitPasswordReset } from '../api/auth';

export default function AuthModal({ onLoginSuccess, showToast }) {
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleQuickLogin = async (demoEmail, demoPassword) => {
        try {
            const data = await loginUser(demoEmail, demoPassword);
            showToast(`Signed in as ${data.user.role.toUpperCase()}`);
            onLoginSuccess(data.token, data.user);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (tab === 'login') {
                const data = await loginUser(email, password);
                showToast('Welcome back!');
                onLoginSuccess(data.token, data.user);
            } else if (tab === 'register') {
                await registerUser(email, password, 'viewer');
                showToast('Account created! Please sign in.');
                setTab('login');
            } else if (tab === 'forgot') {
                const res = await requestPasswordReset(email);
                showToast('Password reset link generated!');
                if (res.previewUrl) setPreviewUrl(res.previewUrl);
                setTab('reset');
            } else if (tab === 'reset') {
                await submitPasswordReset(resetToken, newPassword);
                sessionStorage.setItem('kick_reason', 'Password changed successfully! Please sign in with your new password.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
            <div className="card shadow-sm" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--accent)' }}>
                    {tab === 'login' && 'Sign In'}
                    {tab === 'register' && 'Create Account'}
                    {tab === 'forgot' && 'Reset Password'}
                    {tab === 'reset' && 'Set New Password'}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    {tab === 'login' && 'Enter your credentials or use quick demo accounts.'}
                    {tab === 'register' && 'New accounts are assigned the Viewer role by default.'}
                    {tab === 'forgot' && 'Enter your email to receive a password recovery link.'}
                    {tab === 'reset' && 'Enter the reset token received via email.'}
                </p>

                {tab === 'login' && (
                    <div style={{ background: '#0b1120', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, textAlign: 'center' }}>
                            Demo Accounts (RBAC Testing):
                        </small>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                            <button type="button" className="btn btn-sm badge-critical" onClick={() => handleQuickLogin('admin@tracker.com', 'Admin123!')}>Admin</button>
                            <button type="button" className="btn btn-sm badge-in_progress" onClick={() => handleQuickLogin('dev@tracker.com', 'Dev123!')}>Developer</button>
                            <button type="button" className="btn btn-sm badge-closed" onClick={() => handleQuickLogin('viewer@tracker.com', 'Viewer123!')}>Viewer</button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {tab !== 'reset' && (
                        <div className="form-group">
                            <label>EMAIL</label>
                            <input type="email" className="form-control" placeholder="name@tracker.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                    )}

                    {(tab === 'login' || tab === 'register') && (
                        <div className="form-group">
                            <label>PASSWORD</label>
                            <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    )}

                    {tab === 'reset' && (
                        <>
                            {previewUrl && (
                                <div style={{ background: '#1e3a5f', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                    ✉️ Ethereal Email Ready: <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>View Email in Browser</a>
                                </div>
                            )}
                            <div className="form-group">
                                <label>RESET TOKEN (from email)</label>
                                <input type="text" className="form-control" placeholder="Paste 64-character token" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>NEW PASSWORD</label>
                                <input type="password" className="form-control" placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.8rem', width: '100%' }}>
                        {tab === 'login' && 'Sign In'}
                        {tab === 'register' && 'Register'}
                        {tab === 'forgot' && 'Send Recovery Email'}
                        {tab === 'reset' && 'Update Password'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    {tab === 'login' ? (
                        <>
                            <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setTab('register')}>Create Account</span>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setTab('forgot')}>Forgot Password?</span>
                        </>
                    ) : (
                        <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setTab('login')}>← Back to Sign In</span>
                    )}
                </div>
            </div>
        </div>
    );
}