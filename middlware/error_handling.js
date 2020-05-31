const errorHandler = (err, req, res, next) => {
    console.log(err.message.red);

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
}

module.exports = errorHandler;
