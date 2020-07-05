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
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

router
    .route('/:id([a-z0-9]{24})')
    .get(getReviewById)
    .put(requireToken, verifyUserRole('user', 'admin'), updateReview)
    .delete(requireToken, verifyUserRole('user', 'admin'), deleteReview);

router
    .route('/')
    .get(getReviews)
    .post(requireToken, verifyUserRole('user', 'admin'), createReview);


module.exports = router;
