const express       = require('express');
const Review        = require('../models/Review');
const filterResults = require('../middlware/data_filter');

const {
    requireToken,
    verifyUserRole,
} = require('../middlware/auth');

const {
    getReviews,
    getReviewsById,
    createReview,
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(filterResults(Review,'Reviews',
        {
            path: 'bootcamp',
            select: 'name description',
        }
    ), getReviews)
    .post(requireToken, verifyUserRole('user', 'admin'), createReview);

router
    .route('/:id')
    .get(getReviewsById);


module.exports = router;
