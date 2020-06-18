const express = require('express');
const {
    registerUser,
    login,
    getMe,
    forgotPassword,
} = require('../controllers/auth');

const { requireToken } = require('../middlware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.get('/me', requireToken, getMe);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
