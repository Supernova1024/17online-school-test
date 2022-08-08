const mongoose = require('mongoose');
     
const Schema  =  mongoose.Schema;

const testparamSchema = new Schema({

    title: {
        type: String
    },
    course: {
        type: String
    },
    database: {
        type: String
    },
    serial: {
        type: String
    },
    total_num: {
        type: Number
    },
    instructor_id: {
        type: String
    },
    json_path: {
        type: String
    },
    registered_users: {
        type: Array,
        default: []
    },
    testAttemptedBy: {
        type: Array,
        default: []
    },
    param: {
        type: String
    },
    values: Schema.Types.Mixed,
    expired: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Testparam', testparamSchema);