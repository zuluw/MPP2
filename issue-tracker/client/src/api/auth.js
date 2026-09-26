const API_URL = 'http://localhost:5000/api/auth';

async function handleAuthResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
    }
    return data;
}

export async function loginUser(email, password) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleAuthResponse(res);
}

export async function registerUser(email, password, role) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });
    return handleAuthResponse(res);
}

export async function fetchSessions(token) {
    const res = await fetch(`${API_URL}/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleAuthResponse(res);
}

export async function terminateSession(token, sessionId) {
    const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleAuthResponse(res);
}

export async function requestPasswordReset(email) {
    const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleAuthResponse(res);
}

export async function submitPasswordReset(token, newPassword) {
    const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });
    return handleAuthResponse(res);
}