const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const events = require('events');
const nodemailer = require('nodemailer');
const passport = require('passport');
const testRouter  = express.Router();
const userModel = mongoose.model('User');
const performanceModel = mongoose.model('Performance');

const tpModel = mongoose.model('Testparam');
const questionModel = mongoose.model('Testquestion');
const answerModel = mongoose.model('Testanswer');
 
//libraries and middlewares
const config = require('./../../config/config.js');
const responseGenerator = require('./../../libs/responseGenerator');
const auth = require("./../../middlewares/auth");
const random = require("randomstring");
var ObjectId = require('mongodb').ObjectID;
const spawn = require("child_process").spawn;
const fs = require('fs');

// *********** ALL API'S ********************//
function makeid(length) {
    var result           = [];
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * 
 charactersLength)));
   }
   return result.join('');
}


module.exports.controller = (app)=>{
	//route to get the current user
	testRouter.get('/currentUser',(req,res)=>{
		let user=req.user;
		res.send(user);
	});
	
	//route to get the all  users
	testRouter.get('/allusers/:role',(req,res)=>{
		userModel.find({'role': req.params.role},(err,users)=>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!users) {
				let response = responseGenerator.generate(false, "No Users registered in the system:(", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Users Available", 200, users);
				res.send(response);
			}

		});
	});

	//route to get the all  users
	testRouter.get('/allstudents',(req,res)=>{
		userModel.find({'role': 'student'},(err,users)=>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!users) {
				let response = responseGenerator.generate(false, "No Users registered in the system:(", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Users Available", 200, users);
				res.send(response);
			}

		});
	});

	//route to get the all  users
	testRouter.get('/allinstructors',(req,res)=>{
		userModel.find({'role': 'instructor'},(err,users)=>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!users) {
				let response = responseGenerator.generate(false, "No Users registered in the system:(", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Users Available", 200, users);
				res.send(response);
			}

		});
	});

	//route to get the all  users
	testRouter.put('/edit/:uid',(req,res)=>{

		var user = {
			'name': req.body.firstname + ' ' + req.body.lastname,
			'email': req.body.email,
			'department': req.body.department,
			'role': req.body.role,
			'institution': req.body.institution
		}
		userModel.findOneAndUpdate({'_id': req.params.uid}, user, (err,user)=>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!user) {
				let response = responseGenerator.generate(false, "No Users registered in the system:(", 200, user);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Users Available", 200, user);
				res.send(response);
			}
		});
	});

	// API to get all tests in DB for Students
	testRouter.get('/selectDB/:db',  (req, res) =>{
		if (req.params.db == 'act') {
			req.session['db'] = 'Acttestquestion';
		} else {
			req.session['db'] = 'Devtestquestion';
		}
		var result = {
			'db': req.session['db']
		};
		let response = responseGenerator.generate(false, "Database selected", 200, result);
		res.send(response);
	});

	// API to get all tests in DB for Students
	testRouter.get('/allTestsbyID/:uid',  (req, res) =>{
		// console.log('req.params.tid', req.params.tid)
		tpModel.find({
			'registered_users.id': ObjectId(req.params.uid)
		},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Tests Available", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Tests Available", 200, result);
				res.send(response);
			}
		});
	});

	// API to get all test results for specific 
	testRouter.get('/view_testresults/:tid',  (req, res) =>{
		// console.log('req.params.tid', req.params.tid)
		tpModel.find({
			'registered_users.id': ObjectId(req.params.tid)
		},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Tests Available", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Tests Available", 200, result);
				res.send(response);
			}
		});
	});

	// API to get all tests in DB for Instructors
	testRouter.get('/allTestsbyInstructorID/:tid',  (req, res) =>{
		tpModel.find({
			'instructor_id': ObjectId(req.params.tid)
		},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Tests Available", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Tests Available", 200, result);
				res.send(response);
			}
		});
	});

	// API to get all tests in DB
	testRouter.get('/allTests',  (req, res) =>{
		tpModel.find({
			'registered_users.id': ObjectId(req.params.tid)
		},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Tests Available", 200, result);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Tests Available", 200, result);
				res.send(response);
			}
		});
	});

	// API to get data for report
	testRouter.get('/report/:tid/:uid', function (req, res) {
			performanceModel.findOne({
				'testId': req.params.tid
			},  (err, Performance) =>{
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(response);
				} else {
					questionModel.findOne({
						'_id': Performance.question_id
					},  (err, questions) =>{
						if (err) {
							let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
							res.send(response);
						} else {
							answerModel.findOne({
								'_id': Performance.answer_id
							},  (err, correct_answers) =>{
								if (err) {
									let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
									res.send(response);
								} else {
									var result = Performance;
									const real_answers = Performance.answers;
									result['_doc']['performenced_questions'] = questions.questions;
									result['_doc']['correct_answers'] = correct_answers.answers;
									result['_doc']['your_answers'] = real_answers;
									let response = responseGenerator.generate(false, "Test Details", 200, result);
									res.send(response);
								}
							});	
						}
					});			
				}
			});
		});

	// API to get a complete details of test
	testRouter.get('/test/:tid', function (req, res) {
			tpModel.findOne({
				'_id': req.params.tid
			},  (err, result) =>{
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(response);
				} else {
					let response = responseGenerator.generate(false, "Test Details", 200, result);
					res.send(response);				
				}
			});
		});

	// API to get a test questions
	testRouter.get('/alltestquestions', function (req, res) {
		tpModel.find({},  (err, result) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Test Details", 200, result);
				res.send(response);
			}
		});
	});

	// API to delete test
	testRouter.get('/test/delete/:id',  (req, res)=> {
		tpModel.findOneAndRemove({
			'_id': req.params.id
		},  (err)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Test Deleted", 200, null);
				res.send(response);
			}
		});
	});

	// API to delete user
	testRouter.get('/delete/:id',  (req, res)=> {
		userModel.findOneAndRemove({
			'_id': req.params.id
		},  (err)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "User Deleted", 200, null);
				res.send(response);
			}
		});
	});
		// API to delete category
		testRouter.post('/area/delete/',  (req, res)=> {
			// console.log('id', req.body.id)
			areaModel.findByIdAndRemove(req.body.id, (err)=> {
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(response);
				} else {
					let response = responseGenerator.generate(false, "Area Deleted Successfully.", 200, null);
					res.send(response);
				}
			});
		});

		testRouter.post('/subject/delete/',  (req, res)=> {
			// console.log('area_id', req.body.area_id)
			// console.log('subject_id', req.body.subject_id)
			areaModel.findOneAndUpdate({
				'_id': req.body.area_id
			}, {
				"$pull": {
					"subjects": {
						_id: req.body.subject_id
					}
				}
			},  (err, result) =>{
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(result);
				} else {
					let response = responseGenerator.generate(false, "Subject Deleted Successfully.", 200, result);
					res.send(response);
				}
			});
		});

		testRouter.post('/course/delete/',  (req, res)=> {
			// console.log('area_id', req.body.area_id)
			// console.log('subject_id', req.body.subject_id)
			// console.log('course_id', req.body.course_id)
			areaModel.findOneAndUpdate({
				'_id': req.body.area_id,
				'subjects._id': req.body.subject_id
			}, {
				"$pull": {
					"subjects.$.courses": {
						_id: req.body.course_id
					}
				}
			},  (err, result) =>{
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(result);
				} else {
					let response = responseGenerator.generate(false, "Course Deleted Successfully.", 200, result);
					res.send(response);
				}
			});
		});

		testRouter.post('/chapter/delete/',  (req, res)=> {
			// console.log('area_id', req.body.area_id)
			// console.log('subject_id', req.body.subject_id)
			// console.log('course_id', req.body.course_id)
			// console.log('chapter_id', req.body.chapter_id)

			areaModel.findOneAndUpdate({
				_id: req.body.area_id
			}, {
				"$pull": {
					"subjects.$[].courses.$[].chapters": {
						_id: req.body.chapter_id
					}
				}
			},  (err, result) =>{
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(result);
				} else {
					let response = responseGenerator.generate(false, "Chapter Deleted Successfully.", 200, result);
					res.send(response);
				}
			});
		});

		testRouter.post('/topic/delete/',  (req, res)=> {
			// console.log('area_id', req.body.area_id)
			// console.log('subject_id', req.body.subject_id)
			// console.log('course_id', req.body.course_id)
			// console.log('chapter_id', req.body.chapter_id)
			// console.log('topic_id', req.body.topic_id)

			areaModel.findOneAndUpdate({
				'_id': req.body.area_id
			}, {
				"$pull": {
					"subjects.$[].courses.$[].chapters.$[].topics": {
						_id: req.body.topic_id
					}
				}
			},  (err, result) =>{
				if (err) {
					let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(result);
				} else {
					let response = responseGenerator.generate(false, "Topic Deleted Successfully.", 200, result);
					res.send(response);
				}
			});
		});

			//to get all questions by User as well as Admin
			testRouter.get('/test/:tid/getQuestions',  (req, res)=> {
				questionModel.findById(req.params.tid,  (err, test)=> {
					if (err) {
						let error = responseGenerator.generate(true, "Something is not working, error : " + err, 500, null);
						res.send(error);
					} else {
						let response = responseGenerator.generate(false, "All Questions fetched successfully", 200, test);
						res.send(response);
					}
				})
			});

			// api to store test attempted 	by users 
			testRouter.post('/tests/:tid/attemptedby',  (req, res) =>{
				let date_ob = new Date();
				// current date
				// adjust 0 before single digit date
				let date = ("0" + date_ob.getDate()).slice(-2);

				// current month
				let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

				// current year
				let year = date_ob.getFullYear();

				// current hours
				let hours = date_ob.getHours();

				// current minutes
				let minutes = date_ob.getMinutes();

				// current seconds
				let seconds = date_ob.getSeconds();

				// prints date & time in YYYY-MM-DD HH:MM:SS format
				let datetime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
				
				var data={
					userid: req.body.userid,
					score: req.body.score,
					total_score: req.body.total_score,
					datetime: datetime
				}
				tpModel.findOneAndUpdate({
					'_id': req.params.tid
				}, {
					'$push': {
						testAttemptedBy: data
					}
				}, (err)=> {
					if (err) {
						let response = responseGenerator.generate(true, "Some Error Ocurred, error : " + err, 500, null);
						res.send(response);
					} else {
						let response = responseGenerator.generate(false, "Successfully Updated The Test", 200, null);
						res.send(response);
					}
				});
			});


		//API to get tests attempted by a user
			testRouter.get('/usertests/:tid',  (req, res) =>{
				
				testModel.find({
					testid: req.params.tid
				},  (err, result)=> {
					if (err) {
						response = responseGenerator.generate(true, "Some Internal Error", 500, null);
						res.send(response);
					} else if (result === null || result === undefined || result === []) {
						let error = responseGenerator.generate(false, "No users attempted the test!", 204, null);
						res.send(error);
					}
					else {
						response = responseGenerator.generate(false, "Tests Taken By User", 200, result.testAttemptedBy);
						res.send(response);
					}
				});
			});

		//API to get the performances of all users
		testRouter.get('/all/performances',  (req, res) =>{
   			 //api to get  performance user specific
			performanceModel.find({},  (err, Performances)=> {
				if (err) {
					let error = responseGenerator.generate(true, "Something is not working, error : " + err, 500, null);
					res.send(error);
		  
				} else {
					let response = responseGenerator.generate(false, "Performances fetched successfully!!!", 200, Performances);
					res.send(response);
				}
			});
		});

		// //API to get the performance of all users in a particular test

		testRouter.get('/all/performance/:tid',  (req, res) =>{
   			 //api to get  performance user specific
			performanceModel.find({
			   	 testId:req.params.tid,
			},  async (err, Performances)=> {
				if (err) {
					let error = responseGenerator.generate(true, "Something is not working, error : " + err, 500, null);
					res.send(error);
				} else {
					var result = [];
					var temp = Performances[0]
					const correct_answers = await answerModel.findById(Performances[0].answer_id).exec();
					const questions = await questionModel.findById(Performances[0].question_id).exec();
					const real_answers = Performances[0].answers
					var answer_results = {}
					for (const [key, value] of Object.entries(correct_answers.answers[0])) {
						real_answers.every(item =>{
							if (item !== null && typeof item !== 'undefined') {
								if(item['qid'] == value['pkey']) {
									var inner_key = value['qtype'].toLowerCase() + '_' + value['type'].toLowerCase() + '_' + value['difficulty'].toLowerCase();
									if (typeof answer_results[inner_key] == 'undefined') answer_results[inner_key] = {'correct': 0, 'total': 0};
									if (value['correct'] == item['option']) {
										answer_results[inner_key]['correct'] += 1;
									}
									answer_results[inner_key]['total'] += 1;
									return false;
								}
							}
							return true;
						});
					}
					const user = await userModel.findById(Performances[0].user_id).exec();
					const test = await tpModel.findById(Performances[0].testId).exec();
					temp['_doc']['user'] = user.name
					var test_param = {
						'title': test.title,
						'serial': test.serial
					}
					temp['_doc']['test'] = test_param
					temp['_doc']['analysis'] = answer_results
					temp['_doc']['questions'] = questions
					temp['_doc']['correct_answers'] = correct_answers['answers']
					temp['_doc']['your_answers'] = real_answers
					result.push(temp);
					let response = responseGenerator.generate(false, "TotalPerformance of user in all Tests fetched successfully!!!", 200, result);
					res.send(response);
				}
			});
		});

		//API to get the performance of a single user in a particular test

		testRouter.post('/performance',  (req, res) =>{
   			//api to get  performance user specific
			performanceModel.findOne({
			   	$and:[{user_id: req.body.userid} , {testId:req.body.testid}]
			},  (err, Performance) =>{
				if (err) {
					let error = responseGenerator.generate(true, "Something is not working, error : " + err, 500, null);
					res.send(error);
		  
				} else {
					let response = responseGenerator.generate(false, "TotalPerformance of user in all Tests fetched successfully!!!", 200, Performance);
					res.send(response);
				}
			});
		});


		//API to add the performance of the user
	testRouter.post('/addPerformance',  (req, res) =>{
		answerModel.findById(req.body.correct_answer_id,  (err, result) =>{
			let answers = req.body.answers;
			let correct_answers = result;
			var index =  req.body.noOfQuestions - 1;
			console.log('total length', index)
			var stu_credit = 0;
			var total_credit = 0;
			var totalCorrectAnswers = 0;
			var totalSkipped = 0;
			for (const [key, value] of Object.entries(correct_answers.answers[0])) {
				answers.every(item =>{
					if (item !== null && typeof item !== 'undefined') {
						console.log("value", value)
						console.log("item", item)
						if (value['pkey'] == item['qid']) {
							if (value['correct'] == item['option']) {
								console.log("value['correct']", value['correct'])
								console.log("item", item['option'])
								stu_credit += value['credit']
								totalCorrectAnswers += 1;
							}
							return false;
						}
					} else {
						totalSkipped += 1;
					}
					return true;
				});
				total_credit += value['credit'];
			};
			let perform_value = {
				user_id: req.body.userid,
				testId: req.body.testid,
				question_id: req.body.question_id,
				answer_id: req.body.correct_answer_id,
				questionCount: req.body.noOfQuestions,
				answers: answers,
				score: stu_credit,
				total_score: total_credit,
				timeTaken: req.body.timetaken,
				totalCorrectAnswers: totalCorrectAnswers,
				totalSkipped: totalSkipped
			};
			let performance = new performanceModel(perform_value);
			performance.save( (err, result) =>{
				if (err) {
					response = responseGenerator.generate(true, "Some Internal Error", 500, null);
					res.send(response);
				} else {
					response = responseGenerator.generate(false, "Added Test Performance Successfully", 200, performance);
					res.send(response);
				}
			});
		});
	});

	// Api to create a new Area By Admin
	testRouter.post('/admin/createareaofstudy',  (req, res) =>{
		let newArea = new areaModel({
			name: req.body.name,
			description: req.body.description
		});

		newArea.save( (err, course) => {
			if (err) {
				let error = responseGenerator.generate(true, "Some Error Ocurred, error : " + err, 500, null);
				res.send(error);
			} else {
				let response = responseGenerator.generate(false, "Successfully Created An Area of Study", 200, course);
				res.send(response);
			}
		});

	}); //end area creation

	// API to get all areas in DB
	testRouter.get('/allAreas',  (req, res) =>{

		areaModel.find({},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				// console.log('result', result)
				result.forEach(item => {
					subjectModel.find({courseid: item._id}, (err, subjects)=> {
						if (err) {
							item.subjects = [];
						} else {
							item.subjects = subjects;
						}
					});
				});
					
				let response = responseGenerator.generate(false, "Courses Available", 200, result);
				res.send(response);
			}
		});
	});

	// API to get all areas in DB
	testRouter.get('/getallAreas',  (req, res) =>{

		var tqModel = null;
		if (typeof req.session.db === 'undefined') {
			tqModel = mongoose.model('Devtestquestion');
		} else {
			tqModel = mongoose.model(req.session.db);
		}		
		tqModel.find({},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				var categories = []
				result.forEach(item => {
					var index = categories.indexOf(item.Area);
					if (index <= -1) {
						categories.push(item.Area)
					}
				});

				// result.forEach(item => {
				// 	if (!(item.Area in categories)) {
				// 		// categories[item.Area] = []
				// 		var area = {}
				// 		area[item.Area] = []
				// 		categories.push(area)
				// 		// console.log('Final', categories);
				// 		if (!(item.Subject in categories[item.Area])) {
				// 			// categories[item.Area][item.Subject] = []
				// 			var subject = {}
				// 			subject[item.Subject] = []
				// 			categories[item.Area].push(subject)
				// 			// console.log('Final', categories);
				// 			if (!(item.Course in categories[item.Area][item.Subject])) {
				// 				// categories[item.Area][item.Subject][item.Course] = []
				// 				var course = {}
				// 				course[item.Course] = []
				// 				categories[item.Area][item.Subject].push(course)
				// 				// console.log('Final', categories);
				// 				if (!(item.Chapter_Name in categories[item.Area][item.Subject][item.Course])) {
				// 					// categories[item.Area][item.Subject][item.Course][item.Chapter_Name] = [];
				// 					var chapter = {}
				// 					chapter[item.Chapter_Name] = []
				// 					categories[item.Area][item.Subject][item.Course].push(chapter)
				// 					// console.log('Final', categories);
				// 					if (!(item.Topic in categories[item.Area][item.Subject][item.Course][item.Chapter_Name])) {
				// 						categories[item.Area][item.Subject][item.Course][item.Chapter_Name].push(topic)
				// 						var topic = {}
				// 						topic[item.Chapter_Name] = []
				// 						// console.log('Final', categories);
				// 					}
				// 				}
				// 			}
				// 		}
				// 	}
				// });

				let response = responseGenerator.generate(false, "Areas Available", 200, categories);
				res.send(response);
			}
		});
	});

	// API to get all subjects in DB
	testRouter.get('/allSubjects/:sub_name',  (req, res) =>{
		const tqModel = mongoose.model(req.session.db);
		tqModel.find({Area:req.params.sub_name},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				var categories = []
				result.forEach(item => {
					var index = categories.indexOf(item.Subject)
					if (index <= -1) {
						categories.push(item.Subject)
					}
				});
				let response = responseGenerator.generate(false, "Areas Available", 200, categories);
				res.send(response);
			}
		});
	});
	// Api to create a new Subject By Admin
	testRouter.post('/admin/createsubject',  (req, res) =>{
		areaModel.findOneAndUpdate({
			'_id': req.body.area_id
		}, {
			'$push': {
				subjects: req.body
			}
		}, {new: true}, (err, area) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				//console.log(result);
				let response = responseGenerator.generate(false, "Subject added Successfully", 200, area);
				res.send(response);
			}
		});

	}); //end area creation

	// API to get all areas in DB
	testRouter.get('/allAreas',  (req, res) =>{

		areaModel.find({},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				// console.log('result', result)
				result.forEach(item => {
					subjectModel.find({courseid: item._id}, (err, subjects)=> {
						if (err) {
							item.subjects = [];
						} else {
							item.subjects = subjects;
						}
					});
				});
					
				let response = responseGenerator.generate(false, "Courses Available", 200, result);
				res.send(response);
			}
		});
	});

	// API to get all subjects in DB
	testRouter.post('/generateTQ',  (req, res) =>{

		var testid = req.body.testid;
		var userid = req.body.userid;

		tpModel.findById(testid,  (err, result) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				const pythonProcess = spawn('python',["make_test3.py", result._id]);
				pythonProcess.stdout.on('data', (data) => {
				    // Do something with the data returned from python script
				    console.log('log here', data.toString());
				    var qa_result = JSON.parse(data.toString());
				    let response = responseGenerator.generate(false, "Test Details", 200, qa_result);
					res.send(response);
				});				
			}
		});
	});

	// Api to create a new test By Admin
	testRouter.post('/admin/submitTest',  (req, res) =>{
		var json_data = req.body.test;
		let newTestparam = new tpModel({
			title: json_data.test_name,
			course: json_data.course,
			database: json_data.db,
			serial: json_data.request_serial,
			total_num: json_data.number_tests,
			instructor_id: json_data.requestor_id,
			param:  makeid(40),
			values: req.body.test,
			expired: json_data.expired
		});

		newTestparam.save( (err, testparam) => {
			if (err) {
				let error = responseGenerator.generate(true, "Some Error Ocurred, error : " + err, 500, null);
				res.send(error);
			} else {
				let response = responseGenerator.generate(false, "Successfully Created An Test Parameter", 200, testparam);
				res.send(response);
			}
		});

	}); //end course creation

	// API to edit test
	testRouter.put('/admin/editTest/:tid',  (req, res) =>{
		var json_data = req.body.test;
		if (typeof json_data.test_name == 'undefined') json_data.test_name = '';
		if (typeof json_data.number_tests == 'undefined') json_data.number_tests = '';
		if (typeof json_data.request_serial == 'undefined') json_data.request_serial = '';
		if (typeof json_data.request_time == 'undefined') json_data.request_time = '';

		tpModel.findOneAndUpdate({
			"_id": req.params.tid
		}, {
			"$set": {
				"title"     : json_data.test_name,
				"total_num" : json_data.number_tests,
				"serial"    : json_data.request_serial,
				"values"    : json_data
			}
		},  (err) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Test Edited Successfully", 200, null);
				res.send(response);
			}
		});
	});

	// Api to create a new Course By Admin
	testRouter.post('/admin/createCourse',  (req, res) =>{
		var subject_key = "subjects."+req.body.subject_id+".courses";
		var push_json = {};
		let newCourse = {
			name: req.body.name,
			description: req.body.description
		};
		push_json[subject_key] = newCourse;

		areaModel.findOneAndUpdate({
			_id: req.body.area_id
		}, {
			$push: push_json
		}, {
			new: true
		}, (err, area) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Course added Successfully", 200, area);
				res.send(response);
			}
		});

	}); //end course creation

	// API to get all courses in DB
	testRouter.post('/allCourses',  (req, res) =>{
		const tqModel = mongoose.model(req.session.db);
		tqModel.find({Area: req.body.area, Subject: req.body.subject},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				var categories = []
				result.forEach(item => {
					var index = categories.indexOf(item.Course)
					if (index <= -1) {
						categories.push(item.Course)
					}
				});
				let response = responseGenerator.generate(false, "Areas Available", 200, categories);
				res.send(response);
			}
		});
	});

	// API to get all courses in DB
	testRouter.post('/allChapters',  (req, res) =>{
		const tqModel = mongoose.model(req.session.db);
		tqModel.find({Area: req.body.area, Subject: req.body.subject, Course: req.body.course},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				var categories = []
				result.forEach(item => {
					var index = categories.indexOf(item.Chapter_Name)
					if (index <= -1) {
						categories.push(item.Chapter_Name)
					}
				});
				let response = responseGenerator.generate(false, "Areas Available", 200, categories);
				res.send(response);
			}
		});
	});

	// API to get all courses in DB
	testRouter.post('/allTopics',  (req, res) =>{
		const tqModel = mongoose.model(req.session.db);
		tqModel.find({Area: req.body.area, Subject: req.body.subject, Course: req.body.course, Chapter_Name: req.body.chapter},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = responseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				var categories = []
				result.forEach(item => {
					var index = categories.indexOf(item.Topic)
					if (index <= -1) {
						categories.push(item.Topic)
					}
				});
				// console.log('categories', categories)
				let response = responseGenerator.generate(false, "Areas Available", 200, categories);
				res.send(response);
			}
		});
	});

	// API to get all courses in DB
	testRouter.post('/allTopicDetails',  (req, res) =>{
		const tqModel = mongoose.model(req.session.db);
		tqModel.find({Area: req.body.area, Subject: req.body.subject, Course: req.body.course, Chapter_Name: req.body.chapter, Topic: req.body.topic},  (err, result)=> {
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else if (!result) {
				let response = reresponseGenerator.generate(false, "No Areas Available", 200, result);
				res.send(response);
			} else {
				var categories = {}
				result.forEach(item => {
					if (item.Difficulty == 'Medium') item.Difficulty = 'Med'
					var str_key = item.QTYPE + "-" + item.Type + "-" + item.Difficulty;
					if (categories[str_key] !== undefined) {
						categories[str_key]['n'] = categories[str_key]['n'] + 1;
					} else {
						categories[str_key] = {
							'n': 1,
							'cr': 0
						}
					}
				});
				// console.log('categories', categories)
				let response = responseGenerator.generate(false, "Areas Available", 200, categories);
				res.send(response);
			}
		}).sort({Chapter: 1, Topic: 1});
	});

	// Api to create a new Chapter By Admin
	testRouter.post('/admin/createChapter',  (req, res) =>{
		var subject_key = "subjects."+req.body.subject_id+".courses."+req.body.course_id+".chapters";
		var push_json = {};
		let newChapter = {
			name: req.body.name,
			description: req.body.description
		};
		push_json[subject_key] = newChapter;

		areaModel.findOneAndUpdate({
			_id: req.body.area_id
		}, {
			$push: push_json
		}, {
			new: true
		}, (err, area) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Chapter added Successfully", 200, area);
				res.send(response);
			}
		});

	}); //end chapter creation

	// API to edit user
	testRouter.put('/edit/:qid',  (req, res) =>{
		// console.log('userid', req.params.qid);
		// console.log('req.body', req.body);
		if (typeof req.body.title == 'undefined') req.body.title = '';
		if (typeof req.body.department == 'undefined') req.body.department = '';
		if (typeof req.body.student_id == 'undefined') req.body.student_id = '';
		if (typeof req.body.expected_year == 'undefined') req.body.expected_year = '';
		if (typeof req.body.institution == 'undefined') req.body.institution = '';
		// console.log('req.body', req.body);
		userModel.findOneAndUpdate({
			"_id": req.params.qid
		}, {
			"$set": {
				"email": req.body.email,
				"title": req.body.title,
				"department": req.body.department,
				"title": req.body.title,
				"student_id": req.body.student_id,
				"expected_year": req.body.expected_year,
				"institution": req.body.institution
			}
		},  (err) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "User Edited Successfully", 200, null);
				res.send(response);
			}
		});
	});

	// Api to create a new Topic By Admin
	testRouter.post('/admin/createTopic',  (req, res) =>{
		var subject_key = "subjects."+req.body.subject_id+".courses."+req.body.course_id+".chapters."+req.body.chapter_id+".topics";
		var push_json = {};
		let newTopic = {
			name: req.body.name,
			description: req.body.description
		};
		push_json[subject_key] = newTopic;

		areaModel.findOneAndUpdate({
			_id: req.body.area_id
		}, {
			$push: push_json
		}, {
			new: true
		}, (err, area) =>{
			if (err) {
				let response = responseGenerator.generate(true, "Some Internal Error", 500, null);
				res.send(response);
			} else {
				let response = responseGenerator.generate(false, "Topic added Successfully", 200, area);
				res.send(response);
			}
		});

	}); //end Topic creation


	app.use('/user',auth.verifyToken,testRouter);		


}


