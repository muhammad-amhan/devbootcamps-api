const ErrorResponse = require('../utils/error_response');

const filterResults = (model, resourceName, populate) => async (req, res, next) => {
    let reqQuery = { ...req.query };
    let query, reqQueryString, blackListedQueries, results;

    // Edge case: exclude e.g. "select" in a query string when specifying returned bootcamps fields
    blackListedQueries = ['select', 'sort', 'page', 'limit'];
    blackListedQueries.forEach(field => delete reqQuery[field]);

    reqQueryString = JSON.stringify(reqQuery);
    reqQueryString = reqQueryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = model.find(JSON.parse(reqQueryString))

    // Only show selected fields in the results details
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort results by specific field(s)
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        // Descending order
        query = query.sort('-createdAt');
    }

    if (populate) {
        query = query.populate(populate);
    }

    // Pagination
    const limit       = parseInt(req.query.limit, 10);
    const page        = parseInt(req.query.page, 10);
    const finalLimit  = limit > 0 ? limit : 10;
    const currentPage = page > 0 ? page : 1;
    const startIndex  = (currentPage - 1) * limit;
    const endIndex    = (currentPage * limit);

    const totalResults = await model.countDocuments();

    query = query.skip(startIndex).limit(finalLimit);
    results = await query;

    let pagination = {
        current: { page: currentPage },
        total: { pages: Math.ceil(totalResults / finalLimit) },
    };

    if (startIndex > 0) {
        pagination.previous = {
            page: currentPage - 1,
        };
    }

    if (endIndex < totalResults) {
        pagination.next = {
            page: currentPage + 1,
        };
    }

    if (results.length === 0) {
        return next(new ErrorResponse(`${resourceName} not found`, 404));
    }

    res.results = {
        success: true,
        count: results.length,
        pagination: pagination,
        data: results,
    }

    next();
};


module.exports = filterResults;
