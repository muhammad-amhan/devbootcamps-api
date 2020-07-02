const express = require('express');

const {
    getAllCourses,
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
    .route('/courses/:id([a-z0-9]{24})')
    .get(getCourseById)
    .put(requireToken, updateCourse)
    .delete(requireToken, deleteCourse);

router
    .route('/courses')
    .get(
        filterResults(Course, 'Courses',{
            path: 'bootcamp',
            select: 'name',
        }), getCourses)
    .post(requireToken, createCourse);

router
    .route(new RegExp('/\/?$'))
    .get(
        filterResults(Course, 'Courses',{
            path: 'bootcamp',
            select: 'name',
        }), getAllCourses);


module.exports = router;
