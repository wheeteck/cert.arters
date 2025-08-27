const db = require('../../db');

const createStudent = async (req, res) => {
  try {
    const {
      id,
      email,
      name,
      phone,
      registration_date,
      student_type,
      status,
      preferred_learning_mode,
      notes,
      interested_categories,
      communication_preferences,
    } = req.body;

    const newStudent = await db.query(
      'INSERT INTO students (id, email, name, phone, registration_date, student_type, status, preferred_learning_mode, notes, interested_categories, communication_preferences) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [
        id,
        email,
        name,
        phone,
        registration_date,
        student_type,
        status,
        preferred_learning_mode,
        notes,
        interested_categories,
        communication_preferences,
      ]
    );

    res.status(201).json(newStudent.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM students');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
};
