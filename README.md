# Issue Tracker

A Single Page Application (SPA) with a REST API backend, Role-Based Access Control (RBAC), structured logging, security features, and automated CI/CD.

## Technology Stack
- Frontend: React 18 (Vite), Nginx (Alpine)
- Backend: Node.js, Express.js
- Database: SQLite3
- Authentication & Security: JWT (JSON Web Tokens), bcryptjs, express-rate-limit
- Email Service: Nodemailer (Ethereal test SMTP)
- Structured Logging: Winston (JSON format)
- Testing & CI/CD: Jest, Supertest, GitHub Actions
- Containerization: Docker, Docker Compose

## Requirements
- Docker and Docker Compose
- Node.js (version 20.17.0 or higher) 
- npm (for local development without Docker)

## Installation and Setup

1. Start all services using Docker Compose:
```bash
docker compose up --build
```

2. Access the application:
- Frontend (SPA): Open your browser and go to http://localhost:5173
- Backend (REST API): http://localhost:5000/api/issues

## Functional Features
- Full CRUD cycle without page reload (Single Page Application architecture)
- Issue creation with priority, status, deadline, and file attachment
- Real-time search by keyword and filtering by status and priority
- Issue editing via modal dialog without page refresh
- Issue deletion with automatic file cleanup from disk
- Server-side input validation and file format verification
- Informative animated toast notifications for success and error messages
- Multi-container Docker deployment with multi-stage build
- Role-Based Access Control (RBAC) based on temporary JWT keys
- HTTP Error Semantics: Strict compliance with RFC standards
- Brute-Force Protection: IP-based rate limiting on login endpoint
- Active Session Management: Tracking of client IP addresses and User-Agent headers with real-time remote session revocation
- Password Reset via Email: Time-limited crypto tokens sent via Nodemailer
- Structured Logging