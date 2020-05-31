const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');

// @description         Get all bootcamps
// @route               GET /api/v1/bootcamps
// @access              Public
exports.getBootcamps = asyncHandler(async function (req, res, next) {
    const bootcamps = await Bootcamp.find();

    if (bootcamps.length === 0) {
        next(new ErrorResponse('No bootcamps have been found', 404));
        return;
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        message: `Successfully fetched available bootcamps`,
        data: bootcamps,
    });
});

// @description         Get a single bootcamp
// @route               GET /api/v1/bootcamps/:id
// @access              Public
exports.getBootcamp = asyncHandler(async function (req, res, next) {
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
});

// @description         Create a new bootcamp
// @route               POST /api/v1/bootcamps
// @access              Public
exports.createBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(200).json({
        success: true,
        message: `Successfully created your "${req.body.name}" bootcamp`,
        data: bootcamp,
    });
});

// @description         Update a single bootcamp
// @route               PUT /api/v1/bootcamps/:id
// @access              Public
exports.updateBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!bootcamp) {
        next(new ErrorResponse('Bootcamp not found', 404));
        return;
    }
    res.status(200).json({
        success: true,
        message: `Successfully updated your "${bootcamp.name}" bootcamp`,
        data: bootcamp,
    });
});

// @description         Delete a single bootcamp
// @route               DELETE /api/v1/bootcamps/:id
// @access              Public
exports.deleteBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
        next(new ErrorResponse('Bootcamp not found', 404));
        return;
    }
    res.status(200).json({ success: true, message: `Successfully deleted "${bootcamp.name}" bootcamp` });
});
