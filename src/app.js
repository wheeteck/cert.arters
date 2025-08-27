const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('../db');
const { createConfirmationRequest, processStudentConfirmation } = require('./services/confirmationService');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const batchRoutes = require('./routes/batchRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Arters Certificate Service.' });
});

app.post('/api/webhook/course-completion', async (req, res) => {
  const { body } = req;
  const source_ip = req.ip;

  try {
    // 1. Validation
    if (!body.student || !body.course) {
      return res.status(400).json({ success: false, message: 'Missing student or course information.' });
    }

    // 2. Log the webhook request
    const logText = 'INSERT INTO webhook_logs(payload, source_ip) VALUES($1, $2)';
    await db.query(logText, [JSON.stringify(body), source_ip]);

    // 3. Create a confirmation request
    const { confirmationId, confirmation_token } = await createConfirmationRequest(body);

    res.json({
      success: true,
      confirmation_email_sent: true,
      certificate_request_id: `REQ-${confirmationId}`,
      confirmation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      confirmation_url: `https://certs.arters.live/confirm/${confirmation_token}`,
      status: 'pending_student_confirmation'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
});

app.post('/api/student/confirm/:token', async (req, res) => {
  const { token } = req.params;
  const { body } = req;

  try {
    const result = await processStudentConfirmation(token, body);
    res.json(result);
  } catch (error) {
    console.error('Error processing student confirmation:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Admin routes
app.use('/api/admin/courses', courseRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/admin/batches', batchRoutes);

module.exports = app;
