import React from 'react';

export default function Toast({ toast, onClose }) {
    if (!toast) return null;

    const isError = toast.type === 'error';

    return (
        <div className={`toast-container ${isError ? 'toast-error' : 'toast-success'}`}>
            <div className="toast-content">
                <strong>{isError ? '⚠️ Error' : '✓ Success'}:</strong> {toast.message}
            </div>
            <button className="toast-close" onClick={onClose}>&times;</button>
        </div>
    );
}