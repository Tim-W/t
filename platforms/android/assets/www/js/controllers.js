angular.module('starter.controllers', ['firebase', 'ngCordova'])

.controller('PlaylistsCtrl', function ($rootScope, $timeout, $scope, $firebase, $ionicActionSheet, $ionicPopup, $state, $ionicNavBarDelegate, $cordovaCapture, $ionicModal, $cordovaCamera, $ionicLoading, $firebaseSimpleLogin, $http) {
	$scope.maxIndex = 0;
	$scope.newList = {};
	// Form data for the openModal modal
	$scope.openModalData = {};

	// Create the openModal modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function (modal) {
		$scope.modal = modal;
	});

	// Triggered in the openModal modal to close it
	$scope.closeModal = function () {
		$scope.modal.hide();
	};

	// Open the openModal modal
	$scope.openModal = function () {
		$scope.modal.show();
	};

	// Perform the openModal action when the user submits the openModal form
	$scope.doopenModal = function () {
		//		console.log('Doing openModal', $scope.openModalData);

		// Simulate a openModal delay. Remove this and replace with your openModal
		// code if using a openModal system
		$timeout(function () {
			$scope.closeModal();
		}, 1000);
	};

	$scope.headerColor = 'bar-positive';
	$rootScope.$on('$stateChangeStart',
		function (event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'app.practice3') {
				$scope.headerColor = 'bar-dark'
			} else {
				$scope.headerColor = 'bar-positive'
			}
		}
	);

	var ref = new Firebase("https://te-asy.firebaseio.com/");
	var sync = $firebase(ref);
	var ref2 = new Firebase("https://te-asy.firebaseio.com/lists");
	var listsArray = $firebase(ref2).$asArray();
	var ref3 = new Firebase("https://te-asy.firebaseio.com/users");
	var usersArray = $firebase(ref3).$asArray();
	$scope.usersArray = usersArray;
	$scope.listsArray = listsArray;


	$scope.selectedList = localStorage.getItem('list');

	$scope.database = sync.$asObject();

	var dataRef = new Firebase("https://te-asy.firebaseio.com/");
	$scope.loginObj = $firebaseSimpleLogin(dataRef);

	$scope.loginObj.$getCurrentUser().then(function (data) {
		$scope.userID = data.uid;
		sync.$asObject().$loaded().then(function () {
			$scope.settings = sync.$asObject().users[$scope.userID];
		});

	});

	//	console.log($scope.userID + $scope.usersArray);

	var oneRef = new Firebase("https://te-asy.firebaseio.com/lists/" + $scope.selectedList + "/");
	$scope.oneRef = $firebase(oneRef).$asObject();
	//	$scope.$watchCollection('database.lists[selectedList].one.values[database.lists[selectedList].one.values.length - 1]', function (newValue, oldValue) {
	//		if (newValue !== '') {
	//			$scope.database.lists[$scope.selectedList].one.values[$scope.database.lists[$scope.selectedList].one.values.length] = '';
	//			$scope.database.lists[$scope.selectedList].two.values[$scope.database.lists[$scope.selectedList].two.values.length] = '';
	//		}
	////		console.log(oldValue);
	////		console.log(newValue);
	//		//        $scope.database.lists[$scope.selectedList].one.values.length = $scope.database.lists[$scope.selectedList].two.values.length;
	//	});

	$scope.$watchCollection('database.lists[selectedList].two.values[database.lists[selectedList].two.values.length - 1]', function (newValue, oldValue) {
		if (newValue !== undefined) {
		console.debug(newValue);	$scope.database.lists[$scope.selectedList].one.values[$scope.database.lists[$scope.selectedList].one.values.length] = '';
			$scope.database.lists[$scope.selectedList].two.values[$scope.database.lists[$scope.selectedList].two.values.length] = '';
		}
		//		console.log(oldValue);
		//		console.log(newValue);
		//        $scope.database.lists[$scope.selectedList].one.values.length = $scope.database.lists[$scope.selectedList].two.values.length;
	});

	$scope.loginWithGoogle = function () {
		$scope.loginObj.$login("google", {
			rememberMe: true
		}).then(function (user) {
			var userRef = new Firebase("https://te-asy.firebaseio.com/users/" + user.uid + "/lists/");
			$scope.userStuff = $firebase(userRef).$asArray();
			var newStuff = {
				directoryName: 'example category',
				listIDs: [

                        ]
			};
			$scope.userStuff.$add(newStuff);
			//			console.log("Logged in as: ", user.uid);
			var id = user.uid;
			//			if (!$scope.database.users[id]) {
			//				console.log('nope');
			//				$scope.database.users[user.uid] = user;
			//
			//				$scope.database.$save();
			//			} else {
			//				console.log('yep');
			//			}
			$state.go('app.myLists');
			$ionicPopup.alert({
				title: 'Welcome!',
				template: "<b>Let's get started.</b> Create a list by swiping to the right and selecting 'Add List' from the menu."
			});
			$ionicNavBarDelegate.showBackButton(false);
		}, function (error) {
			console.error("openModal failed: ", error);
		});
	};

	$scope.loginWithFacebook = function () {
		$scope.loginObj.$login("facebook", {
			rememberMe: true
		}).then(function (user) {
			var userRef = new Firebase("https://te-asy.firebaseio.com/users/" + user.uid + "/lists/");
			$scope.userStuff = $firebase(userRef).$asArray();
			var newStuff = {
				directoryName: 'example category',
				listIDs: [

                        ]
			};
			$scope.userStuff.$add(newStuff);
			//			console.log("Logged in as: ", user.uid);
			var id = user.uid;
			//			if (!$scope.database.users[id]) {
			//				console.log('nope');
			//				$scope.database.users[user.uid] = user;
			//
			//				$scope.database.$save();
			//			} else {
			//				console.log('yep');
			//			}
			$state.go('app.myLists');
		}, function (error) {
			console.error("openModal failed: ", error);
		});
	};

	$scope.logoutNow = function () {
		$state.go('login2');
		$scope.loginObj.$logout();
		//		console.log('logging out...');
	};

	$scope.learn = {};
	$scope.wordToAnswer = '';
	$scope.correctAnswers = [];
	if ($state.is('app.practice3')) {
		document.querySelector("#rightAnswers").innerHTML = 0;
		document.querySelector("#wrongAnswers").innerHTML = 0;
		document.querySelector("#notright").innerHTML = "";
	}
	var privilege = false;
	$scope.submit = function (word) {
		//		console.log($scope.database.lists[$scope.selectedList].one.values.length);
		if (!privilege) {
			if ($scope.database.lists[$scope.selectedList].two.values[$scope.randomNumber] === word) {
				if ($scope.database.lists[$scope.selectedList].one.values.length === 0) {
					$ionicPopup.alert({
						title: 'Completed',
						template: 'Congratulations, you have completed your practice.<br>You had <b>' + document.querySelector("#rightAnswers").innerText + '</b> right answers and <b>' + document.querySelector("#wrongAnswers").innerText + '</b> wrong answers.',
						okText: 'Finish'
					}).then(function (res) {
						$state.go('app.myLists');
					});
				} else {
					//					console.log('correct, ' + $scope.randomNumber);
					delete $scope.database.lists[$scope.selectedList].one.values[0];
					var stuff = Number(document.querySelector("#rightAnswers").innerText);
					stuff += 1;
					document.querySelector("#progression").style.width = $scope.database.lists[$scope.selectedList].one.values.length / $scope.lengthThingy * 100 + '%'
					document.querySelector("#rightAnswers").innerText = stuff;
					$scope.randomNumber = Math.floor((Math.random() * $scope.database.lists[$scope.selectedList].two.values.length));
					document.querySelector("#answer").value = '';
					document.querySelector("#notright").innerHTML = "";
				}
			} else {
				document.querySelector("#notright").innerHTML = "That doesn't seem right... the answer is: <b>" + $scope.database.lists[$scope.selectedList].two.values[$scope.randomNumber] + "</b>";
				document.querySelector("#answer").style.background = "#C00000";
				privilege = true;
				var stuff = Number(document.querySelector("#wrongAnswers").innerText);
				stuff += 1;
				document.querySelector("#wrongAnswers").innerText = stuff;
				//				console.log('false: ' + $scope.database.lists[$scope.selectedList].two.values[$scope.randomNumber] + ', ' + word);
			}
		} else {
			privilege = false;
			document.querySelector("#notright").innerHTML = "";
			document.querySelector("#answer").style.background = "white";
			document.querySelector("#answer").value = '';
			$scope.randomNumber = Math.floor((Math.random() * $scope.database.lists[$scope.selectedList].two.values.length));
			$scope.wordToAnswer = '';
		}
	};

	$scope.showLoadingCamera = function () {
		$ionicLoading.show({
			template: 'Loading camera app...'
		});
	};
	$scope.hideLoadingCamera = function () {
		$ionicLoading.hide();
	};

	$scope.showSheet = function (list) {
		$scope.selectedList = list;
		localStorage.setItem("list", $scope.selectedList);
		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			buttons: [
				{
					text: 'Practice <i class="icon ion-ios7-arrow-right"></i>'
                },
				{
					text: 'Edit <i class="icon ion-ios7-compose-outline"></i>'
                }
     ],
			titleText: 'Selected list: <b>' + $scope.database.lists[$scope.selectedList].title + '</b>',
			destructiveText: 'Delete <i class="icon ion-ios7-trash"></i>',
			cancelText: 'Cancel',
			cancel: function () {
				// add cancel code..
			},
			buttonClicked: function (index) {
				switch (index) {
				case 0:
					$state.go('app.practice2');
					break;
				case 1:
					$state.go('app.editList');
					break;
				case 2:


				}
				//                $state.go('app.editList');
				//                return true;
			},
			destructiveButtonClicked: function () {
				$scope.showConfirm(list);
				return true;
			}
		});

	};

	$scope.showConfirm = function (list) {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete list?',
			template: 'Are you sure you want to delete list <b>' + $scope.database.lists[$scope.selectedList].title + '</b>?',
			buttons: [{ //Array[Object] (optional). Buttons to place in the popup footer.
				text: 'Cancel',
				type: 'button-default',
				onTap: function (e) {}
  }, {
				text: 'Delete',
				type: 'button-assertive',
				onTap: function (e) {
					angular.forEach($scope.currentUsersLists, function (value, key) {
						var ref6URL = "https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/" + key + "/listIDs/";
						angular.forEach(value.listIDs, function (value, key) {
							if (value === $scope.selectedList) {
								var ref6 = new Firebase(ref6URL + key);
								var stuff2 = $firebase(ref6).$asArray();
								stuff2.$remove();
							}
						});
					});
//					var ref = new Firebase("https://te-asy.firebaseio.com/lists/" + $scope.selectedList);
//					var stuff2 = $firebase(ref);
//					stuff2.$remove();
//					stuff2.$remove($scope.selectedList);
//					// Returning a value will cause the promise to resolve with the given value.
					return true;
				}
  }]
		});
	};

	$scope.practice3 = function () {
		$state.go('app.practice3');
	};

	//	console.log($scope.maxIndex);

	//    console.log($scope.selectedList);

	$scope.editList = function (newList) {
		if (newList.category === undefined || newList.category === '' || newList.category === null) {
			newList.category = 'unordered';
		}
		newList.two.values = ["", "", "", "", ""];
		newList.one.values = ["", "", "", "", ""];
		listsArray.$add(newList).then(function (ref) {
			var id = ref.name();
			$scope.selectedList = id;
			localStorage.setItem("list", id);
			//			console.log("added record with id " + id);

			var ListForUser = {
				directoryName: newList.category,
				id: id
			};

			var done = false;

			var currentUsersLists = new Firebase("https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/");
			$scope.currentUsersLists = $firebase(currentUsersLists).$asArray();

			angular.forEach($scope.currentUsersLists, function (value, key) {
								console.log('value: ' + JSON.stringify(value.directoryName) + ', key: ' + key);
				if (value.directoryName === newList.category) {
					done = true;
					var ref4 = new Firebase("https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/" + key + "/listIDs");
					var listIDs = $firebase(ref4).$asArray();
					listIDs.$add(id);
				}
			});
			if (!done) {
				var ref5 = new Firebase("https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/");
				var listToAdd = $firebase(ref5).$asArray();
				listToAdd.$add({
					directoryName: newList.category,
					listIDs: [
                        id
                    ]
				});
			}
			$state.go('app.editList');
		});
	};

	$scope.editComplete = function () {
		angular.forEach($scope.database.lists[$scope.selectedList].one.values, function (value, key) {
			if (value === '' && $scope.database.lists[$scope.selectedList].two.values[key] === '') {
				delete $scope.database.lists[$scope.selectedList].one.values[key];
				delete $scope.database.lists[$scope.selectedList].two.values[key];
			}
		});
		$scope.database.$save();
		var confirmPopup = $ionicPopup.confirm({
			title: '<b>Saved.</b>',
			template: 'Your list has been saved. Start practice now?',
			buttons: [{ //Array[Object] (optional). Buttons to place in the popup footer.
				text: 'Back to my lists',
				type: 'button-default',
				onTap: function (e) {
					$state.go('app.myLists');
					return true;
				}
  }, {
				text: 'Yes',
				type: 'button-positive',
				onTap: function (e) {
					// Returning a value will cause the promise to resolve with the given value.
					$state.go('app.practice2');
					return true;
				}
  }]
		});

	};

	$scope.settingsToggle = function (arg0, arg1) {
		//        console.log($scope.usersArray[$scope.userID] + ', ' + arg0 + ', ' + arg1);
		if (arg1 === 0) {
			sync.$asObject().users[$scope.userID]["uppercaseLowercase"] = arg0;
			sync.$asObject().$save();
		} else if (arg1 === 1) {
			sync.$asObject().users[$scope.userID]["accentsUmlauts"] = arg0;
			sync.$asObject().$save();
		} else {
			sync.$asObject().users[$scope.userID]["punctuation"] = arg0;
			sync.$asObject().$save();
		}
	};

	$scope.$watch('newList.category.directoryName', function (newVal, oldVal) {
		//		console.log('changed: ' + newVal);
	}, true);
	$scope.$watch('color', function (newVal, oldVal) {
		//		console.log('changed: ' + newVal);
	}, true);

	$scope.change = function (category) {
		if (category === 'new') {
			$ionicPopup.show({
				template: '<input type="text" ng-model="newList.category">',
				title: 'New category',
				subTitle: 'Add a new category to organize your lists',
				scope: $scope,
				buttons: [
					{
						text: 'Cancel'
                    },
					{
						text: '<b>Save</b>',
						type: 'button-positive',
						onTap: function (e) {
							if (!$scope.newList.category) {
								//don't allow the user to close unless he enters wifi password
								//								console.error('no category input given');
							} else {
								var directoryRef = new Firebase("https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/");
								var thisthing = $firebase(directoryRef).$asArray();
								thisthing.$add({
									directoryName: $scope.newList.category
								});
							}
						}
      },
    ]
			});
		}
	};

	//Get a random number for the practice mode
	var randomNumbered = false;
	$scope.$watch('database.lists[selectedList]', function (newValue, oldValue) {
		//		if (randomNumbered) {
		//			$scope.randomNumber = Math.floor((Math.random() * $scope.database.lists[$scope.selectedList].two.values.length));
		//			$scope.lengthThingy = $scope.database.lists[$scope.selectedList].two.values.length;
		//			randomNumbered = false;
		//		}
		//		randomNumbered = true;
	}, true);

	//  Camera on the left is tapped
	$scope.camera1 = function () {
		$scope.openModal();
		//submit the form which is triggered after the picture is taken
		//This function is triggered when the AJAX call has been completed
		$('#myForm').ajaxForm(function (data) {
			$scope.closeModal();
			//push every line of the returned data in the array
			var array = data.split("\n");
			$scope.database.lists[$scope.selectedList].one.values.splice(-1, 1);
			$.merge($scope.database.lists[$scope.selectedList].one.values, array);
		});
	};

	//  Camera on the right is tapped
	$scope.camera2 = function () {
		$scope.openModal();
		//submit the form which is triggered after the picture is taken
		//This function is triggered when the AJAX call has been completed
		$('#myForm').ajaxForm(function (data) {
			$scope.closeModal();
			//push every line of the returned data in the array
			var array = data.split("\n");
			$scope.database.lists[$scope.selectedList].two.values.splice(-1, 1);
			$.merge($scope.database.lists[$scope.selectedList].two.values, array);
		});
	};

	//Logout event
	$rootScope.$on("$firebaseSimpleopenModal:logout", function (event) {
		//clear the user object
		$scope.user = null;
		//clear the cookies
		window.cookies.clear();
	});
})