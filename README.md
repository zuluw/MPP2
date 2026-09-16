# Issue Tracker

A Single Page Application (SPA) with a REST API backend and Docker containerization. This project was developed as part of Laboratory Work #2.

## Technology Stack
- Frontend: React 18 (Vite)
- Web Server (Frontend): Nginx (Alpine)
- Backend: Node.js, Express.js
- Database: SQLite3
- File Handling: Multer
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