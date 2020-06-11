const express = require('express');

const {
    getCourses,
    getCourseById,
    addCourse,
} = require('../controllers/courses');

// Merging params because we shared this router in bootcamps
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getCourses)
    .post(addCourse);

router
    .route('/:id')
    .get(getCourseById);

module.exports = router;
