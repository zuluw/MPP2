const { validateIssue } = require('../src/middleware/validator');

describe('--- Validator testing ---', () => {

    const createMockContext = (bodyData) => {
        const req = { body: bodyData };
        const res = {
            statusCode: 200,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                this.body = payload;
                return this;
            }
        };
        const next = jest.fn();
        return { req, res, next };
    };

    it('Unit 1: should call next() when issue data is completely valid', () => {
        const { req, res, next } = createMockContext({
            title: 'Valid Bug Title',
            description: 'This is a valid reproduction description.',
            priority: 'high',
            status: 'open',
            due_date: '2026-12-31'
        });

        validateIssue(req, res, next);

        expect(next).toHaveBeenCalledTimes(1); 
        expect(res.statusCode).toBe(200);
    });

    it('Unit 2: should reject title shorter than 3 characters with 400', () => {
        const { req, res, next } = createMockContext({
            title: 'No',
            description: 'Valid description for the bug report.',
            due_date: '2026-12-31'
        });

        validateIssue(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0]).toContain('Title is required and must be at least 3 characters');
    });

    it('Unit 3: should reject invalid status with 400 Bad Request', () => {
        const { req, res, next } = createMockContext({
            title: 'Valid Title',
            description: 'Valid description here',
            status: 'HACKED_STATUS',
            due_date: '2026-12-31'
        });

        validateIssue(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0]).toContain('Status must be one of');
    });

    it('Unit 4: should reject invalid due_date format', () => {
        const { req, res, next } = createMockContext({
            title: 'Valid Title',
            description: 'Valid description here',
            due_date: 'NOT_A_DATE'
        });

        validateIssue(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0]).toContain('Due date must be a valid date format');
    });
});