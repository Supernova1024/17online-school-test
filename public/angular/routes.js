myApp.config(['$stateProvider','$urlRouterProvider','$locationProvider', function($stateProvider,$urlRouterProvider,$locationProvider) {


    $stateProvider
    .state('main',{
        url:'/',
        templateUrl	: 'views/main.html'

    })
    .state('login',{
      url           :'/login/:token',
      templateUrl    : 'views/login.html',
      controller     : 'userController as userCtrl',
      resolve: {
        "check": function ($location,authService,$stateParams) {
            if (authService.getToken()) {

                $location.path('/dashboard');

            } else {
                $location.path('/login/'+ $stateParams.token);

            }
        }
    }

})

    .state('signup',{
        url            : '/signup/:token',
        templateUrl    : 'views/signup.html',
        controller     : 'userController as userCtrl'

    })
    .state('forgotpass',{
        url            : '/forgotpass',
        templateUrl    : 'views/forgot-pass.html',
        controller     : 'userController as userCtrl'

    })
    .state('dashboard',{
        url            : '/dashboard',
        templateUrl    : 'views/dashboard.html',
        controller     : 'dashController as dashCtrl',
        resolve: {
            "check": function ($location,authService) {
                if (authService.getToken()) {

                    $location.path('/dashboard/index');

                } else {
                    $location.path('/login');

                }
            }
        }
    })
    .state('dashboard.index',{
        url            : '/index',
        templateUrl    : 'views/index.html',
        controller     : 'dashController as dashCtrl'
    })
    .state('dashboard.viewtestresults',{
        url            : '/view_testresults/:tid',
        templateUrl    : 'views/view_testresults.html',
        controller   : 'dashController as dashCtrl'  
    })
    .state('dashboard.viewtestreport',{
        url            : '/view_testreport/:tid/:uid',
        templateUrl    : 'views/view-testreport.html',
        controller   : 'livetestController as liveCtrl'  
    })
    .state('dashboard.createtest',{
        url            : '/createtest',
        templateUrl    : 'views/create-test.html',
        controller   : 'testController as testCtrl'     
    })
    .state('dashboard.edittest',{
        url            : '/edittest/:tid',
        templateUrl    : 'views/edit-test.html',
        controller   : 'testController as testCtrl'  
    })
    .state('dashboard.quesoperation',{
        url            : '/quesops',
        templateUrl    : 'views/question-operations.html',
        controller   : 'testController as testCtrl'  
    })
    .state('dashboard.cateoperation',{
        url            : '/cateops',
        templateUrl    : 'views/category-operations.html',
        controller   : 'testController as testCtrl'  
    })
    .state('dashboard.addinstructor',{
        url            : '/addinstructor',
        templateUrl    : 'views/add-instructor.html',
        controller   : 'userController as userCtrl'     
    })
    .state('dashboard.addadmin',{
        url            : '/addadmin',
        templateUrl    : 'views/add-admin.html',
        controller   : 'userController as userCtrl'     
    })
    .state('dashboard.editinstructor',{
        url            : '/editinstructor/:uid',
        templateUrl    : 'views/edit-instructor.html',
        controller   : 'dashController as dashCtrl'     
    })
    .state('dashboard.editadministrator',{
        url            : '/editadministrator/:uid',
        templateUrl    : 'views/edit-administrator.html',
        controller   : 'dashController as dashCtrl'     
    })
    .state('dashboard.instructors',{
        url            : '/view-instructors',
        templateUrl    : 'views/view-instructors.html',
        controller   : 'testController as testCtrl'     
    })
    .state('dashboard.admins',{
        url            : '/view-admins',
        templateUrl    : 'views/view-admins.html',
        controller   : 'testController as testCtrl'     
    })
    .state('dashboard.addstudent',{
        url            : '/addstudent',
        templateUrl    : 'views/add-student.html',
        controller   : 'userController as userCtrl'     
    })
    .state('dashboard.editstudent',{
        url            : '/editstudent/:uid',
        templateUrl    : 'views/edit-student.html',
        controller   : 'dashController as dashCtrl'     
    })
    .state('dashboard.students',{
        url            : '/view-students',
        templateUrl    : 'views/view-students.html',
        controller   : 'testController as testCtrl'     
    })
    .state('dashboard.allusers',{
        url            : '/allusers/:tid',
        templateUrl    : 'views/allusers.html',
        controller   : 'testController as testCtrl'  
    })
    .state('dashboard.userperformances',{
        url            : '/userperformances',
        templateUrl    : 'views/userperformances.html',
        controller   : 'dashController as dashCtrl'  
    })
    .state('dashboard.livetest',{
        url            : '/livetest/:tid',
        templateUrl    : 'views/live-test.html',
        controller     : 'livetestController  as liveCtrl'  
    })
    .state('dashboard.livetestnew',{
        url            : '/livetestnew',
        templateUrl    : 'views/live-test-new.html',
        controller     : 'livetestController  as liveCtrl'  
    })
    .state('dashboard.result',{
        url            : '/result/:tid',
        templateUrl    : 'views/result.html',
        controller     : 'resultsController  as resultCtrl'  
    })
    .state('dashboard.testquestions',{
        url            : '/testquestions',
        templateUrl    : 'views/available-testquestions.html',
        controller     : 'dashController as dashCtrl',
        resolve: {
            "check": function ($location,authService) {
                if (authService.getToken()) {

                    $location.path('/dashboard/testquestions');

                } else {
                    $location.path('/login');

                }
            }
        }
    })
    .state('dashboard.tests',{
        url            : '/tests',
        templateUrl    : 'views/available-tests.html',
        controller     : 'testController as testCtrl',
        resolve: {
            "check": function ($location,authService) {
                if (authService.getToken()) {

                    $location.path('/dashboard/tests');

                } else {
                    $location.path('/login');

                }
            }
        }
    })

    .state('dashboard.userprofile',{
        url            : '/profile',
        templateUrl    : 'views/view-profile.html',
        controller   : 'dashController as dashCtrl'     
    })

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    
}]);