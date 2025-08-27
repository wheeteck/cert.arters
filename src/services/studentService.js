const db = require('../../db');

const findOrCreateStudent = async (studentData) => {
  const { name, email, student_id } = studentData;

  // First, try to find the student by email
  let student = await db.query('SELECT id FROM students WHERE email = $1', [email]);

  if (student.rows.length > 0) {
    return student.rows[0].id;
  }

  // If not found, try to find by student_id if provided
  if (student_id) {
    student = await db.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (student.rows.length > 0) {
      return student.rows[0].id;
    }
  }

  // If still not found, create a new student
  const newStudentId = student_id || `ST-${Date.now()}`; // Generate a new ID if not provided
  const registration_date = new Date();
  const text = 'INSERT INTO students(id, name, email, registration_date) VALUES($1, $2, $3, $4) RETURNING id';
  const values = [newStudentId, name, email, registration_date];
  const newStudent = await db.query(text, values);

  return newStudent.rows[0].id;
};

module.exports = {
  findOrCreateStudent,
};
