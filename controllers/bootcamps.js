// @description         Get all bootcamps
// @route               GET /api/v1/bootcamps
// @access              Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, message: 'Show all bootcamps'});
}

// @description         Get a single bootcamp
// @route               GET /api/v1/bootcamps/:id
// @access              Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Show bootcamps wih id ${req.params.id}`});
}

// @description         Create a new bootcamp
// @route               POST /api/v1/bootcamps
// @access              Public
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: 'Create new bootcamp'});
}

// @description         Update a single bootcamp
// @route               PUT /api/v1/bootcamps/:id
// @access              Public
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Update bootcamp with id ${req.params.id}`});
}

// @description         Delete a single bootcamp
// @route               DELETE /api/v1/bootcamps/:id
// @access              Public
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Delete bootcamp with id ${req.params.id}`});
}
