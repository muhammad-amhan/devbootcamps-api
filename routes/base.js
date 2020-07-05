const express           = require('express');
const filterResults     = require('../middlware/data_filter');
const { getAllCourses } = require('../controllers/courses');
const { getAllReviews } = require('../controllers/reviews');
const Course            = require('../models/Course');
const Review            = require('../models/Review');

const router = express.Router();

router
    .route('/courses')
    .get(
        filterResults(Course, 'Courses',{
            path: 'bootcamp',
            select: 'name',
        }), getAllCourses);

router
    .route('/reviews')
    .get(filterResults(Review,'Reviews',
        {
            path: 'bootcamp',
            select: 'name description',
        }
    ), getAllReviews);


module.exports = router;
