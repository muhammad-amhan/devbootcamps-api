const express = require('express');
const {
    registerUser,
    login,
    getMe,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth');

const { requireToken } = require('../middlware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.get('/me', requireToken, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
