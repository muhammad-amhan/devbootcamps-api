const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');
const User = require('../models/User');

// @description         Register user
// @route               GET /api/v1/auth/register
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

module.exports = {
    registerUser,
}
