const db = require('../../db');

const createCourse = async (req, res) => {
  try {
    const {
      id,
      title,
      code,
      short_description,
      long_description,
      category,
      level,
      language,
      type,
      duration_hours,
      duration_weeks,
      format,
      max_students,
      prerequisites,
      skills_covered,
      certificate_template,
      certificate_title,
      ceu_credits,
      price,
      currency,
      active,
      enrollment_open,
      created_by,
      updated_by,
    } = req.body;

    const newCourse = await db.query(
      'INSERT INTO courses (id, title, code, short_description, long_description, category, level, language, type, duration_hours, duration_weeks, format, max_students, prerequisites, skills_covered, certificate_template, certificate_title, ceu_credits, price, currency, active, enrollment_open, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *',
      [
        id,
        title,
        code,
        short_description,
        long_description,
        category,
        level,
        language,
        type,
        duration_hours,
        duration_weeks,
        format,
        max_students,
        prerequisites,
        skills_covered,
        certificate_template,
        certificate_title,
        ceu_credits,
        price,
        currency,
        active,
        enrollment_open,
        created_by,
        updated_by,
      ]
    );

    res.status(201).json(newCourse.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM courses');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
};
