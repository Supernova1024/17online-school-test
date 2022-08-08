myApp.controller('resultsController',['$http','$window','$scope','$stateParams','$filter','apiService','authService','$rootScope','$location','$state',function($http,$window,$scope,$stateParams,$filter,apiService,authService,$rootScope,$location,$state){

var result=this;
var testid=$stateParams.tid;

// get the result of the user
this.getResult=()=>{
	var data = {
		'userid': $rootScope.userID,
		'testid': testid
	};
	apiService.getusertestdetails(data).then(function successCallBack(response){
			// console.log('getusertestdetails', response.data.data)
			result.performance=response.data.data;
			result.email=result.performance.user_id;
			result.timeTaken = result.secondsToHms(response.data.data.timeTaken);
			
			//evualuating the no. of wrong answers and the percentile
			result.noOfQuestions = result.performance.questionCount;
			result.wrongAns = result.noOfQuestions - ( result.performance.totalCorrectAnswers + result.performance.totalSkipped );
			result.percentile=(result.performance.score/result.performance.total_score)*100;
			//console.log(result.performance);

			result.labels =[ result.performance.totalCorrectAnswers + " Correct Answers" , result.wrongAns + " Wrong Answers", result.performance.totalSkipped +" Skipped"];
 			result.data=[result.performance.totalCorrectAnswers,result.wrongAns,result.performance.totalSkipped ];
		},
		function errorCallback(response) {
			alert("some error occurred. Check the console.");
			console.log(response); 
		}); 
	
};
// getting the testtime and other required values
this.getTestTime=()=>{
	apiService.viewTest(testid).then(function successCallBack(response){
		// console.log('viewTest', response.data.data)
		result.testname=response.data.data.title;
		result.testAttemptedBy=response.data.data.testAttemptedBy;
		result.noOfStudents = result.testAttemptedBy.length;
		result.testserial = response.data.data.serial;

		result.email=$rootScope.userID;
		let date = response.data.data.created;
		result.datetimetaken = date.replace('T', ' ').split('.')[0];

		//evualuating the no. of wrong answers and the percentile

		// chart.js configurations
		result.options={
			legend : { display : true, position : 'bottom'}
		};

		// evaluating the rank of the user
		var sorted = result.testAttemptedBy.slice().sort(function(a,b){return b.score-a.score});
		result.rank = sorted.findIndex(x => x.userid===result.email) + 1;
	});	
	//call the function
	result.getResult();
};

//call the function
this.getTestTime();

this.secondsToHms=(d)=> {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}
}]);


