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
const reviewsRouter = require('./reviews');

const router = express.Router();

// Forward the request to:
router.use('/:bootcampId([a-z0-9]{24})', courseRouter);
router.use('/:bootcampId([a-z0-9]{24})', reviewsRouter);

router
    .route('/:zipcode([a-zA-Z0-9]{5, 8})/:distance([0-9])')
    .get(getBootcampByLocationRadius);

router
    .route('/:id([a-z0-9]{24})/photo')
    .put(requireToken, verifyUserRole('publisher', 'admin'), uploadBootcampPhoto);

router
    .route('/:id([a-z0-9]{24})')
    .get(getBootcampById)
    .put(requireToken, verifyUserRole('publisher', 'admin'), updateBootcamp)
    .delete(requireToken, verifyUserRole('publisher', 'admin'), deleteBootcamp);

router
    .route('/\/?$')
    .get(filterResults(Bootcamp, 'Bootcamps', 'courses'), getBootcamps)
    .post(requireToken, verifyUserRole('publisher', 'admin'), createBootcamp);


module.exports = router;
