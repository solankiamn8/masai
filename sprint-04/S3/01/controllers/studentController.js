const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    await Enrollment.updateMany({ studentId: student._id }, { isActive: false });

    res.json({ message: 'Student and related enrollments marked inactive' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.params.id, isActive: true })
      .populate({
        path: 'courseId',
        match: { isActive: true }
      });

    const courses = enrollments.map(e => e.courseId).filter(Boolean);

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
