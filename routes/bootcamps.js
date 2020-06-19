const express       = require('express');
const Bootcamp      = require('../models/Bootcamp');
const filterResults = require('../middlware/data_filter');

const {
    getBootcamps,
    getBootcampById,
    getBootcampByLocationRadius,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    uploadBootcampPhoto,
} = require('../controllers/bootcamps');

const {
    requireToken,
    verifyUserRole,
} = require('../middlware/auth');

// Include course resource routers
const courseRouter = require('./courses');

const router = express.Router();

// Forward the request to courses router
router.use('/:bootcampId/courses', courseRouter);

router
    .route('/:zipcode/:distance')
    .get(getBootcampByLocationRadius);

router
    .route('/')
    .get(filterResults(Bootcamp, 'Bootcamps', 'courses'), getBootcamps)
    .post(requireToken, verifyUserRole('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcampById)
    .put(requireToken, verifyUserRole('publisher', 'admin'), updateBootcamp)
    .delete(requireToken, verifyUserRole('publisher', 'admin'), deleteBootcamp);

router
    .route('/:id/photo')
    .put(requireToken, verifyUserRole('publisher', 'admin'), uploadBootcampPhoto);


module.exports = router;
