const request = require('supertest');
const app = require('../src/index');

describe('--- API testing ---', () => {
    let adminToken = '';
    let devToken = '';
    let viewerToken = '';
    let createdIssueId = null;

    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('1. POST /api/auth/login - should authenticate admin and return 200 with JWT', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@tracker.com', password: 'Admin123!' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.role).toBe('admin');
        adminToken = res.body.token;
    });

    it('2. POST /api/auth/login - should authenticate developer and viewer', async () => {
        const devRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'dev@tracker.com', password: 'Dev123!' });
        expect(devRes.statusCode).toBe(200);
        devToken = devRes.body.token;

        const viewerRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'viewer@tracker.com', password: 'Viewer123!' });
        expect(viewerRes.statusCode).toBe(200);
        viewerToken = viewerRes.body.token;
    });

    it('3. POST /api/auth/login - should return 401 for incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@tracker.com', password: 'WRONG_PASSWORD' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('4. GET /api/issues - should return 401 when token is missing', async () => {
        const res = await request(app).get('/api/issues');
        expect(res.statusCode).toBe(401);
    });

    it('5. POST /api/issues - viewer role must be forbidden (403)', async () => {
        const res = await request(app)
            .post('/api/issues')
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({
                title: 'Malicious issue by viewer',
                description: 'Viewer should not be able to post this',
                priority: 'low',
                status: 'open',
                due_date: '2026-12-31'
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain('Forbidden');
    });

    it('6. POST /api/issues - admin should create issue and return 201', async () => {
        const res = await request(app)
            .post('/api/issues')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Critical production memory leak')
            .field('description', 'Memory rises to 100% under high concurrency.')
            .field('priority', 'critical')
            .field('status', 'open')
            .field('due_date', '2026-10-15');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        createdIssueId = res.body.data.id;
    });

    it('7. DELETE /api/issues/:id - developer cannot delete issue (403)', async () => {
        const res = await request(app)
            .delete(`/api/issues/${createdIssueId}`)
            .set('Authorization', `Bearer ${devToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('8. DELETE /api/issues/:id - admin can delete issue (200)', async () => {
        const res = await request(app)
            .delete(`/api/issues/${createdIssueId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});