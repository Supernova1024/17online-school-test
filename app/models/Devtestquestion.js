const mongoose = require('mongoose');
     
const Schema  =  mongoose.Schema;

const devtestSchema = new Schema({
    PKEY: {
        type: Number
    },
    CHAP_KEY: {
        type: Number
    },
    COURSE_KEY: {
        type: Number
    },
    TOPIC_KEY: {
        type: Number
    },
    Status: {
        type: String
    },
    Language: {
        type: String
    },
    Area: {
        type: String
    },
    Subject: {
        type: String
    },
    Course: {
        type: String
    },
    Chapter: {
        type: Number
    },
    Chapter_Name: {
        type: String
    },
    Topic: {
        type: String
    },
    Type: {
        type: String
    },
    Difficulty: {
        type: String
    },
    QTYPE: {
        type: String
    },
    Question: {
        type: String
    },
    Correct: {
        type: String
    },
    Alt_1: {
        type: String
    },
    Alt_2: {
        type: String
    },
    Alt_3: {
        type: String
    },
    Alt_4: {
        type: String
    },
    Units: {
        type: String
    },
    Objective: {
        type: String
    },
    Blooms: {
        type: String
    },
    AACSB: {
        type: String
    },
    Accessibility: {
        type: String
    },
    Table: {
        type: String
    },
    Equation: {
        type: String
    },
    Name: {
        type: String
    },
    Time: {
        type: Number
    },
    Origin: {
        type: String
    },
    Added: {
        type: String
    },
});

module.exports = mongoose.model('Devtestquestion', devtestSchema);