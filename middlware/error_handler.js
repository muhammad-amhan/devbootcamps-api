const ErrorResponse = require('../utils/error_response');

const errorHandler = (err, req, res, next) => {
    console.log(err.name.red);
    console.log(err.message.red);

    // Copy the properties of `err` to `error`
    let error = { ...err };
    error.message = err.message;

    // Bad object format - CastError
    if (err.name === 'CastError') {
        const message = `Resource with ID "${err.value}" was not found`;
        error = new ErrorResponse(message, 404);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
    });
}

module.exports = errorHandler;
