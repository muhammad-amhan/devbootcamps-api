const ErrorResponse = require('../utils/error_response');
const asyncHandler  = require('../middlware/async_handler');
const Course        = require('../models/Course');
const Bootcamp      = require('../models/Bootcamp');

// @description         Get all courses
// @forwardedRoute      GET /api/v1/courses
// @access              Public
const getAllCourses = asyncHandler(async function (req, res, next) {
    res.status(200).json(res.results);
});

// @description         Get all courses for a specific bootcamp
// @forwardedRoute      GET /api/v1/bootcamps/:bootcampId/courses
// @access              Public
const getCourses = asyncHandler(async function(req, res, next) {
    /** @namespace req.params.bootcampId **/
    // Under the hood, it is equivalent to Model.findOne({ answer: 42 }).select({ _id: 1 }).lean()
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    if (courses.length === 0) {
        return next(new ErrorResponse('No courses have been published yet', 404));
    }

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    });
});

// @description         Get a course by ID
// @route               GET /api/v1/bootcamps/:bootcampId/courses/:id
// @access              Public
const getCourseById = asyncHandler(async function (req, res, next) {
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name',
    });

    if (!course) {
        return next(new ErrorResponse('Course not found', 404));
    }

    res.status(200).json({
       success: true,
       data: course,
    });
});

// @description         Add a new course to a bootcamp
// @route               POST /api/v1/bootcamps/:bootcampId/courses
// @access              Private (bootcamp owner, admin)
const createCourse = asyncHandler(async function (req, res, next) {
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    // Verify the user is the owner of the bootcamp where the course is published
    if ((bootcamp.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
        return next(new ErrorResponse('You do not have permission to add courses to this bootcamp', 401));
    }

    const courses = await Course.find({ bootcamp: req.params.bootcampId }).select('title');

    for await (let course of courses) {
        if (course.title === req.body.title) {
            return next(new ErrorResponse(`You already have a course with the title "${req.body.title}" in your bootcamp`, 400));
        }
    }

    req.body.user = req.user.id;
    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        message: `Successfully created "${course.title}" course`,
        data: course,
    });
});

// @description         Update a course
// @route               PUT /api/v1/bootcamp/:bootcampId/courses/:id
// @access              Private (course owner, admin)
const updateCourse = asyncHandler(async function (req, res, next) {
    const bootcamp = await Bootcamp.findById( req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse('Course not found', 404));
    }

    if ((course.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
        return next(new ErrorResponse(`You do not have permission to modify this course`, 401));
    }

    if (bootcamp.careers.includes(req.body.title)) {
        return next(new ErrorResponse(`You already have a course with the title "${req.body.title}" in your bootcamp`));
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
// @access              Private (course owner, admin)
const deleteCourse = asyncHandler(async function (req, res, next) {
    const bootcampExists = await Bootcamp.exists({ _id: req.params.bootcampId });

    if (!bootcampExists) {
        return next(new ErrorResponse('Bootcamp not found', 404));
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse('Course not found', 404));
    }
    // Verify the user is the course owner
    if ((course.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
        return next(new ErrorResponse('You do not have permission to modify this course', 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        message: `Successfully deleted the course "${course.title}"`,
    });
});


module.exports = {
    getAllCourses,
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
}
