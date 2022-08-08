const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PerformanceSchema = new Schema({

  user_id: {
   type: String, required:true
  },
  testId:{
    type: String
  },
  question_id: {
   type: String, required:true
  },
  answer_id: {
   type: String, required:true
  },
  answers: Schema.Types.Mixed,
  score: {
    type: Number,
    default: 0
  },
  total_score: {
    type: Number,
    default: 0
  },
  questionCount:{
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  totalCorrectAnswers: {
    type: Number,
    default: 0
  },
   totalSkipped: {
    type: Number,
    default: 0
  },
  created: {
      type: Date,
      default: Date.now
  }
})
module.exports = mongoose.model('Performance', PerformanceSchema)
