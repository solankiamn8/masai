const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.post('/enroll', enrollmentController.enrollStudent);

module.exports = router;
