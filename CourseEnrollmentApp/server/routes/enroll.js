const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

//Enroll in a course
router.post("/:courseId", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const exists = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });
    if (exists) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: course._id,
    });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// My Courses
router.get("/my-courses", protect, async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate(
    "course"
  );
  res.json(enrollments.map((e) => e.course));
});

module.exports = router;
