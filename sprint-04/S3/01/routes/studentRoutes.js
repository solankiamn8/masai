const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/', studentController.createStudent);
router.delete('/:id', studentController.deleteStudent);
router.get('/:id/courses', studentController.getStudentCourses);

module.exports = router;
