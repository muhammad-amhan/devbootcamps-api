const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');
const User = require('../models/User');

// @description         Register user
// @route               GET /api/v1/register
// @access              Public
const registerUser = asyncHandler(async function (req, res, next) {
   res.status(200).json({
        success: true,
        message: 'Registered successfully',
   });
});

module.exports = {
    registerUser,
}
