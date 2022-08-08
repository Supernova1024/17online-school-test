var mongoose = require('mongoose');
const fs = require('fs');

// make a connection 
// mongoose.connect('mongodb+srv://brian:Gpim3KOtSwkODRKN@erud8.emtfd.mongodb.net/erud8?retryWrites=true&w=majority');
mongoose.connect('mongodb://localhost/examGround')
// get reference to database
var db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
    console.log("Connection Successful!");
     
    // define Schema
    var testSchema = mongoose.Schema({
      PKEY: Number,
      CHAP_KEY: Number,
      COURSE_KEY: Number,
      TOPIC_KEY: Number,
      Status: String,
      Language: String,
      Area: String,
      Subject: String,
      Course: String,
      Chapter: Number,
      Chapter_Name: String,
      Topic: String,
      Type: String,
      Difficulty: String,
      QTYPE: String,
      Question: String,
      Correct: String,
      Alt_1: String,
      Alt_2: String,
      Alt_3: String,
      Alt_4: String,
      Units: String,
      Objective: String,
      Blooms: String,
      AACSB: String,
      Accessibility: String,
      Table: String,
      Equation: String,
      Name: String,
      Time: Number,
      Origin: String,
      Added: String
    });
 
    // compile schema to model
    var TestQuestion = mongoose.model('acttestquestions', testSchema);
    
    fs.readFile('questions_actual_dev_fix_difficulty.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("File read failed:", err)
          return
      }
      // console.log('File data:', jsonString);

      parsed_result = JSON.parse(jsonString);
      console.log("the length is", parsed_result.length);
      for (var i = parsed_result.length - 1; i >= 0; i--) {

        var testQuestion = new TestQuestion(parsed_result[i])

        // save model to database
        testQuestion.save(function (err, test) {
          if (err) return console.error(err);
          console.log(test.Chapter_Name + " saved to TestQuestion collection.");
        });
      };
  });
});