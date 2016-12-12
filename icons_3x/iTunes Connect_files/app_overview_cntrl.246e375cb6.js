'use strict';
define(['sbl!app'], function (itcApp) {
    var appOverviewController = function($scope,univPurchaseService,$stateParams,$state,$rootScope,$window,manageUsersService) {

        $rootScope.$on('$stateChangeSuccess', function(event, next, toParams, current, fromParams) {
            if (next.name.indexOf("app_overview") < 0) { //leaving the app page - reset app list...
                $rootScope.headerConfig.appSwitcherData.apps = [];
            }
        });


        window.scope = $scope;
        window.root = $rootScope;
        
        $scope.adamId = $stateParams.adamId || undefined;
        $scope.state = $state;

        univPurchaseService.appOverviewInfoDataSource.data = null;
        univPurchaseService.submitSummaryDataSource.data = null;
        $rootScope.isReady = false;
        $scope.parentscopeloaded = false;
        $scope.overviewloaded = false;
        $scope.submitSummaryLoaded = false;
        $scope.appListingLoaded = false;
        $scope.headerConfigReady = false;
        $scope.overviewItems = {};

        $scope.setIsReady = function() {          

            if ($scope.parentscopeloaded && $scope.overviewloaded && $scope.submitSummaryLoaded && $scope.appListingLoaded && $scope.headerConfigReady) {
                $rootScope.headerConfig.appSwitcherData.apps = $scope.overviewItems.appListArray;
                $rootScope.headerConfig.appSwitcherData.application = $scope.overviewItems.currentapp;
                $rootScope.isReady = true;
                $scope.$broadcast("AppOverviewLoaded");
                $rootScope.wrapperclass = "pane-layout-page-wrapper";
            } else {
                $rootScope.isReady = false;
            }
        }
    
        $scope.loadOverview = function (){  
            univPurchaseService.appOverviewInfo($stateParams.adamId).then(function(data){
                if (data.status == "500") {
                    window.location = global_itc_path + "/wa/defaultError";
                } else {
                    $scope.overviewloaded = true;
                    $scope.setUpPageData(data.data);
                    univPurchaseService.appOverviewInfoDataSource.data = data.data;
                    $scope.$broadcast("overviewLoaded");
                    $scope.setIsReady();
                }               
            });
        }
        $scope.loadSubmitSummary = function() {
            univPurchaseService.submitSummary($stateParams.adamId).then(function(data){
                if (data.status == "500") {
                    window.location = global_itc_path + "/wa/defaultError";
                } else {
                    $scope.$broadcast("submitSummaryLoaded");
                    $scope.submitSummaryLoaded = true;
                    univPurchaseService.submitSummaryDataSource.data = data.data;
                    $scope.setIsReady();
                }               
            });
        }
        $scope.setUpPageData = function(data) {
            $scope.appOverviewInfo = data;
            $scope.showTestFlight = _.indexOf($scope.appOverviewInfo.features,'PRERELEASE') >= 0 ? true: false;
            $scope.stateArray = $state.current.name.split('.');
            $scope.showAnalyticsLink = _.indexOf($scope.appOverviewInfo.features,'ANALYTICS') >= 0 ? true: false;
            $scope.showSalesTrendsLink = _.indexOf($scope.appOverviewInfo.features,'SALES_AND_TRENDS') >= 0 ? true: false;

            $scope.createHeaderIcon();
            $scope.checkForAppIssues();
            $scope.parsePlatformsForApp();
        }
        
        $scope.checkForAppIssues = function() {
            // Used by child views to determine if there are issues for a given platform
            $scope.appIssues = { ios: 0, appletvos: 0, appletvtemplate: 0 };
            _.each( $scope.appOverviewInfo.platforms, function(p) {
                if (p.inFlightVersion && p.inFlightVersion.issuesCount) {
                    $scope.appIssues[p.platformString] = parseInt( p.inFlightVersion.issuesCount, 10 );
                }
            });
            $scope.appIssues.total = $scope.appIssues.ios + $scope.appIssues.appletvos + $scope.appIssues.appletvtemplate;
        };
        
        var platformSortOrder = {
            ios: 3,
            osx: 2,
            appletvos: 1,
            appletvtemplate: 0
        }
        
        // We need a list of platforms so we can hide/show things in TF/Activity area
        $scope.parsePlatformsForApp = function() {
            $scope.platformsForApp = [];
            _.each( $scope.appOverviewInfo.platforms, function(p) {
                if (p.platformString && typeof p.platformString === 'string') {
                    $scope.platformsForApp.push( p.platformString );
                }
            })
            if ($scope.platformsForApp.length > 1) {
                $scope.platformsForApp.sort( function(a,b) {
                    var A = platformSortOrder[a] || -1,
                        B = platformSortOrder[b] || -1;
                    if (A > B) return 1;
                    if (A < B) return -1;
                    return 0;
                }).reverse();
            }
        };
        
        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState) {
                $scope.stateArray = toState.name.split('.');
            }
        })

        $scope.getPrimaryLocaleName = function() {
            if ($scope.appOverviewInfo !== undefined) {
                var primaryLocInfo = _.filter($scope.appOverviewInfo.localizedMetadata,function(locMeta){
                    if (locMeta.localeCode.toLowerCase() == $scope.appOverviewInfo.primaryLocaleCode.toLowerCase()) {
                        return true;
                    }
                });
                return primaryLocInfo[0].name;
            }
        }

        $scope.isActivityTabSelected = function() {
            if (!$scope.stateArray) {
                return false;
            }
            return $scope.stateArray[1] === 'activity' ||
                $scope.stateArray[1] === 'resolution_center_ver' ||
                $scope.stateArray[1] === 'resolution_center';

                // Resolution Center isn't really under 'activity' but we're going to pretend it is.
        }

        $scope.createHeaderIcon = function() {
            if ($scope.appOverviewInfo !== undefined) {
                
                var iosPlatform = _.findWhere($scope.appOverviewInfo.platforms,{'platformString':'ios'});
                var tvosPlatform = _.findWhere($scope.appOverviewInfo.platforms,{'platformString':'appletvos'});
                var tvchannelPlatform = _.findWhere($scope.appOverviewInfo.platforms,{'platformString':'appletvtemplate'});
                var osxPlatform = _.findWhere($scope.appOverviewInfo.platforms,{'platformString':'osx'});

                //look for devlierable version's icons in this order: iOS -> OSX -> tvOS -> tvChannel
                $scope.appIconUrl;
                $scope.appleTVStyle = false;
                if (iosPlatform !== undefined && iosPlatform.deliverableVersion !== null && iosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = iosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
                } else if (osxPlatform !== undefined && osxPlatform.deliverableVersion !== null && osxPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = osxPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
                } else if (tvosPlatform !== undefined && tvosPlatform.deliverableVersion !== null && tvosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = tvosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
                    $scope.appleTVStyle = true;
                } else if (tvchannelPlatform !== undefined && tvchannelPlatform.deliverableVersion !== null && tvchannelPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = tvchannelPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
                    $scope.appleTVStyle = true;
                } else if (iosPlatform !== undefined && iosPlatform.inFlightVersion !== null && iosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = iosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
                } else if (osxPlatform !== undefined && osxPlatform.inFlightVersion !== null && osxPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = osxPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
                } else if (tvosPlatform !== undefined && tvosPlatform.inFlightVersion !== null && tvosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = tvosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
                    $scope.appleTVStyle = true;
                } else if (tvchannelPlatform !== undefined && tvchannelPlatform.inFlightVersion !== null && tvchannelPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
                    $scope.appIconUrl = tvchannelPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
                    $scope.appleTVStyle = true;
                } else {
                    if (iosPlatform !== undefined || osxPlatform !== undefined) {
                        $scope.appleTVStyle = false;
                    } else {
                        $scope.appleTVStyle = true;
                    }
                    $scope.appIconUrl = null;
                }
                
                // Supply the app icon to DOM using ngStyle, to avoid firing a request for the background-image before controller has executed
                if ( $scope.appIconUrl ) $scope.appIconBackgroundStyle = { 'background-image': 'url('+$scope.appIconUrl+')' };
            }
        }

        $scope.checkShouldShowTour = function() {
            var universalIntroCount;

            if (window.hasStorage) {
                universalIntroCount = localStorage.getItem("universalIntroCount");
            } else {
                universalIntroCount = $rootScope.storageitems.universalIntroCount;
            }

            if ($scope.user.userFeatures.indexOf('universalIntroComplete') >= 0) {
                $scope.shouldShowTour = false;
            } else if (universalIntroCount !== null && parseInt(universalIntroCount) > 20) {
                $scope.dismissTour();
                $scope.shouldShowTour = false;
            } else if (universalIntroCount === null) {
                if (window.hasStorage) {
                    localStorage.setItem("universalIntroCount", "1");
                } else {
                    $rootScope.storageitems.universalIntroCount = "1";
                }
                $scope.shouldShowTour = true;
            } else {
                var count = parseInt(universalIntroCount)+1;
                //localStorage.setItem("universalIntroCount", count+"");
                if (window.hasStorage) {
                    localStorage.setItem("universalIntroCount", count+"");
                } else {
                    $rootScope.storageitems.universalIntroCount = (count+"");
                }
                $scope.shouldShowTour = true;
            }
        }
        $scope.dismissTour = function() {
            $scope.shouldShowTour = false;
            $scope.user.userFeatures.push('universalIntroComplete');
            univPurchaseService.hasSeenUniversalIntro().then(function(data) {
            });
        }
        $scope.infoPageMessageClicked = function(e) {
            var link = e.target;
            if (link.id === "launchIntro") {
                $window.open($scope.referenceData.universalIntroUrl,'_blank','menubar=no,location=no,resizable=no,scrollbars=yes,status=no,width=800,height=640');
            }
        };
        $scope.getAppListing = function() {
            manageUsersService.getAppIndex().then(function(data){
                $scope.overviewItems.appListing = data.data.softwares;
                //sort main app list
                $scope.overviewItems.appListing.sort(function(a,b){
                    return a.appName.toLowerCase().localeCompare(b.appName.toLowerCase());
                });

                //maniuplate for itc app switcher module...
                $scope.overviewItems.appListArray = [];

                var cancelWaitForLoc = $scope.$watch('parentscopeloaded',function(val){
                    if (val) {
                         angular.forEach($scope.overviewItems.appListing,function(value,key){
                            var iconTypeValue = "iOS";
                            if (value.iconPlatform === "AppleTVOS") {
                                iconTypeValue = "tvOS";
                            }
                            var object = {
                                id: value.adamId,
                                name: value.appName,
                                assetToken: "",
                                imageUrl: value.largeIconUrl,
                                iconType: iconTypeValue
                            }
                            if (value.adamId === $scope.adamId) {
                                $scope.overviewItems.currentapp = object;
                            } else {
                                var dup = _.where($scope.overviewItems.appListing,{'appName':value.appName});
                                if (dup !== undefined && dup.length > 1) {
                                    var platformList = "";
                                    angular.forEach(value.platforms,function(platform,key) {
                                        if (key > 0) {
                                            platformList += ", ";
                                        }
                                        platformList += scope.l10n.interpolate('ITC.platformForDropdowns.'+ platform.toLowerCase());
                                    });
                                    var platformString = " <span class='platformType'>(" + platformList + ")</span>";
                                    object.name = object.name + platformString
                                }
                                $scope.overviewItems.appListArray.push(object);
                            }
                        });
                        $scope.appListingLoaded = true;
                        $scope.setIsReady();
                        cancelWaitForLoc();
                    }
                });
                
            });
        }

        $scope.$on('hideAppOverview',function(event,data) {
            $scope.hideAppOverview = data;
        });

        //need both - one for reload - one for when navigating to this page...
        $scope.$on('pageIsLoaded',function(event,data){
            $scope.headerConfigReady = true;
            $scope.setIsReady();
        });
        $rootScope.$watch('headerConfig',function(newval,oldval){
            if (newval || oldval) {
                $scope.headerConfigReady = true;
                $scope.setIsReady();
            }
        });

        $scope.$on('parentScopeLoaded',function(event,data){

            $scope.mainNavCurrentKey = 'ITC.AppVersion.MainNav.Versions';
            $rootScope.currentPage = $scope.l10n.interpolate('ITC.HomePage.ManagePurpleSoftwareLinkText'); //text in header
            $rootScope.currentclass = "ManageApps"; //global header class to highlight current section in main nav
            $rootScope.wrapperclass = ""; //move into set subview function if this changes per subview...
            $scope.parentscopeloaded = true;
            $scope.checkShouldShowTour(); //relies on $scope.user (in parent scope)
            $scope.setIsReady();
        });

        $scope.$on('refreshSubmitSummary',function(event){
            $scope.loadSubmitSummary()
        });
        
        $scope.$on('reloadoverview',function(){
            $scope.loadOverview();
        });

        $scope.init = function() {
            $scope.showLinks = false;
            $scope.isMac = false;
            $scope.shouldShowTour = false;
            $scope.loadOverview();
            $scope.loadSubmitSummary();
            $scope.getAppListing();
        }
        $scope.init();
    }
    itcApp.register.controller('appOverviewController',['$scope','univPurchaseService','$stateParams','$state','$rootScope','$window','manageUsersService',appOverviewController]);
});