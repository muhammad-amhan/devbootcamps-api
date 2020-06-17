const fs        = require('fs');
const path      = require('path');
const mongoose  = require('mongoose');
const colors    = require('colors');
const dotenv    = require('dotenv');

// Load environment variables
dotenv.config({ path: './settings/config.env' });

const Bootcamp  = require('./models/Bootcamp');
const Course    = require('./models/Course');
const User      = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).catch((err) => {
    console.error(err.message);
    process.exit(1);
});

// Parse JSON
const bootcampsJSONPath = path.join(__dirname, '_data', 'bootcamps.json');
const courseJSONPath    = path.join(__dirname, '_data', 'courses.json');
const userJSONPath      = path.join(__dirname, '_data', 'users.json');

// Import into DB
const migrateData = async function () {
    try {
        const bootcamps = JSON.parse(fs.readFileSync(bootcampsJSONPath, 'utf-8'));
        const courses   = JSON.parse(fs.readFileSync(courseJSONPath, 'utf-8'));
        const users     = JSON.parse(fs.readFileSync(userJSONPath, 'utf-8'));

        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);

        console.log('Data Imported successfully...'.green.inverse);
        process.exit(0);

    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

const deleteData = async function () {
    await Bootcamp.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});

    console.log('Data deleted successfully...'.red.inverse);
    process.exit(0);
}

// Create a command to invoke importing the data or remove them
if ((process.argv[2] === 'migrate') || (process.argv[2] === '-m')) {
    // Handling the promise returned by async function
    migrateData().catch(err => { console.error(err.message) });

} else if ((process.argv[2] === 'delete') || (process.argv[2] === '-d')) {
    deleteData().catch(err => { console.error(err); });
} else {
  console.error('Usage:  migrate, -m  [move data] \n'.red +
                '        delete,  -d  [delete data]  '.red);
  process.exit(1);
}
