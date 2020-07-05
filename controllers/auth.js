const crypto        = require('crypto');
const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const sendEmail     = require('../utils/send_email');
const User          = require('../models/User');

// @description         Register user
// @route               POST /api/v1/auth/register
// @access              Public
const registerUser = asyncHandler(async function (req, res, next) {
    const user = await User.create(req.body);
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
    // Search for the user by email
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Incorrect email or password'), 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Incorrect email or password'), 401);
    }

    sendToken(user, res, `Welcome, ${user.firstName}!`);
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

// @description         Update user details
// @route               PUT /api/v1/auth/updatepassword
// @access              Private
const updateUserPassword = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id).select('+password');

    /** @namespace req.body.currentPassword **/
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Incorrect password', 401));
    }

    /** @namespace req.body.newPassword **/
    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, res, 'Successfully updated your password');
});

// @description         Update user details
// @route               PUT /api/v1/auth/updatedetails
// @access              Private
const updateUserDetails = asyncHandler(async function (req, res, next) {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Successfully updated your details',
        data: user,
    });
});

// @description         Reset password
// @route               PUT /api/v1/auth/resetpassword/:resetToken
// @access              Public
const resetPassword = asyncHandler(async function (req, res, next) {
    const resetToken = crypto
        .createHash('SHA256')
        .update(req.params.resetToken)
        .digest('hex');

    // Find user by reset password token
    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() },  // Make sure the token is not expired
    });

    if (!user) {
        return next(new ErrorResponse('Token expired', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, res, 'Password changed successfully');
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
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${hashedResetToken}`;

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

// @description         Log users out
// @route               POST /api/v1/auth/logout
// @access              Private
const logout = asyncHandler(async function (req, res, next) {
    // Not actually destorying the cookies but rather setting the jwt_token to none
    res.cookie('jwt_token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Successfully logged out',
    });
});


module.exports = {
    registerUser,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateUserDetails,
    updateUserPassword,
    logout,
};
