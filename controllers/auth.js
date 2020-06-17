const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');
const User = require('../models/User');

// @description         Register user
// @route               POST /api/v1/auth/register
// @access              Public
const registerUser = asyncHandler(async function (req, res, next) {
    const { name, email, password, role } = req.body;

    // Instance methods of User model can be called on `user`
    const user = await User.create({ name, email, password, role });
    const token = user.getSignedJWT();

    res.status(200).json({
        success: true,
        message: 'Registered successfully',
        token: token,
        data: user,
    });
});

// @description         Login
// @route               POST /api/v1/auth/login
// @access              Public
const login = asyncHandler(async function (req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Email and password are required', 400));
    }
    // Search for user by email
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid email or password'), 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid email or password'), 401);
    }

    res.status(200).json({
        success: true,
    });
});


module.exports = {
    registerUser,
    login,
}
