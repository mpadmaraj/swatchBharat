angular.module('starter.controllers', [])
    .controller('PhotoCtrl', function($scope, Camera,$location,OpenFB) {
        if(!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(function(pos) {
            geocoder = new google.maps.Geocoder();
            $scope.latlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
            geocoder.geocode({'latLng': $scope.latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $scope.city ="";
                    $scope.state="";
                    for(var i=0,result=results[0] ,len=results[0].address_components.length; i<len; i++) {
                        var ac = result.address_components[i];
                        if(ac.types.indexOf("locality") >= 0) $scope.city = ac.long_name;
//                        if(ac.types.indexOf("administrative_area_level_1") >= 0) $scope.state = ac.long_name;
                    }
/*
                    if($scope.city != '' && $scope.state != '') {
                        alert($scope.city);
                    }
*/
                }
            });

        });
        $scope.item = {};
  //      $scope.lastPhoto="http://images.indiatvnews.com/politicsnational/IndiaTv6ecb75_swachh1.jpg";
        $scope.showshare=true;
        $scope.share = function () {
            $scope.item.image=$scope.lastPhoto;
            //$location.path('/app/person/me/feed');
            OpenFB.post('/swatcchhbharat/feed', $scope.item)
                .success(function () {
                    $scope.status = "This item has been shared.";
                    $scope.showshare=false;
                    $scope.lastPhoto=null;
                    $location.path('/app/person/me/feed');
                })
                .error(function(data) {
                    alert(data.error.message);
                });
        };
        $scope.getPhoto = function() {
            Camera.getPicture().then(function(imageURI) {
                console.log(imageURI);
                $scope.lastPhoto = imageURI;
                $scope.showshare=true;
            }, function(err) {
                console.err(err);
            }, {
                quality: 75,
                targetWidth: 320,
                targetHeight: 320,
                saveToPhotoAlbum: false
            });
        };

    })


    .controller('AppCtrl', function ($scope, $state, OpenFB) {

        $scope.logout = function () {
            OpenFB.logout();
            $state.go('app.login');
        };

        $scope.revokePermissions = function () {
            OpenFB.revokePermissions().then(
                function () {
                    $state.go('app.login');
                },
                function () {
                    alert('Revoke permissions failed');
                });
        };

    })

    .controller('LoginCtrl', function ($scope, $location, OpenFB) {
        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {
                    $location.path('/app/photo');
                },
                function () {
                    alert('OpenFB login failed');
                });
        };

    })

    .controller('MutualFriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/mutualfriends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('FeedCtrl', function ($scope, $stateParams, OpenFB, $ionicLoading) {

        $scope.show = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Loading feed...'
            });
        };
        $scope.hide = function(){
            $scope.loading.hide();
        };

        function loadFeed() {
            $scope.show();
            //+ $stateParams.personId + '/home'
            OpenFB.get('/swatcchhbharat/feed' , {limit: 30})
                .success(function (result) {
                    $scope.hide();
                    $scope.items = result.data;
                    // Used with pull-to-refresh
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .error(function(data) {
                    $scope.hide();
                    alert(data.error.message);
                });
        }

        $scope.doRefresh = loadFeed;

        loadFeed();

    })
;
