const mongoose = require('mongoose');

const connectDB = async function () {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    });
    console.log(`Connected to "${conn.connection.host}" database...`.blue);
}

module.exports = connectDB;
