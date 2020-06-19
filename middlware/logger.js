const logger = (req, res, next) => {
    // Wait until the request is finished and then get the final returned status code otherwise will always catch 200
    res.on('finish', () => {
        let statusCode = res.statusCode;
        console.log(`${req.method} ${req.protocol}://${req.hostname}${req.originalUrl} ${statusCode}`.yellow);
    });

    next(); // Go to the next middleware
}

module.exports = logger