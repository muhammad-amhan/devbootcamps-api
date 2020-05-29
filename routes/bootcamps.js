const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.status(200).json({ success: true, message: 'Show all bootcamps'});
});

router.get('/:id', function (req, res) {
    res
        .status(200)
        .json({ success: true, message: `Show bootcamps wih id ${req.params.id}`});
});

router.post('/', function (req, res) {
    res
        .status(200)
        .json({ success: true, message: 'Add new bootcamp'});
});

router.put('/:id', function (req, res) {
    res
        .status(200)
        .json({ success: true, message: `Update bootcamp with id ${req.params.id}`});
});

router.delete('/:id', function (req, res) {
    res
        .status(200)
        .json({ success: true, message: `Delete bootcamp with id ${req.params.id}`});
});

module.exports = router;
