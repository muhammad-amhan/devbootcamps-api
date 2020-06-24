const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    title: {
        type: String,
        unique: true,
        trim: true,
        maxlength: 100,
        required: [true, 'Review title is required'],
    },
    text: {
        type: String,
        required: [true, 'Text is required'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please choose a rating between 1 and 10'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
});

// Prevent users from adding more than one review per bootcamp
// TODO come up with a better error response
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Add average rating for bootcamps based on their review ratings
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId },
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' },
            },
        },
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating,
        });
    } catch (err) {
        console.log(err.message);
    }
};

// TODO suppress the warning about an ignored promise
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
