const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.get('/:id/doctors', patientController.getPatientDoctors);
router.get('/', patientController.getMalePatients);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
