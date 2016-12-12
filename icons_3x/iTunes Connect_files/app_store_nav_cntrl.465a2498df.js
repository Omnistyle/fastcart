'use strict';
define(['sbl!app'], function (itcApp) {
    var appStoreNavController = function($scope,univPurchaseService,$stateParams,$state,deleteAppService,appDetailsService) {
        //wait for overview data to be recieved..
        //clear out data from last call
        $scope.appOverviewInfo = {};
        $scope.$watch(function(){
            return univPurchaseService.appOverviewInfoDataSource.data;
        },function(val){
            if (val !== null) {
                $scope.setUpPageData(univPurchaseService.appOverviewInfoDataSource.data);
            }
        });

        /*
        $scope.$watch(function(){
            return univPurchaseService.submitSummaryDataSource.data;
        },function(val){
            if (val !== null) {
                $scope.setUpSummaryData(univPurchaseService.submitSummaryDataSource.data);
            }
        });
        */

        //always watch for changes to submit summary and update nav accordingly
        $scope.$watch(function(){
            return univPurchaseService.submitSummaryDataSource.data
        },function(val){
            if (val !== null) {
                $scope.setUpSummaryData(univPurchaseService.submitSummaryDataSource.data);
            }
        });


        $scope.setUpPageData = function(data) {
            $scope.appOverviewInfo = data;

            $scope.canCreateVersions = true;
            if (!$scope.appOverviewInfo.canCreateAddOn) {
                $scope.canCreateVersions = false;
            }
            
            //sort platforms
            var sortArray = univPurchaseService.getSortList();
            $scope.appOverviewInfo.platforms = _.sortBy($scope.appOverviewInfo.platforms,function(platform){
                return sortArray.indexOf(platform.platformString);
            });

            //deleteable platforms
            $scope.showConfirmDeletePlatform = false;
            $scope.deleteablePlatformsList = {};
            if ($scope.appOverviewInfo.deleteablePlatforms !== null) {
                angular.forEach($scope.appOverviewInfo.deleteablePlatforms,function(platform){
                    $scope.deleteablePlatformsList[platform] = true;
                });
            }

            $scope.showPricing = _.indexOf($scope.appOverviewInfo.features,'PRICING') >= 0 ? true: false;
            $scope.showPromoArt = _.indexOf($scope.appOverviewInfo.features,'PROMOART') >= 0 ? true: false;
            /*$scope.showAppTransfer = _.indexOf($scope.appOverviewInfo.features,'APPTRANSFER') >= 0 ? true: false;
            $scope.showDeleteApp = _.indexOf($scope.appOverviewInfo.features,'DELETE') >= 0 ? true: false;
            $scope.showBundleLink = _.indexOf($scope.appOverviewInfo.features,'APPBUNDLES') >= 0 ? true: false;*/
            $scope.adamId = $stateParams.adamId;
            $scope.state = $state;
            $scope.appInfoStatus = false; //get info from validation JSON
            $scope.appInfoWarning = false; //get info from validation JSON
            $scope.newVersionPlatformList = [];
            $scope.createNewVersionPlatformList();
            $scope.clearValidationNewVersionModal = false;
            $scope.modalsDisplay = {};
            $scope.newVerPlatform = "";
            $scope.tempPageContent = {};
            $scope.tempPageContent.clearValidationNewVersionModal = false;
            $scope.tempPageContent.showSaveVerError = false;
            $scope.tempPageContent.saveVerMsg = "";
            $scope.allContentLoading = false; // used for adding new platforms, etc.
            $scope.promoArtRequestlink = global_itc_path + "/wa/LCAppPage/viewPromoArt?adamId="+$scope.adamId;
        }
        
        $scope.setUpSummaryData = function(data) {
            //are there unapproved changes in app info? (submitSummary)
            //loop through localizations / name
            $scope.hasUnapprovedChanges = false;
            //$scope.hasMissingData = false;
            if (data.deliverableDetails !== null && data.deliverableDetails.names !== null) {
                /*angular.forEach(data.deliverableDetails.names,function(value,key){
                    angular.forEach(data.submission.localizedMetadata.value,function(localMeta){
                        if (localMeta.localeCode.toLowerCase() === key && localMeta.name.value !== value) {
                            $scope.hasUnapprovedChanges = true;
                        }
                    });
                });*/
                angular.forEach(data.submission.localizedMetadata.value,function(submissionlocalMeta){
                    var localeExistsBefore = false;
                    angular.forEach(data.deliverableDetails.names,function(deliverableMeta,deliverableMetaKey){
                        if (submissionlocalMeta.localeCode.toLowerCase() === deliverableMetaKey.toLowerCase()) {
                            localeExistsBefore = true;
                            if (submissionlocalMeta.name.value !== deliverableMeta) {
                                $scope.hasUnapprovedChanges = true;
                            }
                        }
                    });
                    //console.log("localeExistsBefore",localeExistsBefore,submissionlocalMeta.localeCode.toLowerCase())
                    if (!localeExistsBefore) {
                        $scope.hasUnapprovedChanges = true;
                    }
                });
            }
            //check category values
            if (data.deliverableDetails !== null && (data.deliverableDetails.primaryCategory !== data.submission.primaryCategory.value || data.deliverableDetails.primaryFirstSubCategory !== data.submission.primaryFirstSubCategory.value || data.deliverableDetails.primarySecondSubCategory !== data.submission.primarySecondSubCategory.value || data.deliverableDetails.secondaryCategory !== data.submission.secondaryCategory.value || data.deliverableDetails.secondaryFirstSubCategory !== data.submission.secondaryFirstSubCategory.value || data.deliverableDetails.secondarySecondSubCategory !== data.submission.secondarySecondSubCategory.value)) {
                $scope.hasUnapprovedChanges = true;
            }
            /*if (data.submission.sectionErrorKeys !== null && data.submission.sectionErrorKeys.length > 0) {
                $scope.hasMissingData = true;
            }*/
        }

        $scope.createNewVersionPlatformList = function() {
            //first sort platform list
            angular.forEach($scope.appOverviewInfo.allowedNewVersionPlatforms,function(thePlatform){
                 var item = {};
                 item.platform = thePlatform;
                 item.exists = _.findWhere($scope.appOverviewInfo.platforms,{'platformString':thePlatform});
                 item.disabled = false;
                 $scope.newVersionPlatformList.push(item);
            });
            //any platforms already existing (but need to be disabled)
            angular.forEach($scope.appOverviewInfo.platforms,function(existingPlatform){
                var alreadyInList = _.findWhere($scope.newVersionPlatformList,{'platform':existingPlatform.platformString});
                if (alreadyInList === null || alreadyInList === undefined) {
                    var item = {};
                    item.platform = existingPlatform.platformString
                    item.disabled = true;
                    $scope.newVersionPlatformList.push(item);
                }
            });
            //sort platforms
            var sortArray = univPurchaseService.getSortList();
            $scope.newVersionPlatformList = _.sortBy($scope.newVersionPlatformList,function(platform){
                return sortArray.indexOf(platform.platform);
            });
        }

        $scope.$on('hideSidebar',function(event,data) {
            $scope.hideSidebar = data;
        });

        $scope.$on('appInfoErrorState',function(event,data){
            if (data) {
                $scope.showAppInfoErroIconLink = true;
            } else {
                $scope.showAppInfoErroIconLink = false;
            }
        }) //$scope.$emit('appInfoErrorState',true);

        /* **************************************************
        DELETE PLATFORM
        ************************************************** */
        $scope.openDeletePlatformModal = function(platform) {
            $scope.deletePlatformType = platform;
            $scope.showConfirmDeletePlatform = true;
        }
        $scope.closeConfirmDeletePlatform = function(confirmed) {
            if (confirmed) {
                $scope.platformDeleteInProgress = true;
               univPurchaseService.deletePlatform($scope.adamId,$scope.deletePlatformType).then(function(response){
                    $scope.showConfirmDeletePlatform = false;
                    $scope.platformDeleteInProgress = false;
                    if ($state.current.name === "app_overview.store.versioninfo") { //if we are on the platform's version page - redirect to app info page...
                        $state.go('app_overview.store.appinfo', {'adamId': $scope.adamId});
                    }
                    $scope.$emit('reloadoverview');
                });
            } else {
                $scope.showConfirmDeletePlatform = false;
                $scope.platformDeleteInProgress = false;
            }
        }

        /* **************************************************
        New Version Function
        ************************************************** */
        $scope.getNewVersionLinkText = function() {
            if ($scope.appOverviewInfo && $scope.l10n) {
                var returnText = $scope.l10n.interpolate('ITC.AppStoreSideBar.NewVersionOnly');
                angular.forEach($scope.appOverviewInfo.allowedNewVersionPlatforms,function(platform,key) {
                    var findPlatform = _.where($scope.appOverviewInfo.platforms,{'platformString':platform});
                    if (0 >= findPlatform.length) {
                        returnText = $scope.l10n.interpolate('ITC.AppStoreSideBar.NewVersion');
                    }
                });
                return returnText;
            }
        }
        $scope.openVersionModal = function(platform) {
            $scope.newVerPlatform = platform;
            $scope.modalsDisplay.newVersion = true;
        }
        $scope.closeVersionModal = function(saving) {
            //$scope.tempPageContent.showSaveVerError = false;
            //$scope.tempPageContent.saveVerMsg = "";
            $scope.tempPageContent.clearValidationNewVersionModal = true;
            if (saving) {
                $scope.createAppVersionSaving = true;
                //submit data to api
                $scope.createNewVersionPlatform($scope.newVerPlatform,$scope.tempPageContent.newVersionNumber);
            } else {
                $scope.modalsDisplay.newVersion = false;
                $scope.newVerPlatform = "";
            }
        }
        $scope.createNewVersionPlatform = function(platform,version) {
            //createNewVersion: function(adamId,platform,versionstring)
            $scope.allContentLoading = true;
            if (version === undefined || version === null) {
                version = "1.0";
            }
            var newVersionJson = {"version":{"value":version}};
            univPurchaseService.createNewVersion($scope.adamId,platform,newVersionJson).then(function(data){
                $scope.createAppVersionSaving = false;
                if (data.status == "403") {
                    $scope.allContentLoading = false;
                    $scope.tempPageContent.showSaveVerError = true;
                    $scope.tempPageContent.saveVerMsg = data.data.messages.error[0];
                } else if (data.status == "500") {
                    $scope.allContentLoading = false;
                    $scope.tempPageContent.showSaveVerError = true;
                    $scope.tempPageContent.saveVerMsg = $scope.l10n.interpolate('ITC.savingerror.canNotSave');
                } else {
                    //save went through
                    //first refresh overview/submit summary data
                    var refreshSubmitComplete = false;
                    var refreshOverviewComplete = false;

                    $scope.$on('overviewLoaded',function(){
                        refreshOverviewComplete = true;
                    });
                    $scope.$on('submitSummaryLoaded',function(){
                        refreshSubmitComplete = true;
                    });
                    //call for refresh
                    $scope.$emit('refreshSubmitSummary');
                    $scope.$emit('reloadoverview');

                    //when refreshes complete - go to new page
                    var unbindOverviewWatcher = $scope.$watch(function(){
                        return (refreshSubmitComplete && refreshOverviewComplete);
                    },function(val){
                        if (val !== null && val) {
                            unbindOverviewWatcher();
                            refreshSubmitComplete = false;
                            refreshOverviewComplete = false;
                            $state.go('app_overview.store.versioninfo', {'adamId': $scope.adamId,'platform':platform});
                        }
                    });

                }
            });
        }
        
        $scope.showContractModal = function() {
            $scope.contractAnnouncements = $scope.appOverviewInfo.contractAnnouncements;
            $scope.showContractAnnouncementsModal = true;
        }
        $scope.closeContractAnnouncementsModal = function() {
            $scope.showContractAnnouncementsModal = false;
        }


    }

    itcApp.register.controller('appStoreNavController',['$scope','univPurchaseService','$stateParams','$state','deleteAppService','appDetailsService',appStoreNavController]);
});