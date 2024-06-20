const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: "pending"
    },
    output: {
        type: String,
        default: null
    },
    error : {
        type : String
    }
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result