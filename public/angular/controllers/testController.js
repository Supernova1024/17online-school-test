myApp.controller('testController',['$http','$q','$window','$stateParams','$filter','apiService','authService','$rootScope','$location','$state','$interval',function($http,$q,$window,$stateParams,$filter,apiService,authService,$rootScope,$location,$state, $interval){
	
	var test = this;
	this.tests=[];
	test.areas=[];
	test.subjects=[];
	test.courses=[];
	test.courses=[];
	test.chapters=[];
	test.topics=[];
	test.openChapter = false;
	test.step = [1,0,0,0]
	test.selectedtopics = [];
	test.cha_topics = []
	test.view_test = [];
	test.selectedstudents = [];
	test.total_credit = new Array([]);
	test.total_ques = new Array([]);
	test.test_questions = {};
	test.credit_questions= [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8, 8.25, 8.5, 8.75, 9, 9.25, 9.5, 9.75, 10];
	test.testName = '';
	test.expired = new Date(Date.parse(new Date()) + 7 * 24 * 60 * 60 * 1000); // Default duration is a week - 7 days
	test.initial = '';
	test.datetimetaken = new Date();
	test.blank_initial = false;
	test.loading_category = false;

	// to reset the form after submission
	this.resetForm=()=>{
		test.testid='',
		test.question='',
		test.optionA='',
		test.optionB='',
		test.optionC='',
		test.optionD='',
		test.answer=''
	};

	this.range = function(min, max, step){
		var input = [];
		step = step || 1;
		if (step == 0.25) {
			input = [0.1];
			for (var i = min; i <= max; i += step) input.push(i);
		} else {
			for (var i = min; i <= max; i += step) input.push({text: i + '/' + max,value: i});
		}
		// console.log('input', input);
		return input;
	};

	// to show test time in instruction modal
	this.showTestTimeInModal=(tid, title, num)=>{
		//as well as make them global so that it can be used by the livetestcontroller
		test.testtime=$window.time;
		$rootScope.testid=tid;
		$rootScope.testtime = num * 2;
		test.title = title
		$('#instructionModal').modal('show');
	};

	// directing to the run test page
	this.runTest = ()=>{
		
		if (test.initial == '') {
			test.blank_initial = true;
			return;
		}
		$rootScope.loading = true;
		var data = {
			'testid': $rootScope.testid,
			'userid': $rootScope.userID,
		}

		apiService.generateTestQuestion(data).then( function successCallback(response){
			var res = response.data.data
			$rootScope.question_id = res.question
			$rootScope.answer_id = res.answer
			$('#instructionModal').modal('hide');
			$("#instructionModal").on("hidden.bs.modal", function () {
				$rootScope.loading = false;
				$location.path('/dashboard/livetestnew');
			});
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
		
	};

	// function to create the test
	this.createTest=()=>{
		test.notify='';
		// test.expired = new Date();
		// var h = test.expired.getHours();
		// var m = test.expired.getMinutes();
		// test.expired.setHours(h,m,0,0);

		var testData={
			title	  : test.testName,
			description : test.testDesc,
			time   		: test.testTime,
			instructions  : test.testInstructions
		};
		apiService.createTest(testData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			$location.path('/dashboard/tests');
			
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});

	};

	this.goList =()=> {
		$location.path('/dashboard/testquestions');
	};

	//get the testid from the parameter
 	var tid=$stateParams.tid;

 	// function to edit test
	this.editTest=()=>{
		apiService.viewTest(tid).then( function successCallback(response){
			console.log(response);
			test.testName=response.data.data.title;
			test.db = response.data.data.database;
			test.values = response.data.data.values;
			test.selectedChapters = [];
			test.tid = response.data.data._id;
			test.selectedArea = test.values.area;
			test.selectedSubject = test.values.subject;
			test.selectedCourse = test.values.course;

			apiService.selectDatabase(test.db).then( function successCallback(response){
				for(var k in test.values.chapters) test.selectedChapters.push(k);
				var data={
					area: test.values.area,
					subject: test.values.subject,
					course: test.values.course
				};
				apiService.getChapters(data).then(function successCallBack(response){
					response.data.data.forEach(function(item){
						test.chapters.push(item);
					});
					test.view_chapter_flag = true;
				},
				function errorCallback(response) {
					alert("some error occurred. Check the console.");
					console.log(response); 
				});
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
			});
		});
	};

	this.selectDatabase=(db)=>{
		console.log("===1selectDatabase===", db);
		test.loading_category = true;
		apiService.selectDatabase(db).then( function successCallback(response){
			console.log('===2database==', response);
			test.loading_category = false;
			test.viewAreas();
			test.viewCourses();
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
		});
	};

	//function to delete the test
	this.deleteTest=(testid)=>{
		if(confirm("Are You Sure you want to delete the test?")){
			apiService.deleteTest(testid).then( function successCallback(response){
				alert(response.data.message);
				$state.reload();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};


	//get the available tests
	
	this.viewTests = ()=>{
		if (typeof $rootScope.userID !== "undefined") {
			apiService.getTestsbyID($rootScope.userID).then(function successCallBack(response){
				response.data.data.forEach(function(t){
					var new_t = t;
					if (t.testAttemptedBy.some(item => item.userid == $rootScope.userID)){
						let selected_item = t.testAttemptedBy.find(item => item.userid == $rootScope.userID);
						new_t['status'] = 'taken';
						new_t['time_submitted'] = selected_item.datetime;
						new_t['percent'] = Math.round(selected_item.score * 100 / selected_item.total_score, 2)
					} else {
						new_t['status'] = 'not'
					}
					test.tests.push(new_t);
				});
				test.testArrayLength = test.tests.length;
				
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		} else {
			$location.path('/dashboard/index');
		}
		

	};
	this.viewTests();

	// function to create question 
	this.createQuestion=()=>{
		test.notify='';
		var questionData={
			id		: test.testid,
			question: test.question,
			optionA : test.optionA,
			optionB : test.optionB,
			optionC : test.optionC,
			optionD : test.optionD,
			answer	: test.answer
		};
		apiService.createQuestion(questionData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			test.resetForm();
			
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});

	};

	//function to view questions present in the test
	this.viewQuestions = (testid)=>{
		test.testid=parseInt(testid);
		test.questions = [];
		apiService.viewQuestions(testid).then(function successCallBack(response){
			//console.log(response);
			response.data.data.forEach(function(q){
				test.questions.push(q);

			});

		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});

	};

	//function to delete a question
	this.deleteQuestion=(qid)=>{
	
		if(confirm("Are You Sure you want to delete the question?")){
		apiService.deleteQuestion(test.testid,qid).then( function successCallback(response){
			alert(response.data.message);
			test.viewQuestions(test.testid);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	}
	};

	// function to edit a question
	this.editQuestion=(qid)=>{
		apiService.viewQuestions(test.testid).then( function successCallback(response){
			//console.log(response);
			var obj = $filter('filter')(response.data.data, {_id: qid}, true)[0];
			test.questionid=obj._id;
			test.question=obj.question;
			test.optionA =obj.optionA;
			test.optionB =obj.optionB;
			test.optionC =obj.optionC;
			test.optionD =obj.optionD;
			test.answer	=obj.answer;


	});
	};

	// function to submit editted question
	this.submitEditedQuestion=()=>{
		test.notify='';
		var questionData={
			question: test.question,
			optionA : test.optionA,
			optionB : test.optionB,
			optionC : test.optionC,
			optionD : test.optionD,
			answer	: test.answer
		};
		apiService.updateQuestion(questionData,test.questionid).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};
	//function to get the users who attempted the test
	this.enrolledUsers=()=>{
		test.loading = true;
		apiService.getallusertestdetails(tid).then( function successCallback(response){
			test.testattemptedBy = response.data.data;	
			//console.log(test.testattemptedBy);
			test.loading = false;
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	// function to create area 
	this.createareaofstudy=()=>{
		test.notify='';
		var areaData={
			name: test.areaofstudyName,
			description : test.areaofstudyDescription
		};
		apiService.createareaofstudy(areaData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			$('#AddareaofstudyModal').modal('toggle');
			// $location.path('/dashboard/courops');
			test.areas.push(response.data.data)			
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	//get the available tests
	// this.viewAreas = ()=>{
	// 	test.areas = [{
	// 		_id: '34hu3h5234o2h34u3',
	// 		name: 'Business',
	// 		description: 'This is the Business Description',
	// 		subjects: [{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description',
	// 			courses: [{
	// 				_id: '34hu3h5234o2h34u3',
	// 				name: 'Business',
	// 				description: 'This is the Business Description',
	// 				chapters: [{
	// 					_id: '34hu3h5234o2h34u3',
	// 					name: 'Business',
	// 					description: 'This is the Business Description',
	// 					topics: [{
	// 						_id: '34hu3h5234o2h34u3',
	// 						name: 'Business',
	// 						description: 'This is the Business Description'
	// 					},{
	// 						_id: '34hu3h5234o2h34u3',
	// 						name: 'Business',
	// 						description: 'This is the Business Description'
	// 					},{
	// 						_id: '34hu3h5234o2h34u3',
	// 						name: 'Business',
	// 						description: 'This is the Business Description'
	// 					}]
	// 				},{
	// 					_id: '34hu3h5234o2h34u3',
	// 					name: 'Business',
	// 					description: 'This is the Business Description'
	// 				},{
	// 					_id: '34hu3h5234o2h34u3',
	// 					name: 'Business',
	// 					description: 'This is the Business Description'
	// 				}]
	// 			},
	// 			{
	// 				_id: '34hu3h5234o2h34u3',
	// 				name: 'Business',
	// 				description: 'This is the Business Description'
	// 			}]
	// 		},
	// 		{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description'
	// 		},
	// 		{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description'
	// 		},
	// 		{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description'
	// 		}]
	// 	},{
	// 		_id: '34hu3h5234o2h34u3',
	// 		name: 'Engineering',
	// 		description: 'This is the Business Description',
	// 		subjects: [{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description',
	// 			courses: [{
	// 				_id: '34hu3h5234o2h34u3',
	// 				name: 'Business',
	// 				description: 'This is the Business Description',
	// 				chapters: [{
	// 					_id: '34hu3h5234o2h34u3',
	// 					name: 'Business',
	// 					description: 'This is the Business Description',
	// 					topics: [{
	// 						_id: '34hu3h5234o2h34u3',
	// 						name: 'Business',
	// 						description: 'This is the Business Description'
	// 					},{
	// 						_id: '34hu3h5234o2h34u3',
	// 						name: 'Business',
	// 						description: 'This is the Business Description'
	// 					},{
	// 						_id: '34hu3h5234o2h34u3',
	// 						name: 'Business',
	// 						description: 'This is the Business Description'
	// 					}]
	// 				},{
	// 					_id: '34hu3h5234o2h34u3',
	// 					name: 'Business',
	// 					description: 'This is the Business Description'
	// 				},{
	// 					_id: '34hu3h5234o2h34u3',
	// 					name: 'Business',
	// 					description: 'This is the Business Description'
	// 				}]
	// 			},
	// 			{
	// 				_id: '34hu3h5234o2h34u3',
	// 				name: 'Business',
	// 				description: 'This is the Business Description'
	// 			}]
	// 		},
	// 		{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description'
	// 		},
	// 		{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description'
	// 		},
	// 		{
	// 			_id: '34hu3h5234o2h34u3',
	// 			name: 'Business',
	// 			description: 'This is the Business Description'
	// 		}]
	// 	}];
	// };
	this.viewAreas = ()=>{
		apiService.getAreas().then(function successCallBack(response){
			response.data.data.forEach(function(item){
				test.areas.push(item);
			});
			test.AreaArrayLength = test.areas.length;
			test.view_area_flag = true;
			console.log("===3getArea====", test.areas);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});		
	};

	// function to create subject 
	this.createsubject=()=>{
		test.notify='';
		var subjectData={
			area_id: test.area_id,
			name: test.subjectname,
			description : test.subjectdescription
		};
		apiService.createsubject(subjectData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			$('#AddsubjectModal').modal('toggle');
			// $location.path('/dashboard/courops');
			for (var i = test.areas.length - 1; i >= 0; i--) {
				if(test.area_id == test.areas[i]._id) {
					test.areas[i] = response.data.data;
					break;
				}
			}
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	//get the available subjects	
	this.viewSubjects = ()=>{
		apiService.getSubjects().then(function successCallBack(response){
			//console.log(response);
			response.data.data.forEach(function(item){
				test.subjects.push(item);

			});
			test.SubjectArrayLength = test.subjects.length;
			
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});

	};

	// function to create course 
	this.createcourse=()=>{
		test.notify='';
		var courseData={
			area_id: test.area_id,
			subject_id: test.subject_id,
			name: test.coursename,
			description : test.coursedescription
		};
		apiService.createCourse(courseData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			$('#AddCourseModal').modal('toggle');
			// $location.path('/dashboard/courops');
			for (var i = test.areas.length - 1; i >= 0; i--) {
				if(test.area_id == test.areas[i]._id) {
					test.areas[i] = response.data.data;
					break;
				}
			}		
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};
	//get the available tests
	
	this.viewCourses = ()=>{
		apiService.getCourses().then(function successCallBack(response){
			
			// if (response.data.data == )
			response.data.data.forEach(function(item){
				test.courses.push(item);
			});
			test.CourseArrayLength = test.courses.length;
			console.log("===4response===", test.courses);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});

	};

	this.selectareaofstudy = (area_id) => {
		test.area_id = area_id;
	};
	this.selectsubject = (area_id, subject_id) => {
		test.area_id = area_id;
		test.subject_id = subject_id;
	};
	this.selectcourse = (area_id, subject_id, course_id) => {
		test.area_id = area_id;
		test.subject_id = subject_id;
		test.course_id = course_id;
		// console.log('area_id', area_id);
		// console.log('subject_id', subject_id);
		// console.log('course_id', course_id);
	};
	this.selectchapter = (area_id, subject_id, course_id, chapter_id) => {
		test.area_id = area_id;
		test.subject_id = subject_id;
		test.course_id = course_id;
		test.chapter_id = chapter_id;
		// console.log('area_id', area_id);
		// console.log('subject_id', subject_id);
		// console.log('course_id', course_id);
		// console.log('chapter_id', chapter_id);	
	};
	// function to create chapter 
	this.createchapter=()=>{
		test.notify='';
		var chapterData={
			area_id: test.area_id,
			subject_id: test.subject_id,
			course_id: test.course_id,
			name: test.chaptername,
			description : test.chapterdescription
		};
		apiService.createChapter(chapterData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			$('#AddchapterModal').modal('toggle');
			// $location.path('/dashboard/courops');
			for (var i = test.areas.length - 1; i >= 0; i--) {
				if(test.area_id == test.areas[i]._id) {
					test.areas[i] = response.data.data;
					break;
				}
			}		
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	// function to create topic 
	this.createtopic=()=>{
		test.notify='';
		var topicData={
			area_id: test.area_id,
			subject_id: test.subject_id,
			course_id: test.course_id,
			chapter_id: test.chapter_id,
			name: test.topicname,
			description : test.topicdescription
		};
		apiService.createTopic(topicData).then( function successCallback(response){
			//console.log(response);
			alert(response.data.message);
			$('#AddtopicModal').modal('toggle');
			// $location.path('/dashboard/courops');
			for (var i = test.areas.length - 1; i >= 0; i--) {
				if(test.area_id == test.areas[i]._id) {
					test.areas[i] = response.data.data;
					break;
				}
			}		
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.getallSubjects = (area)=>{
		test.loading_category = true;
		apiService.getSubjects(area).then(function successCallBack(response){
			response.data.data.forEach(function(item){
				test.subjects.push(item);
			});
			test.loading_category = false;
			test.view_subject_flag = true;
			console.log("==6getallSubjects====", test.subjects);
			console.log("====6_1selectedChapters===", test.selectedChapters);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.getallCourses = (subject) => {
		test.loading_category = true;
		var data={
			area: test.selectedArea,
			subject: subject
		};
		apiService.getCourses(data).then(function successCallBack(response){
			response.data.data.forEach(function(item){
				test.courses.push(item);
			});
			test.loading_category = false;
			test.view_course_flag = true;
			console.log("===29getallcourse", test.courses)
			console.log("====29_1selectedChapters===", test.selectedChapters);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.getallChapters = (course) => {
		test.loading_category = true;
		var data={
			area: test.selectedArea,
			subject: test.selectedSubject,
			course: course
		};
		apiService.getChapters(data).then(function successCallBack(response){
			response.data.data.forEach(function(item){
				test.chapters.push(item);
			});
			test.loading_category = false;
			test.view_chapter_flag = true;
			console.log("===7getallchapters==", test.chapters);
			console.log("====7_1selectedChapters===", test.selectedChapters);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};
	this.getallTopics = (chapter) => {
		var data={
			area: test.selectedArea,
			subject: test.selectedSubject,
			course: test.selectedCourse,
			chapter: chapter
		};
		apiService.getTopics(data).then(function successCallBack(response){
			// console.log(response);
			response.data.data.forEach(function(item){
				test.topics.push(item);
			});
			test.view_topic_flag = true;
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	// function to create topic 
	this.createTopic=()=>{
		test.notify='';
		var topicData={
			courseid: test.courseid,
			chapterid: test.chapterid,
			name: test.topicname,
			description : test.topicdescription
		};
		apiService.createTopic(topicData).then( function successCallback(response){
			console.log(response);
			alert(response.data.message);
			$('#AddTopicModal').modal('toggle');
			// $location.path('/dashboard/courops');
			for (var i = test.courses.length - 1; i >= 0; i--) {
				if(test.courseid == test.courses[i]._id) {
					test.courses[i] = response.data.data;
					break;
				}
			}
		},

		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.goNext =(index)=>{
		if (index == 1) {
			// test.formated_expired = test.expired.replace()
			console.log("====8goNext1===", test.selectedChapters);
			test.cha_topics = []
			test.selectedChapters.forEach(chapter => {
				var data={
					area: test.selectedArea,
					subject: test.selectedSubject,
					course: test.selectedCourse,
					chapter: chapter
				};
				apiService.getTopics(data).then(function successCallBack(response){
					var data = {
						name: chapter,
						topics: response.data.data
					}
					test.cha_topics.push(data);
					console.log("====8_1goNext1===", test.cha_topics);
				},
				function errorCallback(response) {
					alert("some error occurred. Check the console.");
				});
			});
		} else if (index == 3) {
			console.log("====15test.selectedtopics_gonext3===", test.selectedtopics)
			test.test_questions = {
				"test_name": test.testName,
				"language": "English",
				"db": test.db,
				"number_tests": 1,
				"shuffle_questions": true,
				"direction": "forward",
				"clone": false,
				"request_time": Date.now(),
				"request_serial": test.selectedSubject.substring(0,3).toUpperCase()+Math.floor(Math.random() * 100000),
				"requestor_id": $rootScope.userID,
				"area": test.selectedArea,
				"subject": test.selectedSubject,
				"course": test.selectedCourse,
				"expired": test.expired,
				"chapters": {}
			};
			for (const [key, value] of Object.entries(test.selectedtopics)) {
				var flag_array = [];
				test.test_questions['chapters'][key] = {};
				value.forEach(topic => {
					var data={
						area: test.selectedArea,
						subject: test.selectedSubject,
						course: test.selectedCourse,
						chapter: key,
						topic: topic
					};
					test.test_questions['chapters'][key][topic] = {};
					apiService.getTopicDetails(data).then(function successCallBack(response){
						for(const [item_key, item_val] of Object.entries(response.data.data)) {
							response.data.data[item_key]['list'] = test.range(0, response.data.data[item_key]['n']);
						}
						test.test_questions['chapters'][key][topic] = response.data.data;
						console.log("==16gettopicdetails==", key, topic);
						console.log("==17gettopicdetails==", test.test_questions['chapters'][key][topic]);
					},
					function errorCallback(response) {
						alert("some error occurred. Check the console.");
						console.log(response); 
					});
					flag_array.push(false);
					console.log("====18flag_array===", flag_array);
				});
				test.view_test.push(flag_array);
				console.log("====19test.view_test===", test.view_test);				
			};
			
			test.mcq_ques_num = 6
			test.mcq_credit = 4.5
			
			test.tfq_ques_num = 2
			test.tfq_credit = 4

			test.view_test[0][0] = true;
			console.log("====20test.view_test===", test.view_test);
		} else if (index == 2) {
			// console.log("selectedtopics", test.selectedtopics);
			console.log("==11goNext2===");
		}
		for (var i = test.step.length - 1; i >= 0; i--) {
			if (i == index) {
				test.step[i] = true;
				console.log("===10teststep==", test.step[i], i);
			} else {
				test.step[i] = false;
			}
		}
	}

	this.getLink = (param)=>{
		console.log('param', params);
	};

	this.goNextStep =(row, col)=>{
		console.log("==21goNestStep===", row, col);
		if (col == test.view_test[row].length - 1) {
			if (row == test.view_test.length - 1) {
				console.log("==22goNextStep===", row, col);
				$("#submitTestModal").modal('show');
			}
			else {
				console.log("==23goNextStep===", row, col);
				test.view_test[row][col] = false;
				test.view_test[row + 1][0] = true;
				test.total_credit.push(new Array());
				test.total_ques.push(new Array());
			}
		}
		else {
			console.log("==24goNextStep===", row, col);
			test.view_test[row][col] = false;
			test.view_test[row][col + 1] = true;
			test.total_credit.push(new Array());
			test.total_ques.push(new Array());
		}
	}

	this.editNextStep =(row, col)=>{
		if (col == test.view_test[row].length - 1) {
			if (row == test.view_test.length - 1) {
				$("#editTestModal").modal('show');
			}
			else {
				test.view_test[row][col] = false;
				test.view_test[row + 1][0] = true;
				test.total_credit.push(new Array());
				test.total_ques.push(new Array());
			}
		}
		else {
			test.view_test[row][col] = false;
			test.view_test[row][col + 1] = true;
			test.total_credit.push(new Array());
			test.total_ques.push(new Array());
		}
	}

	this.gotoReview = () =>{
		console.log('==25test.test_questions===' , test.test_questions);
		var total_test_nums = 0;
		for (item in test.test_questions.chapters) {
			for (item_ch1 in test.test_questions.chapters[item]) {
				for (item_ch2 in test.test_questions.chapters[item][item_ch1]) {
					delete test.test_questions.chapters[item][item_ch1][item_ch2]['list'];
					total_test_nums += test.test_questions.chapters[item][item_ch1][item_ch2]['selectednum']
				}
			}
		}
		test.test_questions.number_tests = total_test_nums
		var data = {
			test: test.test_questions
		}
		console.log('==26test.test_questions==' , test.test_questions);
		apiService.submitTest(data).then(function successCallBack(response){
			$('#submitTestModal').modal('hide');
			$("#submitTestModal").on("hidden.bs.modal", function () {
				$location.path('/dashboard/testquestions');
			});
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.gotoUpdate = () =>{
		console.log('test.test_questions' , test.test_questions);
		var total_test_nums = 0;
		for (item in test.test_questions.chapters) {
			for (item_ch1 in test.test_questions.chapters[item]) {
				for (item_ch2 in test.test_questions.chapters[item][item_ch1]) {
					delete test.test_questions.chapters[item][item_ch1][item_ch2]['list'];
					total_test_nums += test.test_questions.chapters[item][item_ch1][item_ch2]['selectednum']
				}
			}
		}
		test.test_questions.number_tests = total_test_nums
		var data = {
			test: test.test_questions
		}
		console.log('data' , data);
		apiService.editTest(data, test.tid).then(function successCallBack(response){
			$('#editTestModal').modal('hide');
			$("#editTestModal").on("hidden.bs.modal", function () {
				$location.path('/dashboard/testquestions');
			});
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.goPrevStep =(row, col)=>{
		if (col == 0) {
			if (row == 0) {
				test.goNext(2);
			} else {
				test.view_test[row][col] = false;
				test.view_test[row - 1][test.view_test[row - 1].length - 1] = true;
			}
		} else {
			test.view_test[row][col] = false;
			test.view_test[row][col - 1] = true;
		}
	}

	this.get_total_ques = (items, index, cat)=>{
		// console.log('total_ques index', index)
		// console.log('total_ques items', items)
		// console.log('total_ques cat', cat)
		var total = 0;
		for (const [key, value] of Object.entries(items)) {
			if (cat == 0) {
				if (key.split('-')[0] == 'MCQ') total += value.selectednum;
			} else {
				if (key.split('-')[0] == 'TFQ') total += value.selectednum;
			}
			
		}
		// console.log('total', total)
		test.total_ques[index][cat] = total;
		// console.log('test.total_ques', test.total_ques)
	}
	this.get_total_credit = (items, index, cat)=>{

		// console.log('total_credit index', index)
		// console.log('total_credit items', items)
		// console.log('total_credit cat', cat)

		var total = 0;
		for (const [key, value] of Object.entries(items)) {
			if (cat == 0) {
				if (key.split('-')[0] == 'MCQ') total += value.selectednum * value.cr;
			} else {
				if (key.split('-')[0] == 'TFQ') total += value.selectednum * value.cr;
			}
		}
		test.total_credit[index][cat] = total;
		// console.log('test.total_credit', test.total_credit)
	}
	this.addTopics =()=>{
		// console.log(test.selectedtopics);
	};

	//function to delete the category
	this.deleteArea=(id)=>{
		var data={
			id: id
		};
		if(confirm("Are You Sure you want to delete this area?")){
			apiService.deleteArea(data).then( function successCallback(response){
				alert(response.data.message);
				$state.reload();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	this.deleteSubject=(area_id, subject_id)=>{
		var data={
			area_id		: area_id,
			subject_id  : subject_id
		};
		if(confirm("Are You Sure you want to delete this subject?")){
			apiService.deleteSubject(data).then( function successCallback(response){
				alert(response.data.message);
				$state.reload();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	this.deleteCourse=(area_id, subject_id, course_id)=>{
		var data={
			area_id		: area_id,
			subject_id  : subject_id,
			course_id   : course_id
		};
		if(confirm("Are You Sure you want to delete this course?")){
			apiService.deleteCourse(data).then( function successCallback(response){
				alert(response.data.message);
				$state.reload();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	this.deleteChapter=(area_id, subject_id, course_id, chapter_id)=>{
		var data={
			area_id: area_id, 
			subject_id: subject_id, 
			course_id: course_id, 
			chapter_id: chapter_id
		};
		if(confirm("Are You Sure you want to delete this chapter?")){
			apiService.deleteChapter(data).then( function successCallback(response){
				alert(response.data.message);
				$state.reload();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	this.deleteTopic=(area_id, subject_id, course_id, chapter_id, topic_id)=>{
		var data={
			area_id: area_id, 
			subject_id: subject_id, 
			course_id: course_id, 
			chapter_id: chapter_id,
			topic_id		: topic_id
		};
		if(confirm("Are You Sure you want to delete this topic?")){
			apiService.deleteTopic(data).then( function successCallback(response){
				alert(response.data.message);
				$state.reload();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	//get all the students to display in the admin panel

	this.getstudents = ()=>{
	
		$q.all([
			apiService.getStudents()
			]).then(function(users) {
				var localusers=users[0].data.data;
				test.allstudents=localusers;
				// console.log("test.allstudents", test.allstudents)
			});

		// console.log("test.allstudents", test.allstudents)
	};

	this.CountDown =[];

	this.getTimeRemaining = (endtime)=> {
		var t = Date.parse(endtime) - Date.parse(new Date());
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));
		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}

	this.initializeClock = (testitem, index)=> {
		var days = 0;
		var hours = 0;
		var minutes = 0;
		var seconds = 0;
		function updateClock() {
			var t = test.getTimeRemaining(testitem.expired);

			days = t.days < 10 ? '0' + t.days : t.days;
			hours = ('0' + t.hours).slice(-2);
			minutes = ('0' + t.minutes).slice(-2);
			seconds = ('0' + t.seconds).slice(-2);

			test.CountDown[index] = {
				days: days,
				hours: hours,
				minutes: minutes,
				seconds: seconds
			};

			if (t.total <= 0) {
				$interval.cancel(timeinterval);
				$("div.countdown_" + index).css('display', 'none');
				testitem.status = 'expired';
			}
		}

		updateClock();
		var timeinterval = $interval(updateClock, 1000);
	};

	// this.viewCourses();
	// this.viewAreas();

}]);