const myApp =  angular.module('ExamGround',['ui.router','ngAnimate','timer','chart.js','angular-loading-bar'])
					  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    						cfpLoadingBarProvider.includeSpinner = false;
    					}])
					  .directive('stringToNumber', function() {
							return {
								require: 'ngModel',
								link: function(scope, element, attrs, ngModel) {
									ngModel.$parsers.push(function(value) {
										return '' + value;
									});
									ngModel.$formatters.push(function(value) {
										return parseFloat(value);
									});
								}
							};
						});

// filter for showing live questions 
 myApp.filter('startFrom', function() {
			return function(input, start) {
				start = +start;
				return input.slice(start);
			 }
		});					