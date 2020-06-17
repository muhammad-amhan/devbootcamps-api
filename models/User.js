const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email',
        ],
        required: [true, 'Email is required'],
    },
    password: {
        type: String,
        minlength: 8,
        // Does not retrieve the password when retrieving the user, unless specified with a select operator in the query
        select: false,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

// Encrypt password
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JSON Web Token        instance method
UserSchema.methods.getSignedJWT = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match password with hashed password
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);
