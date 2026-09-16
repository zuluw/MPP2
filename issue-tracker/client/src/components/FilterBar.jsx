import React from 'react';

export default function FilterBar({ filters, setFilters }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="card filter-bar">
            <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Search issues by title or description..."
                value={filters.search}
                onChange={handleChange}
            />

            <select
                name="status"
                className="form-control"
                value={filters.status}
                onChange={handleChange}
            >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
            </select>

            <select
                name="priority"
                className="form-control"
                value={filters.priority}
                onChange={handleChange}
            >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
            </select>
        </div>
    );
}