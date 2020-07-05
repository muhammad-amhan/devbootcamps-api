const express = require('express');

const {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} = require('../controllers/courses');

const filterResults    = require('../middlware/data_filter');
const { requireToken } = require('../middlware/auth');

const Course = require('../models/Course');
// Merging params with other resources so we can have access to their params
const router = express.Router({ mergeParams: true });

router
    .route('/:id([a-z0-9]{24})')
    .get(getCourseById)
    .put(requireToken, updateCourse)
    .delete(requireToken, deleteCourse);

router
    .route('/')
    .get(getCourses)
    .post(requireToken, createCourse);


module.exports = router;
