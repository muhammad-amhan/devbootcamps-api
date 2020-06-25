const express       = require('express');
const env           = require('dotenv');
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

env.config({ path: './settings/config.env' });
connectDB();

const app = express();
const PORT = process.env.PORT;
const environment = process.env.NODE_ENV;

// Development logging middleware - debug
if (process.env.NODE_ENV === 'development') {
    // Using the below request logger to simulate how morgan works
    // app.use(morgan('dev'));
    app.use(logger);
}
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Load resources
const bootcamps = require('./routes/bootcamps');
const courses   = require('./routes/courses');
const auth      = require('./routes/auth');
const users     = require('./routes/users');
const reviews   = require('./routes/reviews');

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
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

// Custom error handler
// to be user in other resources such as bootcamps, it must come after mounting other resources
app.use(errorHandler);

let port = process.argv[2] || PORT || 5000;

if (port.includes('=')) {
    port = port.split('=')[1];
}

// We assigned the server to a variable to be able to terminate the server on promise rejection exceptions
const server = app.listen(port, () => {
    console.log(`Server running in "${environment}" environment on port "${port}"...`.blue);
});

// This is instead of having try and catch block in `database.js` to handle promise rejection by async functions
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`.red);
   server.close(() => { process.exit(1); });
});

