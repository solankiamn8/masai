const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');

exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !student.isActive) return res.status(400).json({ error: 'Invalid or inactive student' });
    if (!course || !course.isActive) return res.status(400).json({ error: 'Invalid or inactive course' });

    const enrollment = new Enrollment({ studentId, courseId });
    await enrollment.save();

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
