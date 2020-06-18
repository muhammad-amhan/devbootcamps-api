const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const sendEmail     = require('../utils/send_email');
const User          = require('../models/User');

// @description         Register user
// @route               POST /api/v1/auth/register
// @access              Public
const registerUser = asyncHandler(async function (req, res, next) {
    const { name, email, password, role } = req.body;
    // Instance methods of User model can be called on `user`
    const user = await User.create({ name, email, password, role });

    sendToken(user, res, 'Registered successfully');
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

    sendToken(user, res, `Welcome ${user.name}`);
});

// @description         Get current logged in user
// @route               POST /api/v1/auth/me
// @access              Private
const getMe = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @description         Forgot password
// @route               POST /api/v1/auth/forgotpassword
// @access              Public
const forgotPassword = asyncHandler(async function (req, res, next) {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('Email is not registered', 404));
    }
    const hashedResetToken = user.getResetPasswordToken();
    // This will trigger the 'pre' mongoose middleware for saving a password when hitting this endpoint
    // Go to User model for a workaround
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${hashedResetToken}`;

    const message = `You are receiving this email because you have requested a password reset. 
    Please make a PUT request to:\n\n ${resetUrl} \n If you have not requested a password reset, please ignore this email`

    try {
        await sendEmail({
            email: user.email,
            subject: 'DevBootcamps Password Reset',
            message: message,
        });

        res.status(200).json({
            success: true,
            message: 'A reset link have been sent to your email',
            resetToken: hashedResetToken,
        });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Could not send an email', 500));
    }
});

// Get JWT token and create cookie
const sendToken = function (user, res, message) {
    const jwt_token = user.getSignedJWT();

    const options = {
        // https://www.codeproject.com/Questions/607098/Cookieplusexpirationplus30plusdays
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000)),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(200)
        .cookie('jwt_token', jwt_token, options)
        .json({
            success: true,
            message: message,
            jwt_token: jwt_token,
            data: user,
        });
};


module.exports = {
    registerUser,
    login,
    getMe,
    forgotPassword,
};
