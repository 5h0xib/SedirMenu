var myApp = angular.module("myApp", ['ngRoute', 'ngAnimate']);

// Shared Service for Data
myApp.service('DataService', ['$http', function ($http) {
    this.getBeverages = function () {
        return $http.get('data/bevrages/bevrage1.json');
    };
}]);

// Service for managing favorites
myApp.factory('FavoritesService', function () {
    let favorites = [];

    return {
        getFavorites: function () {
            return favorites;
        },
        addFavorite: function (item) {
            if (!favorites.some(fav => fav.id === item.id)) {
                favorites.push(item);
                return true; // Successfully added
            }
            return false; // Already exists
        },
        removeFavorite: function (item) {
            const index = favorites.findIndex(fav => fav.id === item.id);
            if (index !== -1) {
                favorites.splice(index, 1);
                return true; // Successfully removed
            }
            return false; // Not found
        }
    };
});


// Configure Routes
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
            controller: 'FavoritesController'
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

// Initialize App
myApp.run(['$window', '$timeout', function ($window, $timeout) {
    // Google Translate Initialization
    $window.googleTranslateElementInit = function () {
        new $window.google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
        );
    };

    // Load Google Translate Script with Retry Logic
    function loadGoogleTranslateScript(retryCount = 3) {
        if (retryCount === 0) {
            console.error('Google Translate script failed to load after retries.');
            return;
        }
        if (document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
            return;
        }

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.onload = function () {
            console.log('Google Translate script loaded successfully.');
        };
        script.onerror = function () {
            console.error('Failed to load Google Translate script. Retrying...');
            $timeout(() => loadGoogleTranslateScript(retryCount - 1), 2000);
        };

        document.body.appendChild(script);
    }

    loadGoogleTranslateScript();
}]);

// Main App Controller
myApp.controller('AppController', ['$scope', 'DataService', 'FavoritesService', function ($scope, DataService, FavoritesService) {
    // Load Beverages Data
    DataService.getBeverages()
        .then(function (response) {
            $scope.arr = response.data;
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
        });

    // Scroll to Section
    $scope.scrollTo = function (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('Section with id "' + sectionId + '" not found.');
        }
    };

    // Add item to favorites
    $scope.addToFavorites = function (item) {
        const added = FavoritesService.addFavorite(item);
        if (added) {
            console.log('Item added to favorites!');
        } else {
            console.log('Item is already in favorites.');
        }
    };

    // Initialize items
    $scope.items = [
        { id: 1, name: 'Item 1', rate: 100, isFavorite: false },
        { id: 2, name: 'Item 2', rate: 150, isFavorite: false }
    ];

    // Toggle the favorite status of an item
    $scope.toggleFavorite = function (item) {
        item.isFavorite = !item.isFavorite;

        // Optionally, add or remove from favorites list (you can adapt this to your logic)
        if (item.isFavorite) {
            FavoritesService.addFavorite(item);
        } else {
            FavoritesService.removeFavorite(item);
        }
    };
    
}]);

// Favorites Controller
myApp.controller('FavoritesController', ['$scope', 'FavoritesService', function ($scope, FavoritesService) {
    $scope.favorites = FavoritesService.getFavorites();

    // Add item From favorites
    $scope.removeFromFavorites = function(item) {
       const index = $scope.favorites.findIndex(fav => fav.id === item.id);
       if (index !== -1) {
           $scope.favorites.splice(index, 1);
           console.log('Item removed from favorites.');
       }
    }

    $scope.getTotal = function(){
        // total of all item.rate in the array
        return $scope.favorites.reduce(function (total, item) {
            return total + (item.rate || 0); // Safeguard for undefined rates
        }, 0);
    }
}]);
