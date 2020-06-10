const Course = require('../models/Course');
const ErrorResponse = require('../utils/error_response');
const asyncHandler = require('../middlware/async_handler');

// @description         Get all courses
// @route               GET /api/v1/bootcamps/:bootcampID/courses
// @access              Public
const getCourses = asyncHandler(async function(req, res, next) {
    let query;

    /** @namespace  req.params.bootcampId **/
    if (req.params.bootcampId) {
            query = Course.find({
            bootcamp: req.params.bootcampId,
        });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description',
        }); // Also fetch the bootcamp details, specifically bootcamp name and description
    }

    const courses = await query;

    if (!courses) {
        res.status(404).json({
            success: true,
            message: `No courses are found `,
        });
    }

    res.status(200).json({
       success: true,
       count: courses.length,
       data: courses,
    });
});

module.exports = {
    getCourses,
}
