const express       = require('express');
const Review        = require('../models/Review');
const filterResults = require('../middlware/data_filter');

const {
    requireToken,
    verifyUserRole,
} = require('../middlware/auth');

const {
    getReviews,
} = require('../controllers/reviews');

const router = express.Router();

router
    .route('/')
    .get(filterResults(Review,'Reviews',
        {
            path: 'bootcamp',
            select: 'name description',
        }
    ), getReviews);


module.exports = router;
