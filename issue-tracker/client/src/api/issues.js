const API_BASE_URL = 'http://localhost:5000/api/issues';

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

export async function fetchIssues(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function createIssue(formData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData 
    });
    return handleResponse(response);
}

export async function updateIssue(id, formData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: formData
    });
    return handleResponse(response);
}

export async function deleteIssue(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
    });
    return handleResponse(response);
}