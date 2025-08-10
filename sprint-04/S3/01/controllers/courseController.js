const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    await Enrollment.updateMany({ courseId: course._id }, { isActive: false });

    res.json({ message: 'Course and related enrollments marked inactive' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseStudents = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ courseId: req.params.id, isActive: true })
      .populate({
        path: 'studentId',
        match: { isActive: true }
      });

    const students = enrollments.map(e => e.studentId).filter(Boolean);

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
