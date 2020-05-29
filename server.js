const express = require('express');
const env = require('dotenv');
const logger = require('./middlware/logger');
const morgan = require('morgan');
const colors  = require('colors');

const connectDB = require('./settings/database');

env.config({path: './settings/config.env'});

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV;

// Development logging middleware - debug
if (process.env.NODE_ENV === 'development') {
    // app.use(morgan('dev')); // Instead, I will use the custom made middleware logger
    app.use(logger);
}

// Load resources
const bootcamps = require('./routes/bootcamps');

// Mount resources routers
app.use('/api/v1/bootcamps', bootcamps);

// We assigned the server to a variable to be able to terminate the server on promise rejection exceptions
const server = app.listen(PORT, () => {
    console.log(`Server running in "${environment}" environment on port "${PORT}"...`.blue);
});

// This is instead of having try and catch block in `database.js` async function
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`.red);
   server.close(() => { process.exit(1); });
});

