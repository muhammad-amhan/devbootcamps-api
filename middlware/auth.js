const asyncHandler  = require('./async_handler');
const ErrorResponse = require('../utils/error_response');
const jwt           = require('jsonwebtoken');
const User          = require('../models/User');

// Validate token
const requireToken = asyncHandler(async function (req, res, next) {
    let jwt_token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        jwt_token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt_token) {
        jwt_token = req.cookies.jwt_token;
    }

    if (!jwt_token) {
        return next(new ErrorResponse('Not authenticated', 401));
    }

    try {
        const decoded = jwt.verify(jwt_token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        // Edge case - user could have been removed after they were authenticated
        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        req.user = user;
        next();

    } catch (err) {
        return next(new ErrorResponse('Not authenticated', 401));
    }
});

// Authorize users based on their role
const verifyUserRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User does not have permission to modify this resource`, 403));
        }
        next();
    };
};

module.exports = {
    requireToken,
    verifyUserRole,
};
