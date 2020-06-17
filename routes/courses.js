const express = require('express');

const {
    getCourses,
    getCourseById,
    addCourse,
    updateCourse,
    deleteCourse,
} = require('../controllers/courses');

const Course = require('../models/Course');

// TODO
const checkBootcamp = require('../middlware/checks');
const filterResults = require('../middlware/data_filter');
const {
    requireToken,
} = require('../middlware/auth');

// Merging params because we shared this router in bootcamps
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(
        filterResults(Course, {
            path: 'bootcamp',
            select: 'name',
        }), getCourses)
    .post(requireToken, addCourse);

router
    .route('/:id')
    .get(getCourseById)
    .put(requireToken, updateCourse)
    .delete(requireToken, deleteCourse);

module.exports = router;
