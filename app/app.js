var myApp = angular.module("myApp",['ngRoute','ngAnimate']);

// before app runs
myApp.config(['$routeProvider', '$locationProvider', function($routeProvider,$locationProvider){

    // $locationProvider.html5Mode(true);

    $routeProvider
    .when('/food', {
        templateUrl: 'views/food.html',
        controller: 'AppController'
    })
    .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactController'
    })
    .when('/all', {
        templateUrl: 'views/all.html',
        controller: 'AppController'
    })
    .when('/bevrages', {
        templateUrl: 'views/bevrages.html',
        controller: 'AppController'
    })
    .otherwise({
        redirectTo: '/food'
    });

}]);


// // after the app runs
// myApp.run(function(){
//     //code
// });


myApp.controller('AppController', ['$scope','$http', function($scope,$http){
    
    $http.get('data/food.json')
    .then(function(response) {
        $scope.arr = response.data;
    })
    .catch(function(error) {
        console.error("Error loading data:", error);
    });

    // console.log(angular.toJson($scope.arr));

}]);



myApp.controller('ContactController', ['$scope','$location', function($scope,$location){

    // $scope.sendMessage = function(){
    //     $location.path('/contact-success');
    // };

}]);