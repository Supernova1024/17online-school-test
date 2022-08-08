myApp.factory('apiService',($http,authService,$window, $q)=>{
	let requests={};

	const baseUrl = "https://erud8dev.herokuapp.com";


	 //sign up request
    requests.signUp =  (userData) =>{
        return $http.post('/signup', userData);
    }

    requests.checkToken = (token) =>{
        return $http.get('/checktoken?token=' + token, null);
    }

    //login requests
	requests.login=(loginData)=>{
		return $http.post('/login' , loginData);
	};

	//get logged in user
	requests.getUser = ()=>{
		if(authService.getToken()){
			return $http.get('/user/currentUser?token='+authService.getToken() , null);
		}else{
			return $q.reject({data:"User not authorized..."});
		}
	}

    //get all local users
    requests.getLocalUsers=(role)=>{
        return $http.get('/user/allusers/'+ role + '?token='+authService.getToken() , null);
    }
    //get all local users
    requests.getStudents=()=>{
        return $http.get('/user/allstudents?token='+authService.getToken() , null);
    }

    //get all local users
    requests.getallInstructors=()=>{
        return $http.get('/user/allinstructors?token='+authService.getToken() , null);
    }
    
    //get all tests
    requests.getalltests=()=>{
        return $http.get('/user/alltestquestions?token='+authService.getToken(), null);
    }

	//reset password requests
	requests.forgotPasswordOtpSend=(userData)=>{
		return $http.post('/forgotpassword' , userData);
	};

    // check password
    requests.checkpassword = (data) => {
        return $http.post('/checkpassword' , data);
    };

	requests.verifySentOtp=(otp)=>{
		return $http.post('/verifyotp' , otp);
	};

	requests.resetPassword=(newPassword)=>{
		return $http.post('/resetpassword' , newPassword);
	};

    // request to select database if act or deb
    requests.selectDatabase =  (db) =>{
        return $http.get('/user/selectDB/' + db + '?token=' + authService.getToken());
    }

	// request to Create a test by admin
    requests.createTest =  (data) =>{
        return $http.post('/user/admin/createTest?token=' + authService.getToken(), data);
    }
     // request to get all the test by userid
    requests.getTestsbyID =  (uid) =>{
        return $http.get('/user/allTestsbyID/'+uid+'?token=' + authService.getToken());
    }
     // request to get all the test by InstructorID
    requests.getTestsbyInstructorID =  (tid) =>{
        return $http.get('/user/allTestsbyInstructorID/'+tid+'?token=' + authService.getToken());
    }
     // request to generate test questions for each test
    requests.generateTestQuestion =  (data) =>{
        return $http.post('/user/generateTQ?token=' + authService.getToken(), data);
    }
     // request to get all the test
    requests.getTests =  () =>{
        return $http.get('/user/allTests/?token=' + authService.getToken());
    }
     // request to get a single test
    requests.viewTest =  (tid) =>{
        return $http.get('/user/test/'+tid+'?token=' + authService.getToken());
    }

    // request to Create a Question by Admin
     requests.createQuestion  =  (data) =>{
        console.log(data);
        return $http.post('/user/test/'+data.id+'/addQuestion?token=' + authService.getToken(), data);
    }

     // request to delete a Test by Admin
    requests.deleteTest =  (tid) =>{
        return $http.get('/user/test/delete/' + tid + '?token=' + authService.getToken());
    }

    // request to delete an User by Admin
    requests.deleteUser =  (tid) =>{
        return $http.get('/user/delete/' + tid + '?token=' + authService.getToken());
    }

    // request to delete a Category by Admin
    requests.deleteArea =  (data) =>{
       console.log(data);
        return $http.post('/user/area/delete/?token=' + authService.getToken(), data);
    }

    requests.deleteSubject =  (data) =>{
       console.log(data);
        return $http.post('/user/subject/delete/?token=' + authService.getToken(), data);
    }

    requests.deleteCourse =  (data) =>{
       console.log(data);
        return $http.post('/user/course/delete/?token=' + authService.getToken(), data);
    }

    requests.deleteChapter =  (data) =>{
       console.log(data);
        return $http.post('/user/chapter/delete/?token=' + authService.getToken(), data);
    }

    requests.deleteTopic =  (data) =>{
       console.log(data);
        return $http.post('/user/topic/delete/?token=' + authService.getToken(), data);
    }

    // request to get  Questions
    requests.viewQuestions =  (data) =>{
        //console.log(data);
        return $http.get('/user/test/' + data + '/getQuestions?token=' + authService.getToken());
    }

    requests.viewReport =  (tid, uid) =>{
        console.log("viewReport-service", tid, uid);
        return $http.get('/user/report/' + tid + '/' + uid + '/?token=' + authService.getToken());
    }

     // request to Update test details by Admin
    requests.updateTest =  (data)=> {
        //console.log(data);
        return $http.put('/user/test/edit/' + data.id + '?token=' + authService.getToken(), data);
    }

    // request to get the all test results by test id
    requests.getTestResultbyID =  (tid)=> {
        //console.log(data);
        return $http.get('/user/getTestResultbyID/' + tid + '?token=' + authService.getToken());
    }

    // request to edit User
    requests.editUser =  (data)=> {
        return $http.put('/user/edit/' + data._id + '?token=' + authService.getToken(), data);
    }

      // request to delete question  by Admin
    requests.deleteQuestion =  (tid, qid)=> {
        return $http.post('/user/deleteQuestion/' + tid + '/' + qid + '?token=' + authService.getToken());
    }

    // request to Update question by Admin
    requests.updateQuestion =  (data, qid)=> {
        return $http.put('/user/test/editQuestion/' + qid + '?token=' + authService.getToken(), data);
    }

    //request to get questions for single test
    requests.getQuestionDetail =  (tid,qid) =>{
        //console.log(singleTestId);
        return $http.get('/user/test/getQuestion/' + tid + '/' + qid + '?token=' + authService.getToken());
    }

     //requests to submit answer for single test
    requests.submitAnswer =  (data)=> {
        return $http.post('/test/' + data.testid + '/' + data.questionid + '/userAnswer?token=' + authService.getToken(), data);
    }


    //requests to get questions for single test
    requests.submitAnswers =  (data) =>{
        return $http.post('/user/addPerformance/?token=' + authService.getToken(), data);
    }

    //requests to post test attempted by
    requests.testAttempted =  (attemptdata) =>{
        return $http.post('/user/tests/' + attemptdata.testid + '/attemptedby?token=' + authService.getToken(), attemptdata);
    }
     //requests to get the entire performances 
    requests.getallperformances =  () =>{
        return $http.get('/user/all/performances?token=' + authService.getToken());
    }


    //requests to get performance of a user in a particular test
    requests.getusertestdetails =  (data) =>{
        return $http.post('/user/performance?token=' + authService.getToken(), data);
    }

    //requests to get performance of all user in a particular test
    requests.getallusertestdetails =  (tid) =>{
        return $http.get('/user/all/performance/' + tid + '?token=' + authService.getToken());
    }

    // request to Create an Area by Admin
    requests.createCourse  =  (data) =>{
        console.log(data);
        return $http.post('/user/admin/createCourse?token=' + authService.getToken(), data);
    }

    // request to create a new test by Admin
    requests.submitTest  =  (data) =>{
        console.log(data);
        return $http.post('/user/admin/submitTest?token=' + authService.getToken(), data);
    }

    // request to edit the test by Admin
    requests.editTest  =  (data, tid) =>{
        console.log(data);
        return $http.put('/user/admin/editTest/' + tid + '?token=' + authService.getToken(), data);
    }

    // request to Create a Course by Admin
    requests.createareaofstudy  =  (data) =>{
        console.log(data);
        return $http.post('/user/admin/createareaofstudy?token=' + authService.getToken(), data);
    }
    // request to get all the areas
    requests.getAreas =  () =>{
        return $http.get('/user/getallAreas?token=' + authService.getToken()); // allAreas
    }
    // request to Create a Subject by Admin
    requests.createsubject  =  (data) =>{
        console.log(data);
        return $http.post('/user/admin/createsubject?token=' + authService.getToken(), data);
    }
    // request to get all the subjects
    requests.getSubjects =  (area) =>{
        return $http.get('/user/allSubjects/' + area + '?token=' + authService.getToken());
    }
    // request to get all the courses
    requests.getCourses =  (data) =>{
        return $http.post('/user/allCourses?token=' + authService.getToken(), data);
    }
    // request to get all the chapters
    requests.getChapters =  (data) =>{
        return $http.post('/user/allChapters?token=' + authService.getToken(), data);
    }
    // request to get all the topics
    requests.getTopics =  (data) =>{
        return $http.post('/user/allTopics?token=' + authService.getToken(), data);
    }
    // request to get all the topics
    requests.getTopicDetails =  (data) =>{
        return $http.post('/user/allTopicDetails?token=' + authService.getToken(), data);
    }
    // request to Create a Chapter by Admin
    requests.createChapter  =  (data) =>{
        console.log(data);
        return $http.post('/user/admin/createChapter?token=' + authService.getToken(), data);
    }

    // request to Create a Chapter by Admin
    requests.createTopic  =  (data) =>{
        console.log(data);
        return $http.post('/user/admin/createTopic?token=' + authService.getToken(), data);
    }

    return requests;

});
//end query service
//