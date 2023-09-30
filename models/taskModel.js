const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({
    task: {
        type: String,
        required: true
    },
    user_id:{
        type: Schema.Types.ObjectId,
        required: true,
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;