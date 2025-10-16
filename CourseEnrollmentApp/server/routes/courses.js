const router = require("express").Router();
const { protect, admin } = require("../middleware/auth");
const Course = require("../models/Course");

//Create course
router.post("/", protect, admin, async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  const { page = 1, limit = 10, keyword } = req.query;
  const query = keyword ? { title: { $regex: keyword, $option: "i" } } : {};
  const courses = await Course.find(query).skip(
    (page - 1) * limit(parseInt(limit))
  );
  res.json(courses);
});

// Update by Id
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete By Id
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
