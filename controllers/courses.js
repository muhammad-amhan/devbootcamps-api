const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');

const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @description         Get all courses for a specific bootcamp for forwarded route and all courses otherwise
// @forwardedRoute      GET /api/v1/bootcamps/:bootcampId/courses
// @route               GET /api/v1/courses
// @access              Public
const getCourses = asyncHandler(async function(req, res, next) {
    let query;

    /** @namespace req.params.bootcampId **/
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name',
        }); // Also fetch the bootcamp details, specifically bootcamp name and description
    }

    const courses = await query;

    if (courses.length === 0) {
        res.status(404).json({
            success: true,
            message: `No courses have been published yet`,
        });
        return;
    }

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
});

// @description         Get a single course by ID
// @route               GET /api/v1/bootcamps/:bootcampId/courses/:id
// @route               PUT /api/v1/courses/:id
// @access              Public
const getCourseById = asyncHandler(async function (req, res, next) {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name',
    });

    if (!course) {
        res.status(404).json({
           success: true,
           message: 'Course not found',
        });
        return;
    }

    res.status(200).json({
       success: true,
       data: course,
    });
});

// @description         Add a new course to a bootcamp
// @route               POST /api/v1/bootcamps/:bootcampId/courses
// @access              Private
const addCourse = asyncHandler(async function (req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        res.status(404).json({
            success: true,
            message: 'Cannot create course because the bootcamp is not found',
        });
        return;
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        message: `Successfully created "${course.title}" course`,
        data: course,
    });
});

// @description         Update a course
// @route               PUT /api/v1/bootcamp/:bootcampId/courses/:id
// @route               PUT /api/v1/courses/:id
// @access              Private
const updateCourse = asyncHandler(async function (req, res, next) {
    let course = await Course.findById(req.params.id);

    if (!course) {
        res.status(404).json({
            success: true,
            message: `Course with the ID "${req.params.id}" is not found`,
        });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,  // Return the updated data
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Successfully updated the course',
        data: course,
    });
});

// @description         Delete a course
// @route               DELETE /api/v1/bootcamp/:bootcampId/courses/:id
// @route               DELETE /api/v1/courses/:id
// @access              Private
const deleteCourse = asyncHandler(async function (req, res, next) {
    const course = await Course.findById(req.params.id);

    if (!course) {
        res.status(404).json({
            success: true,
            message: `Course with the ID "${req.params.id}" is not found`,
        });
    }

    await course.remove({});

    res.status(200).json({
        success: true,
        message: 'Successfully deleted the course',
    });
});

module.exports = {
    getCourses,
    getCourseById,
    addCourse,
    updateCourse,
    deleteCourse,
}
