const request = require('supertest');
const app = require('../src/app');
const db = require('../db');

// Mock the db module
jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return a welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Welcome to Arters Certificate Service.');
    });
  });

  describe('POST /api/webhook/course-completion', () => {
    it('should return 400 if student or course info is missing', async () => {
      const res = await request(app)
        .post('/api/webhook/course-completion')
        .send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should process the webhook and return a success response', async () => {
      const webhookPayload = {
        student: { name: 'John Doe', email: 'john.doe@example.com', student_id: 'ST123' },
        course: { id: 'CS101', title: 'Intro to Computer Science', completion_date: '2025-08-27' },
      };

      // Mock database calls
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // For webhook log
      db.query.mockResolvedValueOnce({ rows: [{ id: 'ST123' }] }); // findOrCreateStudent
      db.query.mockResolvedValueOnce({ rows: [{ id: 'CS101' }] }); // findCourseById
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // createConfirmationRequest

      const res = await request(app)
        .post('/api/webhook/course-completion')
        .send(webhookPayload);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('status', 'pending_student_confirmation');
    });
  });
});
