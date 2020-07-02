const express       = require('express');
const Review        = require('../models/Review');
const filterResults = require('../middlware/data_filter');

const {
    requireToken,
    verifyUserRole,
} = require('../middlware/auth');

const {
    getAllReviews,
    getReviews,
    getReviewsById,
    createReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

router
    .route('/reviews/:id([a-z0-9]{24})')
    .get(getReviewsById)
    .put(requireToken, verifyUserRole('user', 'admin'), updateReview)
    .delete(requireToken, verifyUserRole('user', 'admin'), deleteReview);

router
    .route('/reviews')
    .get(filterResults(Review,'Reviews',
        {
            path: 'bootcamp',
            select: 'name description',
        }
    ), getReviews)
    .post(requireToken, verifyUserRole('user', 'admin'), createReview);

router
    .route('/\/?$')
    .get(filterResults(Review,'Reviews',
        {
            path: 'bootcamp',
            select: 'name description',
        }
    ), getAllReviews);


module.exports = router;
