const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const Review        = require('../models/Review');
const Bootcamp      = require('../models/Bootcamp');

// @description         Get all reviews
// @route               GET /api/v1/reviews
// @access              Public
const getAllReviews = asyncHandler(async function (req, res, next) {
    res.status(200).json(res.results);
});

// @description         Get all reviews for a specific bootcamp
// @route               GET /api/v1/bootcamps/:bootcampId/reviews
// @access              Public
const getReviews = asyncHandler(async function(req, res, next) {
    /** @namespace req.params.bootcampId **/
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    if (reviews.length === 0) {
        return next(new ErrorResponse('No available reviews', 404));
    }

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
    });
});

// @description         Get a review by ID
// @route               GET /api/v1/bootcamps/:bootcampId/reviews/:id
// @access              Public
const getReviewById = asyncHandler(async function (req, res, next) {
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const review = await Review.findOne({ _id: req.params.id, bootcamp: req.params.bootcampId }).populate({
        path: 'bootcamp',
        select: 'name',
    });

    if (!review) {
        return next(new ErrorResponse('Review not found', 404));
    }

    res.status(200).json({
        success: true,
        data: review,
    });
});

// @description         Add a new review to a bootcamp
// @route               POST /api/v1/bootcamps/:bootcampId/reviews
// @access              Private (user, admin)
const createReview = asyncHandler(async function (req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const reviewExists = await Review.exists({
        user: req.user.id,
        bootcamp: req.params.bootcampId,
    });

    if (reviewExists) {
        return next(new ErrorResponse('You have already posted a review about this bootcamp', 400));
    }
    
    req.body.user = req.user.id;
    const review = await Review.create(req.body);

    res.status(200).json({
        success: true,
        message: 'Thank you for your review',
        data: review,
    });
});

// @description         Update a review
// @route               PUT /api/v1/bootcamps/:bootcampId/reviews/:id
// @access              Private (review owner, admin)
const updateReview = asyncHandler(async function (req, res, next) {
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    let review = await Review.findOne({ _id: req.params.id, bootcamp: req.params.bootcampId })
    if (!review) {
        return next(new ErrorResponse('Review not found', 404));
    }

    // Object to string
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('You do not have permission to modify this review', 401))
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: review,
    });
});

// @description         Delete a review
// @route               DELETE /api/v1/bootcamps/:bootcampId/reviews/:id
// @access              Private (review owner, admin)
const deleteReview = asyncHandler(async function (req, res, next) {
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const review = await Review.findOne({ _id: req.params.id, bootcamp: req.params.bootcampId })
    if (!review) {
        return next(new ErrorResponse('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('You do not have permission to modify this review', 401))
    }

    await review.remove();

    res.status(200).json({
        success: true,
        message: 'Successfully deleted the review',
        data: review,
    });
});


module.exports = {
    getAllReviews,
    getReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
}
