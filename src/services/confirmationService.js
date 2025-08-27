const db = require('../../db');
const crypto = require('crypto');
const { findOrCreateStudent } = require('./studentService');
const { findCourseById } = require('./courseService');

const createConfirmationRequest = async (webhookData) => {
  const { student: studentData, course: courseData } = webhookData;

  // 1. Find or create student and find course
  const studentId = await findOrCreateStudent(studentData);
  const courseId = await findCourseById(courseData.id);

  if (!courseId) {
    throw new Error(`Course with ID ${courseData.id} not found.`);
  }

  // 2. Generate unique confirmation token
  const confirmation_token = crypto.randomBytes(32).toString('hex');
  const request_id = `REQ-${Date.now()}`;
  const confirmation_deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  // 3. Store confirmation request in the database
  const text = `
    INSERT INTO certificate_confirmations(
      request_id, student_id, course_id, original_student_name, original_student_email,
      original_course_title, completion_date, grade, score, confirmation_token, confirmation_deadline
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
  `;
  const values = [
    request_id, studentId, courseId, studentData.name, studentData.email,
    courseData.title, courseData.completion_date, courseData.grade, courseData.score,
    confirmation_token, confirmation_deadline
  ];

  const result = await db.query(text, values);
  const confirmationId = result.rows[0].id;

  // 4. "Send" confirmation email (mock for now)
  sendConfirmationEmail(studentData.email, confirmation_token);

  return { confirmationId, confirmation_token };
};

const sendConfirmationEmail = (email, token) => {
  const confirmationUrl = `https://certs.arters.live/confirm/${token}`;
  console.log(`
    ================================================
    Sending confirmation email to: ${email}
    Confirmation URL: ${confirmationUrl}
    ================================================
  `);
};

const processStudentConfirmation = async (token, responseData) => {
  const { action, corrections } = responseData;

  // 1. Find the confirmation request by token
  const text = 'SELECT * FROM certificate_confirmations WHERE confirmation_token = $1';
  const result = await db.query(text, [token]);

  if (result.rows.length === 0) {
    throw new Error('Invalid confirmation token.');
  }

  const confirmation = result.rows[0];

  // 2. Check if the request is still valid
  if (new Date() > new Date(confirmation.confirmation_deadline)) {
    throw new Error('Confirmation deadline has passed.');
  }
  if (confirmation.status !== 'pending') {
      throw new Error(`Confirmation has already been processed with status: ${confirmation.status}`);
  }


  // 3. Process the action
  let status, wants_certificate, ready_for_batch, updateQuery, values;
  const confirmed_at = new Date();

  switch (action) {
    case 'confirm':
      status = 'confirmed';
      wants_certificate = true;
      ready_for_batch = true;
      updateQuery = 'UPDATE certificate_confirmations SET status = $1, wants_certificate = $2, ready_for_batch = $3, confirmed_at = $4, student_response = $5 WHERE id = $6';
      values = [status, wants_certificate, ready_for_batch, confirmed_at, JSON.stringify(responseData), confirmation.id];
      break;
    case 'confirm_with_corrections':
      status = 'corrected';
      wants_certificate = true;
      ready_for_batch = true; // Or false, if admin review is needed
      updateQuery = 'UPDATE certificate_confirmations SET status = $1, wants_certificate = $2, ready_for_batch = $3, confirmed_at = $4, corrected_name = $5, corrected_email = $6, correction_reason = $7, student_response = $8 WHERE id = $9';
      values = [status, wants_certificate, ready_for_batch, confirmed_at, corrections.student_name, corrections.preferred_email, corrections.correction_reason, JSON.stringify(responseData), confirmation.id];
      break;
    case 'decline':
      status = 'declined';
      wants_certificate = false;
      ready_for_batch = false;
      updateQuery = 'UPDATE certificate_confirmations SET status = $1, wants_certificate = $2, ready_for_batch = $3, declined_at = $4, student_response = $5 WHERE id = $6';
      values = [status, wants_certificate, ready_for_batch, new Date(), JSON.stringify(responseData), confirmation.id];
      break;
    default:
      throw new Error('Invalid action.');
  }

  await db.query(updateQuery, values);

  return { success: true, status, message: `Certificate request has been ${status}.` };
};


module.exports = {
  createConfirmationRequest,
  processStudentConfirmation,
};
