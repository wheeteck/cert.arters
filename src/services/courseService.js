const db = require('../../db');

const findCourseById = async (courseId) => {
  const course = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
  if (course.rows.length > 0) {
    return course.rows[0].id;
  }
  return null;
};

module.exports = {
  findCourseById,
};
