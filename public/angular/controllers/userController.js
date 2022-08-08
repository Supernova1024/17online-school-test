myApp.controller('userController',['$http','$stateParams','apiService','$rootScope','authService','$location','$window',function($http,$stateParams,apiService,$rootScope,authService,$location,$window){

	var user = this;
	var token=$stateParams.token;
	this.notify='';
	this.show=true;
	this.showOtpForm=false;
	this.validate_password=false;
	this.mismatch_password=false;
	this.showPasswordResetForm=false;
	this.token = token;
	
	//clear the form after submit
	this.resetForm=()=>{
		user.firstname='';
		user.lastname='';
		user.email='';
		user.mnumber='';
		user.password='';
	};
	//function to register user
	this.registerUser=()=>{
		console.log('here');
		if (user.password != user.confirmpassword) {
			console.log('here i am');
			this.mismatch_password=true;
			return;
		};
		if (token == '' || typeof token == 'undefined') {
		  // register as an student
		  user.notify='';
		  var userData={
			name	  : user.firstname+' '+user.lastname,
			email	: user.email,
			role	  : 'student',
			password  : user.password
		  };
		  
		  apiService.signUp(userData).then( function successCallback(response){
			  console.log(response);
			  if (response.data.error) {
			  	alert(response.data.message);
			  } else {
				authService.setToken(response.data.token);
				$location.path('/dashboard');
			  }			  
			},
			function errorCallback(response) {
			 alert("some error occurred. Check the console.");
			 console.log(response); 
		   });
		} else {
		  apiService.checkToken(token).then( function successCallback(response){
			if(!response.data.error && response.data.data){
			  user.notify='';
			  var userData={
				name	  : user.firstname+' '+user.lastname,
				email	 : user.email,
				role	  : 'student',
				token	 : token,
				password  : user.password
			  };
			  
			  apiService.signUp(userData).then( function successCallback(response){
				if(!response.data.error){
					authService.setToken(response.data.token);
					$location.path('/dashboard');
				}
			  },
			  function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			  });
			} else {
			  user.validate_token = true;
			}
		  },
		  function errorCallback(response) {
		   alert("some error occurred. Check the console.");
		   console.log(response); 
		 });
		}		
	};
	//function to login user
	this.loginUser=()=>{
		if (token == '') {
			user.notify='';
			var userData={
				email		 	: user.email,
				password		: user.password
			};
			apiService.login(userData).then( function successCallback(response){
				//console.log(response);
				if(!response.data.error){
					authService.setToken(response.data.token);
					$location.path('/dashboard');
				} else {
					user.incorrect = true;
				}
				user.notify=response.data.message;
			},

			function errorCallback(response) {
			 alert("some error occurred. Check the console.");
			 console.log(response); 
			});
		} else {
			apiService.checkToken(token).then( function successCallback(response){
				if(!response.data.error && response.data.data){
					user.notify='';
					var userData={
						email		 	: user.email,
						password		: user.password,
						test_token      : token
					};
					apiService.login(userData).then( function successCallback(response){
						//console.log(response);
						if(!response.data.error){
							if (!response.data.tp) alert('You took the test already.');
							authService.setToken(response.data.token);
							$location.path('/dashboard');
						}
						user.notify=response.data.message;
					},

					function errorCallback(response) {
					 alert("some error occurred. Check the console.");
					 console.log(response); 
					});
				} else {
					user.validate_token = true;
				}
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
		}
	};

	this.registerUsers=(role)=>{
		if (role == 'instructor') {
			var userData={
				name	  : user.firstname+' '+user.lastname,
				email	  : user.email,
				role	  : role,
				department  : user.department,
				institution : user.institution,
				password  : user.password
			};
		} else if (role == 'administrator'){
			var userData={
				name	  : user.firstname+' '+user.lastname,
				email	  : user.email,
				role	  : role,
				password  : user.password
			};
		} else {
			var userData={
				name	  : user.firstname+' '+user.lastname,
				email	  : user.email,
				role	  : role,
				institution : user.institution,
				password  : user.password
			};
		}
		
		apiService.signUp(userData).then( function successCallback(response){
			console.log(response);
			if (response.data.error) {
				alert(response.data.message);
			} else {
				if (role == 'instructor'){
					$location.path('/dashboard/view-instructors');
				} else if (role == 'administrator') {
					$location.path('/dashboard/view-admins');
				} else {
					$location.path('/dashboard/view-students');
				}
			}			  
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	}

	//function to send resetpassword request
	this.sendOtpToEmail=()=>{
	user.notify='';
	var userData={email:user.email};

	apiService.forgotPasswordOtpSend(userData).then(function successCallback(response){
				//console.log(response);
				if(!response.data.error){
					user.showOtpForm=true;
				}

				user.notify=response.data.message;
				//userData.$setPristine();
			},
			function errorCallback(response) {
				alert("some error occurred. Check the console.");
				console.log(response); 
			});
	};

	//function to verify otp
	this.verifyOtp=()=>{
		var otp={otp:user.otp};
		user.notify='';
		apiService.verifySentOtp(otp).then(function successCallback(response){
			if(!response.data.error){
				user.show=false;
				user.showPasswordResetForm=true;
			}

			user.notify=response.data.message;
			//otp.$setPristine();

		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});


	};

	 	//function to reset password 
	this.resetPassword=()=>{
		user.notify='';
		var newPassword={password : user.password,cpassword:user.cpassword};
		apiService.resetPassword(newPassword).then(function successCallback(response){

		 console.log(response);
		 user.notify=response.data.message;
			//newPassword.$setPristine();

		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		});
	};

	this.checkPassword=()=>{
		var pattern = /^.*(?=.{8,20})(?=.*\d)(?=.*[@#$%&!-_]).*$/;
		if(pattern.test(user.password)) {
			this.validate_password=false;
		}else{
			if (typeof user.password === 'undefined') {
				this.validate_password=false;
			} else {
				this.validate_password=true;
			}
		}
	};

	this.goAdminList=()=> {
		$location.path('/dashboard/view-admins');
	};

	this.goInstructorList=()=> {
		$location.path('/dashboard/view-instructors');
	};

	this.goStudentList=()=> {
		$location.path('/dashboard/view-students');
	};
}]);