//app.js
var myApp = angular.module("myApp", ['ngRoute', 'ngAnimate']);

// Shared Service for Data
myApp.service('DataService', ['$http', function ($http) {
    // Beverages
    this.getbevrage1 = function () {
        return $http.get('data/bevrages/bevrage1.json');
    };
    this.getbevrage2 = function () {
        return $http.get('data/bevrages/bevrage2.json');
    };

    this.getItems = function () {
        const categories = [
            this.getbevrage1(),
            this.getbevrage2()
        ];
    
        // Fetch all categories and combine them into a single array
        return Promise.all(categories).then(responses => {
            return responses.reduce((allItems, response) => {
                return allItems.concat(response.data);
            }, []);
        });
    };
    

    this.scrollTo = function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error(`Element with ID "${elementId}" not found.`);
        }
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
        .when('/sweets', {
            templateUrl: 'views/sweets.html',
            controller: 'AppController'
        })
        .when('/item/:id', {
            templateUrl: 'views/item-details.html',
            controller: 'ItemDetailController'
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
    const loadCategory = function (serviceMethod, scopeKey) {
        serviceMethod().then(function (response) {
            $scope[scopeKey] = response.data;

            // Resize images in the loaded data
            $scope[scopeKey].forEach(item => {
                item.isFavorite = FavoritesService.isFavorite(item);
                if (item.imageUrl) {
                    resizeImage(item.imageUrl, 800).then(resizedImage => {
                        item.optimizedImageUrl = resizedImage;
                    });
                }
            });
        }).catch(function (error) {
            console.error(`Error loading ${scopeKey}:`, error);
        });
    };

    // Function to resize an image to the specified width
    function resizeImage(imageUrl, targetWidth) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Handle CORS for external images
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate the aspect ratio and set canvas dimensions
                const aspectRatio = img.height / img.width;
                canvas.width = targetWidth;
                canvas.height = targetWidth * aspectRatio;

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert the canvas to a data URL (base64 string)
                const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality as needed
                resolve(resizedImageUrl);
            };
            img.onerror = function () {
                console.error(`Failed to load image at ${imageUrl}`);
                reject(`Failed to load image at ${imageUrl}`);
            };
            img.src = imageUrl; // Trigger image loading
        });
    }

    // Load all categories
    // Food
    loadCategory(DataService.getbevrage1, 'bevrage1');
    loadCategory(DataService.getbevrage2, 'bevrage2');

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

    $scope.viewItemDetail = function(item) {
        DataService.setSelectedItem(item);
        $location.path('/item/' + item.id);
    };
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


// ItemDetailsController
myApp.controller('ItemDetailController', [
    '$scope', '$routeParams', 'DataService', 'FavoritesService', '$window', '$timeout',
    function ($scope, $routeParams, DataService, FavoritesService, $window, $timeout) {
  
      const itemId = parseInt($routeParams.id, 10);
      console.log("Item ID selected:", itemId);
  
      // Fetch all items and find the selected item
      DataService.getItems()
        .then(function (items) {
          $scope.item = items.find(item => item.id === itemId);
  
          if (!$scope.item) {
            console.log("Item not found.");
            return;
          }
  
          console.log("Item loaded successfully:", $scope.item);
  
          // Sync `isFavorite` status with FavoritesService
          $scope.item.isFavorite = FavoritesService.isFavorite($scope.item);
  
          // heart icon click
          $timeout(() => {
            const heartIcon = document.getElementById('heart-icon');
            if (heartIcon) {
              heartIcon.click();
              $timeout(() => {
                heartIcon.click();
              }, 1);
            }
          }, 0);
        })
        .catch(function (error) {
          console.log("Error fetching items:", error);
        });
  
      // Toggle favorite status
      $scope.toggleFavorite = function () {
        if ($scope.item.isFavorite) {
          FavoritesService.removeFavorite($scope.item);
        } else {
          FavoritesService.addFavorite($scope.item);
        }
        $scope.item.isFavorite = !$scope.item.isFavorite;
      };
  
      // Go back to the previous page
      $scope.goBack = function () {
        $window.history.back();
      };
    }
  ]);
  
