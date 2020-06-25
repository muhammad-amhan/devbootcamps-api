const express = require('express');
const {
    registerUser,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateUserDetails,
    updateUserPassword,
    logout,
} = require('../controllers/auth');

const { requireToken } = require('../middlware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', requireToken, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.put('/updatedetails', requireToken, updateUserDetails);
router.put('/updatepassword', requireToken, updateUserPassword);


module.exports = router;
