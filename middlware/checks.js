const ErrorResponse = require('../utils/error_response');
const Bootcamp = require('../models/Bootcamp');

const checkBootcamp = () => async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }
    next();
}

module.exports = checkBootcamp;
