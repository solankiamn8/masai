const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/', courseController.createCourse);
router.delete('/:id', courseController.deleteCourse);
router.get('/:id/students', courseController.getCourseStudents);

module.exports = router;
