var myApp = angular.module("myApp", ['ngRoute', 'ngAnimate']);

// before app runs
myApp.config(['$routeProvider', function ($routeProvider) {

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

myApp.run(['$window', '$timeout', function ($window, $timeout) {
    // Define the Google Translate initialization function
    $window.googleTranslateElementInit = function () {
        new $window.google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
        );
    };    

    // Function to dynamically load the Google Translate script
    function loadGoogleTranslateScript(retryCount = 3) {
        if (retryCount === 0) {
            console.error('Google Translate script failed to load after retries.');
            return;
        }

        // Check if the script is already loaded
        if (document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
            return;
        }

        // Dynamically create the script element
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.onload = function () {
            console.log('Google Translate script loaded successfully.');
        };
        script.onerror = function () {
            console.error('Failed to load Google Translate script. Retrying...');
            $timeout(() => loadGoogleTranslateScript(retryCount - 1), 2000); // Retry after 2 seconds
        };

        document.body.appendChild(script);
    }

    // Load the Google Translate script with retry logic
    loadGoogleTranslateScript();
}]);

myApp.controller('AppController', ['$scope', '$http', '$location', '$anchorScroll', function ($scope, $http, $location, $anchorScroll) {
    // Load data
    $http.get('data/bevrages/bevrage1.json')
        .then(function (response) {
            $scope.arr = response.data;
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
        });

    // Scroll to the desired section
    $scope.scrollTo = function (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' }); // Smooth scrolling
        } else {
            console.error('Section with id "' + sectionId + '" not found.');
        }
    };
}]);
