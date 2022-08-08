//Including Mongoose model...
const mongoose = require('mongoose');
//creating object 
const Schema = mongoose.Schema;

//Schema for user
const userSchema = new Schema({

    name             : {type: String, required: true },
    email            : {type: String, required: true },
    password         : {type: String , required: true },
    role             : {type: String , required: true },
    institution      : {type: String },
    student_id       : {type: String },
    department       : {type: String },
    student_ip       : {type: String },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }

});

module.exports=mongoose.model('User',userSchema);