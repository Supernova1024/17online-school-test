myApp.controller('dashController',['$http','$q','apiService','authService','$rootScope', '$location','$filter','$stateParams', function($http,$q,apiService,authService,$rootScope,$location,$filter, $stateParams){
	var dash = this;

	this.alltests = [];
	this.allinstructors = [];
	this.alltestresults = [];

	this.Math = window.Math;

	//check whether the user is logged in
	this.loggedIn=()=>{
		if(authService.isLoggedIn()){
			return 1;
		}
		else{
			return 0;
		}
	};
	$rootScope.loading = false;
	//getting the user detail and checking whether the user is admin or not
	this.getUserDetail=()=>{
		if(authService.isLoggedIn()){
			apiService.getUser().then(function successCallBack(response){
				if(response.data.error){
					// alert("Authentication failed! Token Expired");
					dash.logout();
				}else{
					$rootScope.name=response.data.name;
					$rootScope.userID = response.data._id;
					$rootScope.email=response.data.email;
					$rootScope.user = response.data

					if (response.data.role == 'student') {
						$rootScope.role = 'Student';
						$rootScope.admin = false;						
					} else {
						if(response.data.role == 'administrator') {
							$rootScope.role = 'Administrator';
							$rootScope.admin = true;
							apiService.getallInstructors().then(function successCallBack(response){
								console.log('here I am admin, too', response.data.data)
								dash.allinstructors = response.data.data;
								$rootScope.instructorArrayLength = dash.allinstructors.length;
							},
							function errorCallback(response) {
								alert("some error occurred. Check the console.");
								console.log(response); 
							});
						} else {
							$rootScope.role = 'Instructor';
							$rootScope.admin = false;
						}
					}
				console.log('rootScope.userid', $rootScope.userID)
				console.log('rootScope.role', $rootScope.role)
				dash.getalltests($rootScope.userID, $rootScope.role)
				}
			});
		}
	};

	//get the no of questions in a particular test
	this.noOfQuestions = (testid)=>{
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

	//get all the users to display in the admin panel
	
	this.getAllstudents = ()=>{
	
		$q.all([
			apiService.getStudents()
			]).then(function(students) {
				var localusers=students[0].data.data;
				dash.allstudents = localusers;
			});

	};
	this.download_pdf = (div_id) => {

		var printContents = document.getElementById(div_id).innerHTML;
		window.print();
	}

	this.download = (test) => {
		var pdf = new jsPDF('p', 'pt', 'letter');
		var p = 20;
		pdf.setFontSize(40);
		pdf.cellInitialize();
		pdf.setFontSize(10);
		pdf.text(50, 50, 'Student Name:		' + test.user);
		pdf.text(50, 60, 'Test Name:		   ' + test.test.title);
		pdf.text(50, 70, 'Test Serial:		 ' + test.test.serial);
		pdf.text(50, 80, 'Test Date (created): ' + test.created.replace('T', ' ').split(".")[0]);
		pdf.text(50, 90, 'Test ID:			 ' + test.test.serial);
		pdf.text(50, 110, 'Grade:			   ' + Math.round(test.score * 100 / test.total_score, 2) + "%");
		pdf.text(50, 120, 'Total Earned Credits:' + test.score);
		pdf.text(50, 130, 'Total Test Credits: ' + test.total_score);

		Object.keys(test.questions.questions).forEach(function(key){
			console.log('key', key)
			var index = key.substring(1)
			console.log('value', test.questions.questions[key]['question'])
			correct_key = "A" + index;
			var correct_answer = test.correct_answers[0][correct_key]['correct']
			var your_answer = test.your_answers[index]['option']
			pdf.text(50, 130 + p, key + ": " + test.questions.questions[key]['question']);
			pdf.text(50, 130 + p + 10, "Credits: " + test.questions.questions[key]['credit']);
			pdf.text(50, 130 + p + 30, "Correct Answer: " + correct_answer);
			pdf.text(50, 130 + p + 40, "Your Answer: " + your_answer);
			p += 60;
		});

		pdf.save('Test Report for ' + test.user + '.pdf');
	};

	//get all the users to display in the admin panel
	this.getalltests = (userid, role)=>{
		console.log('role', role)
		console.log('userid', userid)
		var tests = []
		
		if (role == 'Administrator') {
			$q.all([
			apiService.getalltests()
			]).then(function(tests) {
				dash.alltests = tests[0].data.data;
				$rootScope.testArrayLength = dash.alltests.length;
			});
		} else if(role == 'Instructor') {
			$q.all([
			apiService.getTestsbyInstructorID(userid)
			]).then(function(tests) {
				dash.alltests = tests[0].data.data;
				$rootScope.testArrayLength = dash.alltests.length;
			});
		} else {
			apiService.getTestsbyID(userid).then(function successCallBack(response){
				//store the no. of available test
				response.data.data.forEach(function(t){
					var new_t = t;
					if (t.testAttemptedBy.some(item => item.userid == $rootScope.userID)){
						
					} else {
						tests.push(new_t);
					}
				});
				$rootScope.testArrayLength = tests.length;
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	//get all the users to display in the admin panel
	
	// this.allstudents = ()=>{
	
	// 	$q.all([
	// 		apiService.getLocalUsers('student')
	// 		]).then(function(students) {
	// 			var localusers=students[0].data.data;
	// 			dash.allstudents = localusers;
	// 		});

	// };

	this.getinstructors = ()=>{
		$q.all([
			apiService.getLocalUsers('instructor')
			]).then(function(students) {
				var localusers=students[0].data.data;
				dash.allinstructors = localusers;
			});
	};

	this.getadministrators = ()=>{
		$q.all([
			apiService.getLocalUsers('administrator')
			]).then(function(students) {
				var localusers=students[0].data.data;
				dash.alladmins = localusers;
			});
	};

	// get my overall performance for all the test	
	this.myPerformance=()=>{
		apiService.getallperformances().then(function successCallBack(response){
			
			var myperformances = response.data.data;
			// filtering my performances from all the performances
			dash.myfilteredPerformances=$filter('filter')(myperformances,{user_id: $rootScope.userID});
			// Counting percentages for each test 
			var mytestPercentages = dash.myfilteredPerformances.map(a => ((a.score/(a.questionCount * 2)).toFixed(2))/1 );
			var total=0;
			//finding the average of all the test
			for(let i = 0; i < mytestPercentages.length; i++) {
				total += mytestPercentages[i];
			}
			
			dash.myavgPerformance = (total / mytestPercentages.length).toFixed(2);
			dash.mybestPerformance = Math.max.apply(Math, mytestPercentages);
			dash.myworstPerformance = Math.min.apply(Math, mytestPercentages);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	//getting overall performances of all the users for admin panel
	this.userPerformances=(uid)=>{

		apiService.getallperformances().then(function successCallBack(response){
			
			var performances = response.data.data;

			dash.filteredPerformances=$filter('filter')(performances,{userid:uid});

			var testPercentages = dash.filteredPerformances.map(a => ((a.score/(a.questionCount * 2)).toFixed(2))/1 );
			var total=0;
			for(let i = 0; i < testPercentages.length; i++) {
				total += testPercentages[i];
			}
		
			dash.avgPerformance = (total / testPercentages.length).toFixed(2);
			dash.bestPerformance = Math.max.apply(Math, testPercentages);
			dash.worstPerformance = Math.min.apply(Math, testPercentages);

		 $('#performanceModal').modal('show');
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.copyClip = (index)=>{
		console.log('here', index)
		var copyText = document.getElementById("myInput_" + index);

		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 99999); /* For mobile devices */

		/* Copy the text inside the text field */
		document.execCommand("copy");

		/* Alert the copied text */
		// alert("Copied the text: " + copyText.value);
	}

	this.editTest = (tid, index)=>{
		$location.path('/dashboard/edittest/' + tid);
	}

	this.confirmDelete = ()=>{
		$("#deleteTestModal").modal('hide');
		apiService.deleteTest(dash.tid).then(function successCallBack(response){
			dash.alltests.splice(dash.tindex, 1);
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	}

	this.deleteTest = (tid, index)=>{
		dash.tid = tid;
		dash.tindex = index;
		$("#deleteTestModal").modal('show');
	}

	this.confirmDeleteInstructor = ()=>{
		$("#deleteUserModal").modal('hide');
		apiService.deleteUser(dash.uid).then(function successCallBack(response){
			console.log('dash.uindex', dash.uindex)
			dash.allinstructors.splice(dash.uindex, 1);
			console.log('after dash.allinstructors', dash.allinstructors)
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	}

	this.deleteInstructor = (uid, uindex)=>{
		dash.uid = uid;
		dash.uindex = uindex;
		$("#deleteUserModal").modal('show');
	}

	this.confirmDeleteStudent = ()=>{
		$("#deleteUserModal").modal('hide');
		apiService.deleteUser(dash.uid).then(function successCallBack(response){
			console.log('dash.uindex', dash.uindex)
			dash.allstudents.splice(dash.uindex, 1);
			console.log('after dash.allstudents', dash.allstudents)
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	}

	this.deleteAdministrator = (uid, uindex)=>{
		dash.uid = uid;
		dash.uindex = uindex;
		$("#deleteUserModal").modal('show');
	}

	this.confirmDeleteAdministrator = ()=>{
		$("#deleteUserModal").modal('hide');
		apiService.deleteUser(dash.uid).then(function successCallBack(response){
			console.log('dash.uindex', dash.uindex)
			dash.alladmins.splice(dash.uindex, 1);
			console.log('after dash.alladmins', dash.alladmins)
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	}

	this.editStudent = (user) => {
		$rootScope.selectedUser = user;
		$rootScope.selectedUser.firstname = user.name.split(" ")[0]
		$rootScope.selectedUser.lastname = user.name.split(" ")[1]
		$location.path('/dashboard/editstudent/' + user._id);
	};

	this.editInstructor = (user) => {
		$rootScope.selectedUser = user;
		$rootScope.selectedUser.firstname = user.name.split(" ")[0]
		$rootScope.selectedUser.lastname = user.name.split(" ")[1]
		$location.path('/dashboard/editinstructor/' + user._id);
	};

	this.editAdministrator = (user) => {
		$rootScope.selectedUser = user;
		$rootScope.selectedUser.firstname = user.name.split(" ")[0]
		$rootScope.selectedUser.lastname = user.name.split(" ")[1]
		$location.path('/dashboard/editadministrator/' + user._id);
	};

	this.editUsers = (role, new_user) => {
		apiService.editUser(new_user).then(function successCallBack(response){
			if (role == 'instructor') {
				$location.path('dashboard/view-instructors')
			} else if (role == 'administrator') {
				$location.path('dashboard/view-admins')
			} else {
				$location.path('dashboard/view-students')
			}
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});

	};

	this.deleteStudent = (uid, uindex)=>{
		dash.uid = uid;
		dash.uindex = uindex;
		$("#deleteUserModal").modal('show');
	}

	this.saveprofile = (new_user)=> {
		console.log("new_user", new_user);
		apiService.editUser(new_user).then(function successCallBack(response){
			console.log("response.data", response.data)
			$rootScope.user = response.data;
			$("#editModal").modal('hide');
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.getalltestresults = () => {
		var tid = $stateParams.tid;
		console.log('test_id', tid)
		apiService.getallusertestdetails(tid).then(function successCallBack(response){
			dash.alltestresults = response.data.data;
			console.log('dash.alltestresults', dash.alltestresults)
			for (var i = 0; i < dash.alltestresults.length; i++) {
				console.log('dash.alltestresults[i].analysis', dash.alltestresults[i].analysis.mcq_comp_medium.total)
			}
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.gotoTestResult = (tid) => {
		$location.path('/dashboard/view_testresults/' + tid);
	};

	this.gotoTestReport = (tid, uid, user, title, serial, created, score, total_score) => {
	// this.gotoTestReport = (tid, uid) => {
		$rootScope.selected_tid = tid;
		$rootScope.selected_uid = uid;
		$rootScope.selected_user = user; 
		$rootScope.selected_title = title; 
		$rootScope.selected_serial = serial; 
		$rootScope.selected_created = created.replace('T', ' ').split(".")[0];
		$rootScope.selected_Grade = Math.round(score * 100 / total_score, 2) + "%";
		console.log('grade', $rootScope.selected_Grade, total_score);
		$rootScope.selected_score = score;
		$rootScope.selected_total_score = total_score; 
		$location.path('/dashboard/view_testreport/' + tid + '/' + uid);
	};

	this.resetMessage = (message) => {
		if (message == 'mismatch') {
			dash.mismatch = false;
		} else {
			dash.current = false;
		}
	}

	this.changepassword = (pass) => {
		console.log('password', pass)
		if (pass.new != pass.confirm) {
			dash.mismatch = true;
			dash.message = "Your password doesn't match.";
		} else if (typeof pass.new == 'undefined' || typeof pass.confirm == 'undefined') {
			dash.mismatch = true;
			dash.message = "Please fill out the fields.";
		} else {
			console.log('userID', $rootScope.userID)
			var data = {
				'userid': $rootScope.userID,
				'password': pass.current
			};
			apiService.checkpassword(data).then(function successCallBack(response){
				if (response.data.error == true) {
					dash.mismatch = true;
					dash.message = "Your password is wrong.";
				} else {
					console.log('now send the request to change the password.');
					var newPassword = {
						password: pass.new,
						cpassword: pass.confirm
					};
					apiService.resetPassword(newPassword).then(function successCallback(response){
						 console.log(response.data.message);
						 alert(response.data.message);
						 $("#changepassModal").modal('hide');
					},
					function errorCallback(response) {
						alert("some error occurred. Check the console.");
						console.log(response); 
					});
				};
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	}

	//function to logout the user
  	this.logout=()=>{
  		//clear the local storage
  		delete $rootScope.admin;
  		delete $rootScope.name;
  		authService.setToken();
  		$location.path('/login');
  	};
  }]);