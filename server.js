const express       = require('express');
const dotenv        = require('dotenv');
const fileUpload    = require('express-fileupload');
const morgan        = require('morgan');
const colors        = require('colors');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const helmet        = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean      = require('xss-clean');
const rateLimit     = require('express-rate-limit');
const hpp           = require('hpp');
const cors          = require('cors');
const logger        = require('./middlware/logger');
const connectDB     = require('./settings/database');
const errorHandler  = require('./middlware/error_handler');
const ErrorResponse = require('./utils/error_response');

// https://github.com/thedevsaddam/docgen
// The API documentation is in public/index.html and is generated using docgen and postman
// It is also publicly available at: https://documenter.getpostman.com/view/7464231/SzzrXZMH?version=latest

dotenv.config({ path: './settings/config.env' });
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || 'development';

// Development logging middleware - debug
if (process.env.NODE_ENV === 'development') {
    // Using the custom request logger instead of morgan, because why not :D
    // app.use(morgan('dev'));
    app.use(logger);
}
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Load resources
const bootcamps = require('./routes/bootcamps');
const auth      = require('./routes/auth');
const users     = require('./routes/users');
const base      = require('./routes/base');

// Limiting request rate
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: 'Temporarily blocked from making requests',
    statusCode: 429,
    skipSuccessfulRequests: true,
});

// Mount middleware such as JSON and cookies parser
app.use(express.json());
app.use(fileUpload({}));
app.use(cookieParser());
app.use(mongoSanitize());       // Security middleware
app.use(helmet());              // Adds few additional headers for more security
app.use(xssClean());            // Prevent XSS e.g. attackers won't be able to add <script> tags in names or titles or any field
app.use(limiter);
app.use(hpp());                 // Prevent HTTP param pollution
app.use(cors());                // Avoiding cross origin error when attempting to connect to the API from a different domain

// Mount resources
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1', base);

// Default route (404)
app.all('*', function (req, res, next) {
    return next(new ErrorResponse('Resource Not Found', 404));
});

// Custom error handler
// to be user in other resources such as bootcamps, it must come after mounting other resources
app.use(errorHandler);

// We assigned the server to a variable to be able to terminate the server on promise rejection exceptions
const server = app.listen( PORT,() => {
    console.log(`Server running in "${environment}" environment on port "${PORT}"...`.blue);
});

// This is instead of having try and catch block in `database.js` to handle promise rejection by async functions
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`.red);
   server.close(() => { process.exit(1); });
});

/** TODO - some ideas for future:
 *   1) Refresh tokens
 *   2) Provide the option to choose the slug for users profiles instead of (/auth/me)
 *   3) Upload user profile picture and create a public profile endpoint
 *   4) Confirm email upon registering
 *   5) OAuth
 *   6) Include deployment bash scripts to help others understand the process
 */
