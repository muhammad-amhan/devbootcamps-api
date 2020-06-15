const ErrorResponse = require('../utils/error_response');

const errorHandler = (err, req, res, next) => {
    console.log(`Error: ${err.name}`.red);
    console.log(`Message: ${err.message}`.red);

    let error = {...err};
    let message = err.message;

    // Bad object format - CastError
    if (err.name === 'CastError') {
        message = `Resource with ID "${err.value}" was not found`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key error (name)
    if (err.code === 11000) {
        message = `The name "${err.keyValue['name']}" already exists`;
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        let missingProperties = []
        Object.values(err.errors).map(name => missingProperties.push(name.path));
        message = 'Missing required field(s) ';

        for (let i = 0; i < missingProperties.length; i++) {
            if (i > 0) {
                message += (i < missingProperties.length - 1) ? ', ' : ' and ';
            }
            message += `"${missingProperties[i]}"`;
        }

        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: message || 'Internal Server Error',
    });

    next();
};

module.exports = errorHandler;
