var myApp = angular.module("myApp",['ngRoute','ngAnimate']);

// before app runs
myApp.config(['$routeProvider', function($routeProvider){

    // $locationProvider.html5Mode(true);

    $routeProvider
    .when('/all', {
        templateUrl: 'views/all.html',
        controller: 'AppController'
    })
    .when('/food', {
        templateUrl: 'views/food.html',
        controller: 'AppController'
    })
    .when('/bevrages', {
        templateUrl: 'views/bevrages.html',
        controller: 'AppController'
    })
    .when('/favorites', {
        templateUrl: 'views/favorites.html',
        controller: 'AppController'
    })
    .when('/followUs', {
        templateUrl: 'views/followUs.html',
    })
    .when('/contact', {
        templateUrl: 'views/contact.html',
    })
    .otherwise({
        redirectTo: '/all'
    });

}]);


// // after the app runs
// myApp.run(function(){
//     //code
// });


myApp.controller('AppController', ['$scope','$http', function($scope,$http){
    
    $http.get('data/bevrages/bevrage1.json')
    .then(function(response) {
        $scope.arr = response.data;
    })
    .catch(function(error) {
        console.error("Error loading data:", error);
    });

}]);
