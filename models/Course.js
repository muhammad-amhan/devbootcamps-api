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
});

module.exports = mongoose.model('Course', CourseSchema);
