const mongoose  = require('mongoose');
const slugify   = require('slugify');
const geocoder  = require('../utils/geocoder');
const mongooseValidation = require('mongoose-beautiful-unique-validation');

const Schema = mongoose.Schema;

const BootcampSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        unique: 'Bootcamp name is already taken',
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'], // or 50 if we don't add a custom message
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL e.g. https://www.example.com',
        ],
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email',
        ],
    },
    address: {
        type: String,
        required: [true, 'Please enter a valid address'],
    },
    // GeoJSON Point
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other',
        ],
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating cannot exceed 10'],
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg',
    },
    housing: {
        type: Boolean,
        default: false,
    },
    jobAssistance: {
        type: Boolean,
        default: false,
    },
    jobGuarantee: {
        type: Boolean,
        default: false,
    },
    acceptGi: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
},
{
    // Enable specific virtual fields we specify, to be included in the response
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Mongoose hooks / middleware
// Creates a slug from the bootcamp name e.g. test-bootcamp
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Creating a middleware to set the geo location of address field BEFORE saving to the database
BootcampSchema.pre('save', async function(next) {
    const location = await geocoder.geocode(this.address);
    console.log(location);

    this.location = {
        type: 'Point',
        coordinates: [location[0].longitude, location[0].latitude],
        formattedAddress: location[0].formattedAddress,
        street: location[0].streetName,
        state: location[0].stateCode,
        zipcode: location[0].zipcode,
        country: location[0].countryCode,
    }

    // We no longer want address to be stored in the DB since we have obtained the above info
    this.address = undefined;
    next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
    await this.model('Course').deleteMany({ bootcamp: this._id });
    next();
});

// Reverse populate with mongoose virtuals to support adding an array of courses in bootcamp objects
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false,
});

BootcampSchema.plugin(mongooseValidation);


module.exports = mongoose.model('Bootcamp', BootcampSchema);
