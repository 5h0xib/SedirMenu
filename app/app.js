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


myApp.controller('AppController', ['$scope','$http', '$location', '$anchorScroll', function($scope,$http, $location, $anchorScroll) {
    // Load data
    $http.get('data/bevrages/bevrage1.json')
    .then(function(response) {
        $scope.arr = response.data;
    })
    .catch(function(error) {
        console.error("Error loading data:", error);
    });

    // Scroll to the desired section
    $scope.scrollTo = function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' }); // Smooth scrolling
        } else {
            console.error('Section with id "' + sectionId + '" not found.');
        }
    };
}]);

