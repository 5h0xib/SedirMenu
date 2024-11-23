var myApp = angular.module("myApp", ['ngRoute', 'ngAnimate']);

// Shared Service for Data
myApp.service('DataService', ['$http', function ($http) {
    this.getBeverages = function () {
        return $http.get('data/bevrages/bevrage1.json');
    };

    this.getBeverages2 = function () {
        return $http.get('data/bevrages/bevrage2.json');
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
        },
        isFavorite: function (item) {
            return favorites.some(fav => fav.id === item.id);
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
    $window.googleTranslateElementInit = function () {
        new $window.google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
        );
    };

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
            $scope.bev1 = response.data;
            // Sync items with FavoritesService on data load
            $scope.bev1.forEach(item => {
                item.isFavorite = FavoritesService.isFavorite(item);
            });
        })
        .catch(function (error) {
            console.error("Error loading data:", error);
        });

    // Load Beverages Data
    DataService.getBeverages2()
        .then(function (response) {
            $scope.bev2 = response.data;
            // Sync items with FavoritesService on data load
            $scope.bev2.forEach(item => {
                item.isFavorite = FavoritesService.isFavorite(item);
            });
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

    // Add to Favorites
    $scope.addToFavorites = function (item) {
        const added = FavoritesService.addFavorite(item);
        item.isFavorite = added;
    };

    // Toggle Favorite State
    $scope.toggleFavorite = function (item) {
        if (item.isFavorite) {
            FavoritesService.removeFavorite(item);
        } else {
            FavoritesService.addFavorite(item);
        }
        item.isFavorite = !item.isFavorite;
    };

    // Sync `isFavorite` status when the controller is initialized
    $scope.syncFavorites = function () {
        if ($scope.arr) {
            $scope.arr.forEach(item => {
                item.isFavorite = FavoritesService.isFavorite(item);
            });
        }
    };

    // Ensure favorites are synced on view load
    $scope.syncFavorites();
}]);


// Favorites Controller
myApp.controller('FavoritesController', ['$scope', 'FavoritesService', function ($scope, FavoritesService) {
    $scope.favorites = FavoritesService.getFavorites();

    $scope.removeFromFavorites = function (item) {
        FavoritesService.removeFavorite(item);
    };

    $scope.getTotal = function () {
        return $scope.favorites.reduce(function (total, item) {
            return total + (item.rate || 0);
        }, 0);
    };
}]);
