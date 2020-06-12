const Bootcamp      = require('../models/Bootcamp');
const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const geocoder      = require('../utils/geocoder');
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
        next(new ErrorResponse('No bootcamps found in this region, try to expand your circle.', 404))
        return;
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
    let reqQuery = { ...req.query };
    let query, reqQueryString, blackListedQueries, bootcamps;

    // Edge case: exclude e.g. "select" in a query string when specifying returned bootcamps fields
    blackListedQueries = ['select', 'sort', 'page', 'limit'];
    blackListedQueries.forEach(field => delete reqQuery[field]);

    reqQueryString = JSON.stringify(reqQuery);
    reqQueryString = reqQueryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Populating "courses" is done through mongoose virtuals and defined in Bootcamp model
    query = Bootcamp.find(JSON.parse(reqQueryString)).populate({
        path: 'courses',
        select: 'title tuition',
    });

    // Only show selected fields in bootcamps details
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort bootcamps by specific field(s)
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        // Descending order
        query = query.sort('-createdAt');
    }

    // Pagination
    const pageNumber     = parseInt(req.query.page, 10);
    const limitNumber    = parseInt(req.query.limit, 10);
    const currentPage    = pageNumber > 0 ? pageNumber : 1;
    const limit          = limitNumber > 0 ? limitNumber : 20;
    const startIndex     = (currentPage - 1) * limit;
    const endIndex       = (currentPage * limit);
    const totalBootcamps = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);
    // Execute the Mongoose query
    bootcamps = await query;

    let pagination = {};

    if (startIndex > 0) {
        pagination.previous = {
            page: currentPage - 1,
            limit: limit,
        };
    }

    if (endIndex < totalBootcamps) {
        pagination.next = {
            page: currentPage + 1,
            limit: limit,
        };
    }

    if (bootcamps.length === 0) {
        res.status(404).json({
           success: true,
           messages: 'No bootcamps found',
        });
        return;
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination: pagination,
        data: bootcamps,
    });
});

// @description         Get a single bootcamp
// @route               GET /api/v1/bootcamps/:id
// @access              Public
const getBootcampById = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        res.status(404).json({
            success: true,
            messages: 'Bootcamp not found',
        });
        return; // Otherwise it will raise promise rejection indicating that headers already set
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @description         Create a new bootcamp
// @route               POST /api/v1/bootcamps
// @access              Public
const createBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(200).json({
        success: true,
        message: `Successfully created "${req.body.name}" bootcamp`,
        data: bootcamp,
    });
});

// @description         Update a single bootcamp
// @route               PUT /api/v1/bootcamps/:id
// @access              Public
const updateBootcamp = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!bootcamp) {
        res.status(404).json({
            success: true,
            messages: 'Bootcamp not found',
        });
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
const deleteBootcamp = asyncHandler(async function (req, res, next) {
    // We won't use `findByIdAndDelete` because we added a mongoose middleware that is triggered on `remove` to cascade delete courses
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        res.status(404).json({
            success: true,
            messages: 'Bootcamp not found',
        });
        return;
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
        res.status(404).json({
            success: true,
            messages: 'Bootcamp not found',
        });
        return;
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
    getBootcamp: getBootcampById,
    updateBootcamp,
    createBootcamp,
    deleteBootcamp,
    getBootcampByLocationRadius,
    uploadBootcampPhoto,
}
