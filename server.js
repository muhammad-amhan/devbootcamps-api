const express = require('express');
const env = require('dotenv');
const morgan = require('morgan');
const colors  = require('colors');

const logger = require('./middlware/logger');
const connectDB = require('./settings/database');
const errorHandler = require('./middlware/error_handler');

env.config({path: './settings/config.env'});
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV;

// Development logging middleware - debug
if (process.env.NODE_ENV === 'development') {
    // app.use(morgan('dev')); // Using the below request logger to simulate how morgan works
    app.use(logger);  // Custom middleware logger
}
// Load resources
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// JSON request body parser
app.use(express.json());

// Mount resources
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/bootcamps', courses);

// Custom error handler - every middleware must run through app.use()
// to be user in other resources such as bootcamps, it must come after mounting other resources
app.use(errorHandler);

// We assigned the server to a variable to be able to terminate the server on promise rejection exceptions
const server = app.listen(PORT, () => {
    console.log(`Server running in "${environment}" environment on port "${PORT}"...`.blue);
});

// This is instead of having try and catch block in `database.js` to handle promise rejection by async functions
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`.red);
   server.close(() => { process.exit(1); });
});

