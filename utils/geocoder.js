const NodeGeocoder = require('node-geocoder');

const geocoderProvider = process.env.GEOCODER_PROVIDER;
const secret = process.env.GEOCODER_API_KEY;

const options = {
    provider: geocoderProvider,
    httpAdapter: 'https',
    apiKey: secret,
    formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

