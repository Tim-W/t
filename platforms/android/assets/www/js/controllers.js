angular.module('starter.controllers', ['firebase', 'ngCordova'])

.controller('PlaylistsCtrl', function ($rootScope, $timeout, $scope, $firebase, $ionicActionSheet, $ionicPopup, $state, $ionicNavBarDelegate, $cordovaCapture, $ionicModal, $cordovaCamera, $ionicLoading, $firebaseSimpleLogin, $http) {
    $scope.maxIndex = 0;
    $scope.newList = {};
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
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

    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.myLists' || toState.name == 'app.login2') {
                $ionicNavBarDelegate.showBackButton(false);
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

    $scope.fb = sync.$asObject();

    var dataRef = new Firebase("https://te-asy.firebaseio.com/");
    $scope.loginObj = $firebaseSimpleLogin(dataRef);

    $scope.loginObj.$getCurrentUser().then(function (data) {
        if (data === null) {
            $state.go('app.login2');
        }

        console.log(data)
        $scope.userID = data.uid;
    });

    console.log($scope.userID + $scope.usersArray);

    var oneRef = new Firebase("https://te-asy.firebaseio.com/lists/" + $scope.selectedList + "/");
    $scope.oneRef = $firebase(oneRef).$asObject();
    $scope.$watch('oneRef.one.values', function (oldValue, newValue) {
        console.log(oldValue);
        console.log(newValue);
        //        $scope.fb.lists[$scope.selectedList].one.values.length = $scope.fb.lists[$scope.selectedList].two.values.length;
    }, true);

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
            console.log("Logged in as: ", user.uid);
            var id = user.uid;
            if (!$scope.fb.users[id]) {
                console.log('nope');
                $scope.fb.users[user.uid] = user;

                $scope.fb.$save();
            } else {
                console.log('yep');
            }
            $state.go('app.myLists');
        }, function (error) {
            console.error("Login failed: ", error);
        });
    };

    $scope.logoutNow = function () {
        $state.go('app.login2');
        $scope.loginObj.$logout();
        console.log('logging out...');
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
        console.log($scope.fb.lists[$scope.selectedList].one.values.length);
        if (!privilege) {
            if ($scope.fb.lists[$scope.selectedList].two.values[$scope.randomNumber] === word) {
                if ($scope.fb.lists[$scope.selectedList].one.values.length === 0) {
                    $ionicPopup.alert({
                        title: 'Completed',
                        template: 'Congratulations, you have completed your practice.<br>You had <b>' + document.querySelector("#rightAnswers").innerText + '</b> right answers and <b>' + document.querySelector("#wrongAnswers").innerText + '</b> wrong answers.',
                        okText: 'Finish'
                    }).then(function (res) {
                        $state.go('app.myLists');
                    });
                } else {
                    console.log('correct, ' + $scope.randomNumber);
                    delete $scope.fb.lists[$scope.selectedList].one.values[0];
                    var stuff = Number(document.querySelector("#rightAnswers").innerText);
                    stuff += 1;
                    document.querySelector("#progression").style.width = $scope.fb.lists[$scope.selectedList].one.values.length / $scope.lengthThingy * 100 + '%'
                    document.querySelector("#rightAnswers").innerText = stuff;
                    $scope.randomNumber = Math.floor((Math.random() * $scope.fb.lists[$scope.selectedList].two.values.length));
                    document.querySelector("#answer").value = '';
                    document.querySelector("#notright").innerHTML = "";
                }
            } else {
                document.querySelector("#notright").innerHTML = "That doesn't seem right... the answer is: <b>" + $scope.fb.lists[$scope.selectedList].two.values[$scope.randomNumber] + "</b>";
                document.querySelector("#answer").style.background = "#C00000";
                privilege = true;
                var stuff = Number(document.querySelector("#wrongAnswers").innerText);
                stuff += 1;
                document.querySelector("#wrongAnswers").innerText = stuff;
                console.log('false: ' + $scope.fb.lists[$scope.selectedList].two.values[$scope.randomNumber] + ', ' + word);
            }
        } else {
            privilege = false;
            document.querySelector("#notright").innerHTML = "";
            document.querySelector("#answer").style.background = "white";
            document.querySelector("#answer").value = '';
            $scope.randomNumber = Math.floor((Math.random() * $scope.fb.lists[$scope.selectedList].two.values.length));
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
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };

    //    $scope.dirs = $scope.fb;

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
            titleText: 'Selected list: <b>' + $scope.fb.lists[$scope.selectedList].title + '</b>',
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
            template: 'Are you sure you want to delete list <b>' + $scope.fb.lists[$scope.selectedList].title + '</b>?',
            buttons: [{ //Array[Object] (optional). Buttons to place in the popup footer.
                text: 'Cancel',
                type: 'button-default',
                onTap: function (e) {}
  }, {
                text: 'Delete',
                type: 'button-assertive',
                onTap: function (e) {
                    var i = 0;
                    angular.forEach($scope.usersArray[$scope.userID].lists, function (value, key) {
                        console.log(key);
                        var ref6URL = "https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/" + key + "/listIDs/";
                        i = 0;
                        angular.forEach(value.listIDs, function (value, key) {
                            console.log(value + ', ' + key);
                            if (value === $scope.selectedList) {
                                console.log(ref6URL + key);
                                var ref6 = new Firebase(ref6URL + key);
                                var stuff2 = $firebase(ref6);
                                //                                console.log(JSON.stringify(stuff2));
                                //                                console.log('stuff2: ' + stuff2);
                                //                                delete stuff2[key]
                                stuff2.$remove();
                            }
                            i++;
                        });
                    });
                    //                    var ref = new Firebase("https://te-asy.firebaseio.com/lists/" + $scope.selectedList);
                    //                    var stuff2 = $firebase(ref);
                    //                    stuff2.$remove();
                    //                    console.log($scope.selectedList);
                    //                    stuff2.$remove($scope.selectedList);
                    // Returning a value will cause the promise to resolve with the given value.
                    return true;
                }
  }]
        });
    };

    $scope.practice3 = function () {
        $state.go('app.practice3');
    };

    console.log($scope.maxIndex);

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
            console.log("added record with id " + id);

            var ListForUser = {
                directoryName: newList.category,
                id: id
            };

            var done = false;

            var refForUsersShit = new Firebase("https://te-asy.firebaseio.com/users/" + $scope.userID + "/lists/");
            var usersShit = $firebase(refForUsersShit).$asArray();

            angular.forEach(usersShit, function (value, key) {
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
        $scope.fb.$save();
        var confirmPopup = $ionicPopup.confirm({
            title: 'Start practice?',
            template: 'Your list has been saved. Start practice now?',
            buttons: [{ //Array[Object] (optional). Buttons to place in the popup footer.
                text: 'Cancel',
                type: 'button-default',
                onTap: function (e) {
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

    $scope.$watch('newList.category.directoryName', function (newVal, oldVal) {
        console.log('changed: ' + newVal);
    }, true);
    $scope.$watch('color', function (newVal, oldVal) {
        console.log('changed: ' + newVal);
    }, true);

    $scope.change = function (category) {
        if (category === 'new') {
            $ionicPopup.show({
                template: '<input type="text" ng-model="newList.category">',
                title: 'Enter Wi-Fi Password',
                subTitle: 'Please use normal things',
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
                                console.error('no category input given');
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

    var randomNumbered = false;
    $scope.$watch('fb.lists[selectedList]', function (newValue, oldValue) {
        //        console.log(JSON.stringify(newValue) + ', ' + JSON.stringify(oldValue));
        if (randomNumbered) {
            $scope.randomNumber = Math.floor((Math.random() * $scope.fb.lists[$scope.selectedList].two.values.length));
            $scope.lengthThingy = $scope.fb.lists[$scope.selectedList].two.values.length;
            randomNumbered = false;
        }
        randomNumbered = true;
    }, true);

    $scope.camera1 = function () {
        $scope.login();
//        var options = {
//            quality: 75,
//            destinationType: Camera.DestinationType.DATA_URL,
//            sourceType: Camera.PictureSourceType.CAMERA,
//            allowEdit: true,
//            encodingType: Camera.EncodingType.JPEG,
//            targetWidth: 1000,
//            targetHeight: 1000,
//            popoverOptions: CameraPopoverOptions,
//            saveToPhotoAlbum: false
//        };
//        $cordovaCamera.getPicture(options).then(function (imageData) {
//            $scope.loading = '';
//            $scope.imageData = imageData;
//            $scope.login();
//
//            //            var img = new Image();
//            //            img.src = 'data:image/png;base64,'+imageData;
//            //
//            //            console.log(img.width + ', ' + img.height); 
//            //            
//            //            var context = document.createElement('canvas').getContext('2d');
//            //            context.drawImage(img, 0, 0);
//            //
//            //            var imageData = context.getImageData(0, 0, img.width, img.height);
//            //
//            //            var string = OCRAD(imageData);
//            //            alert(string);
//
//            var $img = document.querySelector("#img");
//
//            console.log('getting pic...:' + $img.width + ', ' + $img.height);
//
//            $img.onload = function () {
//                console.log('1:' + $img.width + ', ' + $img.height);
//                var context = document.createElement('canvas').getContext('2d');
//                console.log('2:' + $img.width + ', ' + $img.height);
//                context.drawImage($img, 0, 0);
//                console.log('3:' + $img.width + ', ' + $img.height);
//
//                var imageData = context.getImageData(0, 0, 100, 100);
//                console.log('4:' + $img.width + ', ' + $img.height);
//
//                var string = OCRAD(imageData);
//                console.log('5:' + $img.width + ', ' + $img.height);
//                console.log(string);
//            };
//
//
//        }, function (err) {
//            $scope.loading = '';
//            // An error occured. Show a message to the user
//        });
    };
//    $http('http://api.ocrapiservice.com/1.0/rest/ocr', {
//        language: 'en',
//        apikey: 'awBpy5YV3u'
//        //            image: '/a.png',
//        //            headers : {
//        //                'Content-type': 'multipart/form-data'
//        //            }
//    });

//    $http({
//        method: 'POST',
//        url: url,
//        data: $.param({
//            language: "en",
//            apikey: "awBpy5YV3u",
//            image: "a.png"
//        }),
//        headers: {
//            'Content-Type': 'image/png'
//        }
//    });
    //        .then(function (data) {
    //            alert('woot' + data);
    //        });

    //        < form action = "http://api.ocrapiservice.com/1.0/rest/ocr"
    //        method = "POST"
    //        enctype = "multipart/form-data" >
    //            < input type = "hidden"
    //        name = "MAX_FILE_SIZE"
    //        value = "100000000" / >
    //            Choose a file to upload: < input name = "image"
    //        type = "file" / >
    //            < br / >
    //            < input type = "text"
    //        name = "language"
    //        value = "en" / >
    //            < input type = "text"
    //        name = "apikey"
    //        value = "QdgjiDjWjK" / >
    //
    //        < input type = "submit"
    //        value = "Upload File" / >
    //            < /form> 
})

.controller('PlaylistCtrl', function ($scope, $stateParams) {});