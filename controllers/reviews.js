const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const Review        = require('../models/Review');

// @description         Get all reviews for a specific bootcamp for forwarded route and all courses otherwise
// @forwardedRoute      GET /api/v1/bootcamps/:bootcampId/reviews
// @route               GET /api/v1/reviews
// @access              Public
const getReviews = asyncHandler(async function(req, res, next) {
    /** @namespace req.params.bootcampId **/
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        if (courses.length === 0) {
            return next(new ErrorResponse('No Reviews available', 404));
        }

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });

    } else {
        res.status(200).json(res.results);
    }
});


module.exports = {
    getReviews,
}
