// AngularJS routing powered by Angular UI Router.
//Inject the teasy controllers (controllers.js)
angular.module('teasy', ['ionic', 'teasy.controllers'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});
})

//State configuration. TODO: naming
.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('app', {
		url: "/app",
		abstract: true,
		templateUrl: "templates/menu.html",
		controller: 'PlaylistsCtrl'
	})

	.state('app.search', {
		url: "/search",
		views: {
			'menuContent': {
				templateUrl: "templates/search.html"
			}
		}
	})
		.state('app.addList', {
			url: "/addList",
			views: {
				'menuContent': {
					templateUrl: "templates/addList.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('app.myLists', {
			url: "/myLists",
			views: {
				'menuContent': {
					templateUrl: "templates/myLists.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('app.editList', {
			url: "/editList",
			views: {
				'menuContent': {
					templateUrl: "templates/editList.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('app.settings', {
			url: "/settings",
			views: {
				'menuContent': {
					templateUrl: "templates/settings.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('app.practice1', {
			url: "/practice1",
			views: {
				'menuContent': {
					templateUrl: "templates/practice1.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('app.practice2', {
			url: "/practice2",
			views: {
				'menuContent': {
					templateUrl: "templates/practice2.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('app.practice3', {
			url: "/practice3",
			views: {
				'menuContent': {
					templateUrl: "templates/practice3.html",
					controller: 'PlaylistsCtrl'
				}
			}
		})
		.state('login2', {
			url: "/login2",
			templateUrl: "templates/login2.html",
			controller: 'PlaylistsCtrl'
		});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/myLists');
});