const express = require('express');
const env = require('dotenv');
const morgan = require('morgan');
const bootcamps = require('./routes/bootcamps');

env.config({path: './settings/config.env'});

const app = express();
const PORT = process.env.PORT || 5000;
const environment = process.env.NODE_ENV;

// Development logging middleware - debug
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

app.listen(PORT, () => { console.log(`Server running in "${environment}" environment on port "${PORT}"`) });
