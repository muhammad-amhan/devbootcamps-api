const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const Review        = require('../models/Review');
const Bootcamp      = require('../models/Bootcamp');

// @description         Get all reviews for a specific bootcamp for forwarded route and all courses otherwise
// @forwardedRoute      GET /api/v1/bootcamps/:bootcampId/reviews
// @route               GET /api/v1/reviews
// @access              Public
const getReviews = asyncHandler(async function(req, res, next) {
    /** @namespace req.params.bootcampId **/
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        if (reviews.length === 0) {
            return next(new ErrorResponse('Review not found', 404));
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

// @description         Get a review by ID
// @route               PUT /api/v1/reviews/:id
// @access              Public
const getReviewsById = asyncHandler(async function (req, res, next) {
    const reviews = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name',
    });

    if (!reviews) {
        return next(new ErrorResponse('No reviews available', 404));
    }

    res.status(200).json({
        success: true,
        data: reviews,
    });
});

// @description         Add a new review to a bootcamp
// @route               POST /api/v1/bootcamps/:bootcampId/reviews
// @access              Private (admin, users)
const createReview = asyncHandler(async function (req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse('Cannot publish a review because the bootcamp is not found', 404));
    }

    req.body.user = req.user.id;
    const review = await Review.create(req.body);

    res.status(200).json({
        success: true,
        message: `Thank you for your review `,
        data: review,
    });
});

module.exports = {
    getReviews,
    getReviewsById,
    createReview,
}
