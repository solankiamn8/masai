const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/', doctorController.createDoctor);
router.get('/:id/patients', doctorController.getDoctorPatients);
router.get('/:id/consultations/count', doctorController.getDoctorConsultationCount);
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;
