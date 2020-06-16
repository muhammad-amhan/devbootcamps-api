const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');
const User = require('../models/User');

// @description         Register user
// @route               GET /api/v1/auth/register
// @access              Public
const registerUser = asyncHandler(async function (req, res, next) {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });

    res.status(200).json({
        success: true,
        message: 'Registered successfully',
        data: user,
   });
});

module.exports = {
    registerUser,
}
