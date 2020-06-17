const Bootcamp      = require('../models/Bootcamp');
const ErrorResponse = require('../utils/error_response');
const geocoder      = require('../utils/geocoder');
const asyncHandler  = require('../middlware/async_handler');
const path          = require('path');

// @description         Get all bootcamps
// @route               GET /api/v1/bootcamps/:postcode/:distance
// @access              Public
const getBootcampByLocationRadius = asyncHandler(async function (req, res, next) {
    // Get the latitude and longitude from the postcode /zipcode and distance
    const { zipcode, distance } = req.params;
    const clientLoc = await geocoder.geocode(zipcode);

    const latitude = clientLoc[0].latitude;
    const longitude = clientLoc[0].longitude;
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [ [ longitude, latitude ], radius ] }
        }
    });

    if (bootcamps.length === 0) {
        return next(new ErrorResponse('No bootcamps found in this region, try to expand your circle.', 404))
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @description         Get all bootcamps
// @route               GET /api/v1/bootcamps
// @access              Public
const getBootcamps = asyncHandler(async function (req, res, next) {
    res.status(200).json(res.results);
});

// @description         Get a single bootcamp
// @route               GET /api/v1/bootcamps/:id
// @access              Public
const getBootcampById = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // The return is necessary, otherwise it will raise promise rejection indicating that headers already set
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @description         Create a new bootcamp
// @route               POST /api/v1/bootcamps
// @access              Private
const createBootcamp = asyncHandler(async function (req, res, next) {
    // A publisher can publish one bootcamp only
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    if (publishedBootcamp && req.user.role !== 'admin') {
        return asyncHandler(new ErrorResponse(`You have already published the bootcamp "${publishedBootcamp.name}"`, 400));
    }
    // Include user in the request body
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        message: `Successfully created "${req.body.name}" bootcamp`,
        data: bootcamp,
    });
});

// @description         Update a single bootcamp
// @route               PUT /api/v1/bootcamps/:id
// @access              Private
const updateBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    res.status(200).json({
        success: true,
        message: `Successfully updated your "${bootcamp.name}" bootcamp`,
        data: bootcamp,
    });
});

// @description         Delete a single bootcamp
// @route               DELETE /api/v1/bootcamps/:id
// @access              Private
const deleteBootcamp = asyncHandler(async function (req, res, next) {
    // We won't use `findByIdAndDelete` because we added a mongoose middleware that is triggered on `remove` to cascade delete courses
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    bootcamp.remove();

    res.status(200).json({
        success: true,
        message: `Successfully deleted "${bootcamp.name}" bootcamp`
    });
});

// @description         Upload photo for a bootcamp
// @route               PUT /api/v1/bootcamps/:id/photo
// @access              Private
const uploadBootcampPhoto = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please select an image', 400));
    }

    const file = req.files.file;

    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    if (file.size > process.env.MAX_FILE_UPLOADS) {
        return next(
            new ErrorResponse(`File is too large, please upload an image less than 
                               ${process.env.MAX_FILE_UPLOADS}`, 400)
        );
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    file.mv(path.join(process.env.FILE_UPLOAD_PATH, file.name), async (err) => {
        if (err) {
            return next(new ErrorResponse('Problem with uploading the file', 500));
        }
    });

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
        success: true,
        messages: 'Successfully changed bootcamp picture',
        data: file.name,
    });
});

// We could also export each function inline `exports.getBootcamps = ... ` instead of `const getBootcamps = ...`
module.exports = {
    getBootcamps,
    getBootcampById,
    updateBootcamp,
    createBootcamp,
    deleteBootcamp,
    getBootcampByLocationRadius,
    uploadBootcampPhoto,
}
