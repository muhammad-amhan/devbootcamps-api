const express = require('express');
const {
    getCourses,
} = require('../controllers/courses');

// Merging params because we shared this router in bootcamps
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getCourses);

module.exports = router;
