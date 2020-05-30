// @description         Create a logging middleware
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.hostname}${req.originalUrl} ${res.statusCode}`.yellow);
    next(); // Go to the next middleware
}

module.exports = logger