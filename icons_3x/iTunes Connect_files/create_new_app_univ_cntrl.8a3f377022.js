'use strict';
define(['sbl!app'], function (itcApp) {

    var createAppControllerUniversal = function ($scope, createAppService, validateScreenedWordsService, $location, $filter) {
        //cache refresh 8252016
        $scope.infoKeys = {};
      	$scope.createAppDataLoaded = false;
      	$scope.bundleIsWildcard = false;
        $scope.createAppDataSaving = false;
        $scope.createAppModal = {
          'clearValidation': false
        }
        $scope.availablePlatformsForCreation = {};
        $scope.atLeastOnePlatformSelected = false;
        $scope.iosString = "ios";
        $scope.osxString = "osx";
        $scope.appletvosString = "appletvos";
        $scope.appletvtemplate = "appletvtemplate";

        $scope.$on('parentScopeLoaded',function(event,data){
          $scope.storePlatformIOS = $scope.referenceData.storePlatforms.indexOf("ios") >= 0 ? true : false;
          $scope.storePlatformMac = $scope.referenceData.storePlatforms.indexOf("osx") >= 0 ? true : false;
 
          $scope.storePlatformTVOS = $scope.referenceData.storePlatforms.indexOf("appletvos") >= 0 ? true : false;
          $scope.storePlatformTVTemplate = $scope.referenceData.storePlatforms.indexOf("appletvtemplate") >= 0 ? true : false;
          $scope.checkModalWidth();
        });

        $scope.modalWidth = "460px"; //default
        $scope.checkModalWidth = function() {
          var wideModalArray = ['pt-br', 'pt-pt', 'fr-fr', 'fr-ca', 'ja-jp','ja', 'ru-ru', 'es-es', 'it-it', 'it'];
          if (wideModalArray.indexOf($scope.l10n.interpolate('ITC.current.locale.metadata').toLowerCase()) > 0) {
            $scope.modalWidth = "700px";
          }
        }


      	$scope.loadCreateAppDetails = function() {
          $scope.createAppDataLoaded = false;
          $scope.infoKeys = {};
          $scope.createAppModal.clearValidation = true;
          $scope.errorText = "";
          $scope.showError = false;
          $scope.bundleIsWildcard = false;
          $scope.bundleIdComposite = "";


      		createAppService.loadV2($scope.modalcontent.appType).then(function(data){
      			$scope.createAppDetails = data.data;
      			$scope.setUpModalValues();
      		});
      	}
      	$scope.setUpModalValues = function(updatedNewAppInfo) {
          $scope.translateEnabledPlatformsToEnabledAvailablePlatforms();

      		if (updatedNewAppInfo) {
      			$scope.createAppDetails = updatedNewAppInfo;
      		}
          else {
            $scope.availablePlatformsForCreation = {};  
          }

          //confirm we have bundle ids!
          if (Object.keys($scope.createAppDetails.bundleIds).length) {
            $scope.noBundleIdsAvailable = false;
            $scope.bundleIdList = [];
            angular.forEach($scope.createAppDetails.bundleIds,function(value,key){
              var objToAdd = {
                'key':value,
                'value':key
              }
              $scope.bundleIdList.push(objToAdd);
            });
            $scope.bundleIdList.sort(function(a,b){
              if (a.value < b.value) {
                return -1;
              }
              if (a.value > b.value) {
                return 1;
              }
              // names must be equal
              return 0;
            });
          } else {
            $scope.noBundleIdsAvailable = true;
            $scope.modalcontent.showCreateNewAppModal = false;
            $scope.modalcontent.showCreateNewAppModalNoIds = true;
          }

          //which string type?
          if ($scope.createAppDetails.initialPlatform === $scope.iosString) {
            $scope.createBundleIdText = $scope.l10n.interpolate('ITC.apps.createNewApp.bundleId.InfoText');
            $scope.noBundleIdText = $scope.l10n.interpolate('ITC.apps.createNewApp.noBundleIdiOS');
          } else if ($scope.createAppDetails.initialPlatform === $scope.osxString) {
            $scope.createBundleIdText = $scope.l10n.interpolate('ITC.apps.createNewApp.bundleId.InfoTextMac');
            $scope.noBundleIdText = $scope.l10n.interpolate('ITC.apps.createNewApp.noBundleIdMac');
          }

          //if siloing - add "all" option
          if ($scope.createAppDetails.iTunesConnectUsers !== undefined) {
            //sort users
            $scope.sortedUsers = $filter('orderBy')($scope.createAppDetails.iTunesConnectUsers.availableUsers, function(availUser){
                if (availUser.firstName !== null && availUser.lastName !== null && availUser.firstName !== "" && availUser.lastName !== "") {
                    if ($scope.user.isLocaleNameReversed) {
                        return availUser.lastName + " " + availUser.firstName;
                    } else {
                        return availUser.firstName + " " + availUser.lastName;
                    }
                } else {
                    return availUser.username;
                }
            });
            //$scope.createAppDetails.iTunesConnectUsers.availableUsers = sortedUsers;
            angular.forEach($scope.sortedUsers,function(user,key){
                user.group = 1;
            });
            //look for "all"
            var allOption = _.findWhere($scope.sortedUsers,{'dsId':"all"});
            if (allOption !== undefined && allOption !== null) {
              allOption.group = 0;
            } else {
              var addAllOption = { dsId: "all", firstName: "", lastName: "", roles: [], username: $scope.l10n.interpolate('ITC.MyApps.CreateNewAppModal.LimitUserAccess.Placeholder'), displayName:$scope.l10n.interpolate('ITC.MyApps.CreateNewAppModal.LimitUserAccess.Placeholder'), group: 0};
              $scope.sortedUsers.unshift(addAllOption);
            }
            //copy users from "sorted users" into temp holding for createAppDetails.iTunesConnectUsers.grantedUsers
            $scope.grantedUsersTemp = {data:[]};
            angular.forEach($scope.createAppDetails.iTunesConnectUsers.grantedUsers,function(userInfo,key){
                var userInfoCopy = _.findWhere($scope.sortedUsers, {'username': userInfo.username});
                userInfoCopy.group = 1;
                $scope.grantedUsersTemp.data.push(userInfoCopy);
            });

            
          }
          
    			$scope.origAppDetails = angular.copy($scope.createAppDetails);
    			$scope.createAppDataLoaded = true;
      	}

        $scope.translateEnabledPlatformsToEnabledAvailablePlatforms = function() {
          if ($scope.createAppDetails.enabledPlatformsForCreation.value.indexOf("appletvtemplate")) $scope.availablePlatformsForCreation.appletvtemplate == true;
          if ($scope.createAppDetails.enabledPlatformsForCreation.value.indexOf("appletvos")) $scope.availablePlatformsForCreation.appletvos == true;
          if ($scope.createAppDetails.enabledPlatformsForCreation.value.indexOf($scope.iosString)) $scope.availablePlatformsForCreation.ios == true;
        }

        $scope.translateAvailablePlatformsToEnabledPlatforms = function() {
          $scope.createAppDetails.enabledPlatformsForCreation.value = [];

          if ($scope.createAppDetails.initialPlatform === $scope.iosString) {

            if ($scope.availablePlatformsForCreation.appletvtemplate == true) $scope.createAppDetails.enabledPlatformsForCreation.value.push($scope.appletvtemplate);
            if ($scope.availablePlatformsForCreation.appletvos == true) $scope.createAppDetails.enabledPlatformsForCreation.value.push($scope.appletvosString);
            if ($scope.availablePlatformsForCreation.ios == true) $scope.createAppDetails.enabledPlatformsForCreation.value.push($scope.iosString);


          }
          else if ($scope.createAppDetails.initialPlatform === $scope.osxString) {
            $scope.createAppDetails.enabledPlatformsForCreation.value.push($scope.osxString);
          }
        }

        $scope.checkAtLeastOnePlatformSelected = function() {
          if ($scope.availablePlatformsForCreation.ios == true ||
              $scope.availablePlatformsForCreation.appletvos == true ||
              $scope.availablePlatformsForCreation.appletvtemplate == true) {
            $scope.atLeastOnePlatformSelected = true;
          }
          else {
            $scope.atLeastOnePlatformSelected = false;
          }
        }

      	$scope.$watch('parentScopeLoaded',function() {
      		if ($scope.referenceData !== undefined && $scope.referenceData !== null) {
                $scope.languages = _.map($scope.referenceData.detailLocales,function(locAsKey){
                  var language = $scope.l10n.interpolate('ITC.locale.'+locAsKey.toLowerCase());
                  var arrayToRet = [locAsKey,language];
                  return arrayToRet;
                });
                $scope.languages = _.sortBy($scope.languages,function(lang){
                    return lang[1];
                });
      		}
      	});

      	$scope.$watch('modalcontent.showCreateNewAppModal',function(val){
        	if (val && $scope.modalcontent.appType !== undefined && $scope.modalcontent.appType !== null) {
                if ($scope.modalcontent.appType == $scope.iosString) {
                    $scope.modalTitle = $scope.l10n['ITC.apps.createNewApp.modalTitleApp'];
                } else {
                    $scope.modalTitle = $scope.l10n['ITC.apps.createNewApp.modalTitleMac'];
                }
        		$scope.loadCreateAppDetails();
        	}
        });

    	$scope.checkBundleType = function() {
    		if ($scope.createAppDetails.bundleId.value !== undefined && $scope.createAppDetails.bundleId.value !== null && $scope.createAppDetails.bundleId.value !== "") {
    			if ($scope.createAppDetails.bundleId.value.match(/.*\*/)) {
    				$scope.bundleIsWildcard = true;
    				$scope.createAppDetails.bundleIdSuffix.value = "";
    			} else {
    				$scope.bundleIsWildcard = false;
    			}
    		} else {
    			$scope.bundleIsWildcard = false;
    		}
    	}

    	$scope.$watch('createAppDetails.bundleIdSuffix.value',function(val){
    		if ($scope.createAppDetails !== undefined && $scope.createAppDetails !== null && $scope.createAppDetails.bundleId.value !== undefined && $scope.createAppDetails.bundleId.value !== null && $scope.createAppDetails.bundleIdSuffix !== null && $scope.createAppDetails.bundleIdSuffix.value !== undefined && $scope.createAppDetails.bundleIdSuffix.value !== null) {
  	      		$scope.bundleIdComposite = $scope.createAppDetails.bundleId.value.replace("*","") + $scope.createAppDetails.bundleIdSuffix.value;
  	      	} else {
              $scope.bundleIdComposite = "";
  	      	}
    	});

        $scope.saveApp = function() {
            $scope.translateAvailablePlatformsToEnabledPlatforms();
            $scope.createAppDataSaving = true;
            if ($scope.createAppDetails.iTunesConnectUsers !== undefined && $scope.grantedUsersTemp !== undefined) {
              $scope.createAppDetails.iTunesConnectUsers.grantedUsers = angular.copy($scope.grantedUsersTemp.data);
            }
            

            createAppService.createV2($scope.modalcontent.appType,$scope.createAppDetails).then(function(data){
                if (data.status == "500") {
                    $scope.createAppDataSaving = false;
                    $scope.showError = true;
                    $scope.errorText = [];
                    $scope.errorText.push($scope.l10n.interpolate("ITC.apps.createNewApp.problemCreatingApp"));
                } else {
                    if(data.data.adamId === null) {
                        $scope.setUpModalValues(data.data);
                        $scope.createAppDataSaving = false;
                        $scope.showError = true;
                        $scope.errorText = $scope.createAppDetails.sectionErrorKeys;
                    } else {
                        $scope.modalcontent.showCreateNewAppModal = false;
                        $scope.createAppDataSaving = false;
                        $location.path('/app/'+data.data.adamId);
                    }
                }
            });
        };

        /***************************************************
        Validate Screened words on blur
        ************************************************** */
        $scope.checkScreenedWords = function ($event, field, fieldName) {  
            if (_.isNull($scope.createAppDetails.name)) return;

            if (fieldName == undefined || fieldName == null) fieldName = field;
            
            var text = $scope.createAppDetails.name.value;

            validateScreenedWordsService.validate(text, fieldName, $scope.adamId).then(function(data){
                $scope.infoKeys.name = data;
            });
        }

        /***************************************************
        SILOING
        ************************************************** */
        $scope.showUserList = function() {
          if (deep($scope.createAppDetails.iTunesConnectUsers.availableUsers) && $scope.createAppDetails.iTunesConnectUsers.availableUsers.length > 0) {
            return true;
          } else {
            return false;
          }    
        }
        $scope.getDisplayName = function(user) {
            if (user.firstName !== null && user.lastName !== null && user.firstName !== "" && user.lastName !== "") {
                if ($scope.user.isLocaleNameReversed) {
                    return user.lastName + " " + user.firstName;
                } else {
                    return user.firstName + " " + user.lastName;
                }
            } else {
                return user.username;
            }
        }
        $scope.updateUserSelections = function() {
            if ($scope.createAppDetails !== undefined && $scope.createAppDetails !== null) {
                var containsAll = _.findWhere($scope.grantedUsersTemp.data,{'dsId':'all'})
                if (containsAll !== undefined) {
                    $scope.grantedUsersTemp.data = [];
                    $scope.createAppDetails.iTunesConnectUsers.grantedAllUsers = true;
                } else {
                    $scope.createAppDetails.iTunesConnectUsers.grantedAllUsers = false;
                }
            }
        }


    }
	itcApp.register.controller('createAppControllerUniversal', ['$scope', 'createAppService', 'validateScreenedWordsService', '$location', '$filter', createAppControllerUniversal]);
    
});