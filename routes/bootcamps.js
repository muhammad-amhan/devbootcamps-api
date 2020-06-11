const express = require('express');

const {
    getBootcamps,
    getBootcamp,
    getBootcampByLocationRadius,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
} = require('../controllers/bootcamps');

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
    .get(getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;
