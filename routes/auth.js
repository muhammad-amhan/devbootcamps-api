const express = require('express');
const {
    registerUser,
    login,
    getMe,
    resetPassword,
} = require('../controllers/auth');

const { requireToken } = require('../middlware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.get('/me', requireToken, getMe);
router.post('/resetpassword', resetPassword);

module.exports = router;
