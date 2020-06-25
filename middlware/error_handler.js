const ErrorResponse = require('../utils/error_response');

const errorHandler = (err, req, res, next) => {
    console.log(`Error: ${err.name}`.red);
    console.log(`Message: ${err.message}`.red);

    let error = {...err};
    error.message = err.message;

    // Bad Mongo ID format - CastError
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    // TODO I dont like the error handling in general here
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const key = Object.keys(err.keyValue)[0];
        const value = err.keyValue[key];
        const message = `"${value}" already exists`;

        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message + '.\n').join('');
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error',
    });

    next();
};

module.exports = errorHandler;
