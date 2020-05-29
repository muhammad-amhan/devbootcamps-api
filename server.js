const express = require('express');
const env = require('dotenv');
// Route files
const bootcamps = require('./routes/bootcamps');

// Loading config file
env.config({path: './settings/config.env'});

const app = express();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV;

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

// () => {} or function () {}
app.listen(PORT, () => { console.log(`Server running in "${environment}" environment on port "${PORT}"`) });
