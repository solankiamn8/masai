const express = require('express');
const router = express.Router();
const lCtrl = require('../controllers/learnerController');

router.post('/', lCtrl.createLearner);
router.delete('/:id', lCtrl.deleteLearner);

module.exports = router;
