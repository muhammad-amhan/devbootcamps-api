const express = require('express');

const {
    getBootcamps,
    getBootcampById,
    getBootcampByLocationRadius,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    uploadBootcampPhoto,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const filterResults = require('../middlware/data_filter');
const requireToken = require('../middlware/auth');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

// Forward the request to courses router
router.use('/:bootcampId/courses', courseRouter);

router
    .route('/:zipcode/:distance')
    .get(getBootcampByLocationRadius);

router
    .route('/')
    .get(filterResults(Bootcamp, 'courses'), getBootcamps)
    .post(requireToken, createBootcamp);

router
    .route('/:id')
    .get(getBootcampById)
    .put(requireToken, updateBootcamp)
    .delete(requireToken, deleteBootcamp);


router
    .route('/:id/photo')
    .put(requireToken, uploadBootcampPhoto);

module.exports = router;
