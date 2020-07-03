const ErrorResponse = require('../utils/error_response');

const errorHandler = (err, req, res, next) => {
    console.log(err.name.red);
    console.log(`Message: ${err.message}`.red);

    let error = {...err};
    error.message = err.message;

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
