// @description         Create a logging middleware
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.host}${req.originalUrl} ${res.statusCode}`);
    next(); // Go to the next middleware
}

module.exports = logger