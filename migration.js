const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './settings/config.env' });

const Bootcamp = require('./models/Bootcamp');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

// Parse JSON
const bootcampsJsonPath = path.join(__dirname, '_data', 'bootcamps.json');
const bootcamps = JSON.parse(fs.readFileSync(bootcampsJsonPath, 'utf-8'));

// Import into DB
const migrateData = async function () {
    try {
        await Bootcamp.create(bootcamps);
       console.log('Data migrated successfully...'.green.inverse);
        process.exit(0);

    } catch (err) {
        console.error(err.message);
    }
}

const deleteData = async function () {
    try {
        await Bootcamp.deleteMany();
        console.log('Data deleted successfully...'.red.inverse);
        process.exit(0);

    } catch (err) {
        console.error(err.message);
    }
}

// Create a command to invoke importing the data or remove them
if ((process.argv[2] === 'migrate') || (process.argv[2] === '-m')) {
    // Handling the promise returned by async function
    migrateData().catch(err => { console.error(err) });

} else if ((process.argv[2] === 'delete') || (process.argv[2] === '-d')) {
    deleteData().catch(err => { console.error(err); });
} else {
  console.error('Usage:  migrate, -m  [move data] \n'.red +
                '        delete,  -d  [delete data]  '.red);
  process.exit(1);
}
