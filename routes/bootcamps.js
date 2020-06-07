const express = require('express');

const {
    getBootcamps,
    getBootcamp,
    getBootcampByLocationRadius,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
} = require('../controllers/bootcamps');

const router = express.Router();

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
