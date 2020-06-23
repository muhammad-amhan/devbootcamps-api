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

router
    .route('/:id')
    .get(getReviewsById);


module.exports = router;
