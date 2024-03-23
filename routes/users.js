const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }] 
});

userSchema.plugin(plm);

const User = mongoose.model("User", userSchema);

module.exports = User;
