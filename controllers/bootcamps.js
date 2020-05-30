const Bootcamp = require('../models/Bootcamp');

// @description         Get all bootcamps
// @route               GET /api/v1/bootcamps
// @access              Public
exports.getBootcamps = async function (req, res, next) {
    try{
        const bootcamps = await Bootcamp.find();
        res.status(200).json({ success: true, message: bootcamps });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

// @description         Get a single bootcamp
// @route               GET /api/v1/bootcamps/:id
// @access              Public
exports.getBootcamp = async function (req, res, next) {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            res.status(404).json({ success: false, error: 'Bootcamp not found' });
            return; // Otherwise it will raise promise rejection indicating that headers already set
        }
        res.status(200).json({ success: true, message: bootcamp });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

// @description         Create a new bootcamp
// @route               POST /api/v1/bootcamps
// @access              Public
exports.createBootcamp = async function (req, res, next) {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(200).json({ success: true, message: bootcamp });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

// @description         Update a single bootcamp
// @route               PUT /api/v1/bootcamps/:id
// @access              Public
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Update bootcamp with id ${req.params.id}` });
}

// @description         Delete a single bootcamp
// @route               DELETE /api/v1/bootcamps/:id
// @access              Public
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Delete bootcamp with id ${req.params.id}` });
}
