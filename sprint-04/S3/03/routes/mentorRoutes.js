const express = require('express');
const router = express.Router();
const mCtrl = require('../controllers/mentorController');

router.post('/', mCtrl.createMentor);
router.delete('/:id', mCtrl.deleteMentor);

module.exports = router;
