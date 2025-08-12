const router = require('express').Router();
const ctrl = require('../controllers/authController');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);       // expects { accessToken, refreshToken } in body
router.post('/refresh', ctrl.refresh);     // expects { refreshToken } in body

module.exports = router;
