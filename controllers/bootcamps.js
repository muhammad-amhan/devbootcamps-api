const ErrorResponse = require('../utils/error_response');
const Bootcamp = require('../models/Bootcamp');

// @description         Get all bootcamps
// @route               GET /api/v1/bootcamps
// @access              Public
exports.getBootcamps = async function (req, res, next) {
    try{
        const bootcamps = await Bootcamp.find();

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            message: `Successfully fetched available bootcamps`,
            data: bootcamps,
        });
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
            // res.status(404).json({ success: false, error: 'Bootcamp not found' });
            next(new ErrorResponse('Bootcamp not found', 404));
            return; // Otherwise it will raise promise rejection indicating that headers already set
        }
        res.status(200).json({
            success: true,
            message: `Successfully fetched "${bootcamp.name}" bootcamps`,
            data: bootcamp,
        });
    } catch (err) {
        // res.status(500).json({ success: false, error: err.message });
        next(new ErrorResponse('Misformatted ID', 400));
    }
}

// @description         Create a new bootcamp
// @route               POST /api/v1/bootcamps
// @access              Public
exports.createBootcamp = async function (req, res, next) {
    try {
        const bootcamp = await Bootcamp.create(req.body);

        res.status(200).json({
            success: true,
            message: `Successfully created your "${req.body.name}" bootcamp`,
            data: bootcamp,
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

// @description         Update a single bootcamp
// @route               PUT /api/v1/bootcamps/:id
// @access              Public
exports.updateBootcamp = async function (req, res, next) {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if (!bootcamp) {
            res.status(404).json({ success: false, error: 'No bootcamp found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Successfully updated your "${bootcamp.name}" bootcamp`,
            data: bootcamp,
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

// @description         Delete a single bootcamp
// @route               DELETE /api/v1/bootcamps/:id
// @access              Public
exports.deleteBootcamp = async function (req, res, next) {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        if (!bootcamp) {
            res.status(404).json({ success: false, error: 'Bootcamp not found' });
            return;
        }
        res.status(200).json({ success: true, message: `Successfully deleted "${bootcamp.name}" bootcamp` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}
