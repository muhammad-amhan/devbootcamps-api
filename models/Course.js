const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Course title is required'],
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
    },
    weeks: {
        type: String,
        required: [true, 'Course duration must be specified'],
    },
    tuition: {
        type: Number,
        required: [true, 'Tuition cost is required'],
    },
    minimumSkill: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: [true, 'Please specify the level of skill'],
    },
    scholarshipsAvailable: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp', // Bootcamp model
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
});

// Static method on the model to get the average of the course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    const average = await this.aggregate([
        {
            $match: { bootcamp: bootcampId },
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' },
            }
        }
    ]);
    // Adding the averageCost to bootcamps
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(average[0].averageCost / 10) * 10,
        })
    } catch (err) {
        console.log(err.message);
    }
}

// getAverageCost after saving the course information
CourseSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp).then(() => {});  // Suppressing the promise warning
});

// getAverageCost before remove
CourseSchema.pre('remove', function () {
    this.constructor.getAverageCost(this.bootcamp).catch(console.error); // Also suppresses the ignored promise warning
});


module.exports = mongoose.model('Course', CourseSchema);
