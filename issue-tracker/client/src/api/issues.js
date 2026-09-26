const API_BASE_URL = 'http://localhost:5000/api/issues';

function getAuthHeaders(token, isJson = false) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
}

async function handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorMessage = data.errors 
            ? data.errors.join(' | ') 
            : data.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
    }
    return data;
}

export async function fetchIssues(filters = {}, token) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
    const response = await fetch(url, {
        headers: getAuthHeaders(token)
    });
    return handleResponse(response);
}

export async function createIssue(formData, token) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData
    });
    return handleResponse(response);
}

export async function updateIssue(id, formData, token) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: formData
    });
    return handleResponse(response);
}

export async function deleteIssue(id, token) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    return handleResponse(response);
}