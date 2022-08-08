//Including Mongoose model...
const mongoose = require('mongoose');
//creating object 
const Schema = mongoose.Schema;
//Schema for user
const answerSchema = new Schema({

    serial             : {type: String, required: true },
    test_name          : {type: String, required: true },
    student_machine    : {type: String , required: true },
    area               : {type: String , required: true },
    subject            : {type: String },
    course             : {type: String },
    language           : {type: String },
    request_serial     : {type: String },
    answers            : {type: Array, default: []},
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Testanswer',answerSchema);