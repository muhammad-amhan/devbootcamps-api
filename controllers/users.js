const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const User          = require('../models/User');


// @description         Get all users
// @route               GET /api/v1/users
// @access              Private (admins)
const getUsers = asyncHandler(async function (req, res, next) {
    // TODO handle no users have been found for all resources e.g. Bootcamp, Course, and User
    res.status(200).json(res.results);
});

// @description         Get a single user by ID
// @route               GET /api/v1/users/:id
// @access              Private (admins)
const getUserById = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});


// @description         Create a user
// @route               POST /api/v1/users/:id
// @access              Private (admins)
const createUser = asyncHandler(async function (req, res, next) {
    const user = await User.create(req.body);

    res.status(200).json({
        success: true,
        message: 'Successfully created a new user',
        data: user,
    });
});

// @description         Update a user
// @route               PUT /api/v1/users/:id
// @access              Private (admins)
const updateUser = asyncHandler(async function (req, res, next) {
    let user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Successfully updated the user',
        data: user,
    });
});

// @description         Delete a user
// @route               DELETE /api/v1/users/:id
// @access              Private (admins)
const deleteUser = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    user.remove();

    res.status(200).json({
        success: true,
        message: `Successfully deleted the user "${user.name}"`,
    });
});


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}
