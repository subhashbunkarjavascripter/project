const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    taskType:{
        type:String,
        required:true,
    },
    description: {
        type: String
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["pending", "done"],
        default: "pending"
    },
    deadline: {
        type: Date
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
