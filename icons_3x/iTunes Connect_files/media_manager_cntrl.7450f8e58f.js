'use strict';
define(['sbl!app'], function (itcApp) {

    var mediaManagerController = function ($scope,$location, $timeout, $rootScope,$stateParams, univPurchaseService, appDetailsService, appVersionReferenceDataService, saveVersionDetailsService, saveVersionService, sharedProperties,linkManager,$sce, $upload,filterFilter, $filter, createAppVersionService, devRejectAppService, getLocKeyFromRootAndDevice, $state) {
        /* for ss */
        $scope.toggleMediaSection = function(loc, device, msgsMedia) {
            var isOpen = $scope.getMediaDataValue(loc, device, msgsMedia, "open");
            $scope.setMediaDataValue(loc, device, msgsMedia, "open", !isOpen);
        }

        $scope.isMediaSectionOpen = function(loc, device, msgsMedia) {
            var isOpen;
            if ($scope.tempPageContent.mediaData) {
                isOpen = $scope.getMediaDataValue(loc, device, msgsMedia, "open");
            }
            else {
                isOpen = false;
            }
            return isOpen;
        }

        $scope.isMediaManagerShowing = function() {
            return $scope.tempPageContent.showMediaManager;
        }

        $scope.confirmDeleteAllMediaInDeviceGroup = function(e, deviceGroup, loc, msgsMedia) {
            if (e && $(e.target).hasClass("disabled")) {
                return;
            }

            $scope.savedDeviceGroupForDeleteAll = deviceGroup;
            $scope.savedLocForDeleteAll = loc;
            $scope.savedIsMsgsForDeleteAll = msgsMedia;
            $scope.showDeleteAllModal(true);
        }

        $scope.getDeleteAllSubheaderTextForNonPrimaryLocs = function() {
            var subheader = "";

            if ($scope.l10n && $scope.versionInfo) {
                var devGroup = $scope.savedDeviceGroupForDeleteAll;
                var groupNameLocd;
                if (devGroup) {
                    groupNameLocd = $scope.l10n.interpolate("ITC.apps.deviceFamily.group." + devGroup);
                }
                else {
                    groupNameLocd = $scope.savedDeviceGroupForDeleteAll;
                }

                var devsInGroup = $scope.getDevsInDeviceGroup(devGroup);

                var locKey;
                if ($scope.allowsVideo(devsInGroup[0], $scope.savedLocForDeleteAll)) { // if has app previews 
                    locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.confirmDeleteModal.label.nonPrimaryText.', devGroup, false);
                }
                else {
                    locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.confirmDeleteModal.label.nonPrimaryText.noPreviews.', devGroup, false);
                }
                subheader = $scope.l10n.interpolate(locKey, 
                    {'language': $scope.getLanguageStringDisplay($scope.getLanguageString($scope.savedLocForDeleteAll), true), 
                     'largestDisplay': $scope.l10n.interpolate('ITC.apps.deviceFamily.forModals.' + devsInGroup[0] ) ,
                     'deviceGroup': groupNameLocd,
                     'PrimaryLanguage': $scope.getLanguageStringDisplay($scope.appOverviewData.primaryLocaleCode, true)
                    });
            }
            return subheader;
        }

        $scope.hasAppPreviewsInLoc = function(devs, loc, msgsMedia) {
            var has = false;

            if ($scope.isPrimaryLoc(loc)) { // if non-primary loc, don't consider it to have app previews.
                _.each(devs, function(device) {
                    var hasPrevInDevLoc = $scope.hasAppPreviewInDev(device, loc, msgsMedia);
                    if (hasPrevInDevLoc) {
                        has = true;
                    }
                });
            }
            
            return has;
        }

        $scope.hasAppPreviewInDev = function(device, loc, msgsMedia) {
            if (msgsMedia) {
                return false;
            }

            var hasVideo = false;
            
            var dataForDevice = $scope.getAppTrailerFromJSON(loc, device);
            if (dataForDevice) {
                hasVideo = dataForDevice.value !== null; 
            } 

            return hasVideo;
        }

        $scope.getDeleteAllSubheaderTextForAllLocs = function() {
            var subheader = "";

            if ($scope.l10n && $scope.versionInfo) {
                var devGroup = $scope.savedDeviceGroupForDeleteAll;
                var groupNameLocd;
                if (devGroup) {
                    groupNameLocd = $scope.l10n.interpolate("ITC.apps.deviceFamily.group." + devGroup);
                }
                else {
                    groupNameLocd = $scope.savedDeviceGroupForDeleteAll;
                }

                var devsInGroup = $scope.getDevsInDeviceGroup(devGroup);

                var locKey;
                if ($scope.allowsVideo(devsInGroup[0], $scope.savedLocForDeleteAll)) { // if has app previews 
                    locKey = 'ITC.apps.ss.confirmDeleteModal.label.allLocs.subheader';
                }
                else {
                    locKey = 'ITC.apps.ss.confirmDeleteModal.label.allLocs.subheader.noPreviews';
                }
                subheader = $scope.l10n.interpolate(locKey, 
                    {'language': $scope.getLanguageStringDisplay($scope.getLanguageString($scope.savedLocForDeleteAll)), 
                     'largestDisplay': $scope.l10n.interpolate('ITC.apps.deviceFamily.forModals.' + devsInGroup[0] ) ,
                     'deviceGroup': groupNameLocd
                    });
            }
            return subheader;
        }

        $scope.getDeleteAllSubheaderTextForPrimaryLocOnly = function() {
            var subheader = "";

            if ($scope.l10n && $scope.versionInfo) {

                var devGroup = $scope.savedDeviceGroupForDeleteAll;
                var groupNameLocd;
                if (devGroup) {
                    groupNameLocd = $scope.l10n.interpolate("ITC.apps.deviceFamily.group." + devGroup);
                }
                else {
                    groupNameLocd = $scope.savedDeviceGroupForDeleteAll;
                }

                var devsInGroup = $scope.getDevsInDeviceGroup(devGroup);

                var locKey;
                if ($scope.allowsVideo(devsInGroup[0], $scope.savedLocForDeleteAll)) { // if has app previews
                    locKey = 'ITC.apps.ss.confirmDeleteModal.label.allSpecificLang.subheader';
                }
                else {
                    locKey = 'ITC.apps.ss.confirmDeleteModal.label.allSpecificLang.subheader.noPreviews';
                }
                subheader = $scope.l10n.interpolate(locKey, 
                    {'language': $scope.getLanguageStringDisplay($scope.getLanguageString($scope.savedLocForDeleteAll), true), 
                     'largestDisplay': $scope.l10n.interpolate('ITC.apps.deviceFamily.forModals.' + devsInGroup[0] ) ,
                     'deviceGroup': groupNameLocd
                    });
            }
            return subheader;
        }

        $scope.getDeleteAllHeader = function(msgsMedia) {
            var header = "";

            if ($scope.l10n && $scope.versionInfo) {
                var devGroup = $scope.savedDeviceGroupForDeleteAll;
                var devsInGroup = $scope.getDevsInDeviceGroup(devGroup);
                var largestDev = devsInGroup[0];

                var localeCode = $scope.getLanguageString($scope.savedLocForDeleteAll);
                var isPrimary = $scope.isCurrentPrimaryLanguage(localeCode);

                var locKey;
                if ($scope.hasAppPreviewsInLoc(devsInGroup, $scope.savedLocForDeleteAll, msgsMedia) )  {   // if has app previews
                    if (isPrimary) {
                        locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.confirmDeleteModal.header.', devGroup, false);
                    }
                    else {
                        locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.confirmDeleteModal.nonprimary.header.', devGroup, false);
                    }
                }
                else {
                    if (isPrimary) {
                        locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.confirmDeleteModal.header.noPreviews.', devGroup, false);
                    }
                    else {
                        locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.confirmDeleteModal.nonprimary.header.noPreviews.', devGroup, false);
                    }
                }
                header = $scope.l10n.interpolate(locKey, {'language': $scope.getLanguageStringDisplay(localeCode, true) });
            }

            return header;
        }

        $scope.getDeleteAllSubHeader = function(msgsMedia) {
            var header = "";

            if ($scope.l10n && $scope.versionInfo) {
                var devGroup = $scope.savedDeviceGroupForDeleteAll;
                var devsInGroup = $scope.getDevsInDeviceGroup(devGroup);
                var largestDev = devsInGroup[0];
                var locKey;

                if ($scope.hasAppPreviewsInLoc(devsInGroup, $scope.savedLocForDeleteAll, msgsMedia) ) { // if has app previews
                    locKey = 'ITC.apps.ss.confirmDeleteModal.subheader';
                }
                else {
                    locKey = 'ITC.apps.ss.confirmDeleteModal.subheader.noPreviews';
                }
                header = $scope.l10n.interpolate(locKey);
            }

            return header;
        }

        $scope.deviceGroupDeleteAllDisabled = function(deviceGroup, loc, msgsMedia) {
            var isPrimary = $scope.isCurrentPrimaryLanguage($scope.getLanguageString(loc));
            if (isPrimary) { 
                // disable only if no screenshots anywhere
                var allLocs = Object.keys($scope.versionInfo.details.value);
                var allDevsInGroup = $scope.getDevsInDeviceGroup(deviceGroup);
                var hasMedia = false;
                _.each(allLocs, function(locIndex) {
                    _.each(allDevsInGroup, function(device) {
                        if ($scope.hasMedia(locIndex, device, msgsMedia)) {
                            hasMedia = true;
                        }   
                    });
                });
                return !hasMedia;
            }
            else { // disable if all checkboxes in that loc checked OR if those that are unchecked have no images
                var allScaled = $scope.allCheckboxesCheckedInLoc(deviceGroup, loc, msgsMedia);
                var thoseThatArentScaledHaveNoImages = $scope.unscaledHaveNoImages(deviceGroup, loc, msgsMedia);
                return allScaled || thoseThatArentScaledHaveNoImages;
            }
        }

        $scope.showDeviceArea = function(loc, device, msgsMedia) {
            if ($scope.versionInfo && loc !== undefined) {
                var screenshotsInJSON = $scope.screenshotsExistInJSON(loc, device, msgsMedia);
                if (!screenshotsInJSON) {
                    return false;
                }

                var isEditable = $scope.versionInfo.details.value[loc].displayFamilies.isEditable;
                var hasMedia = $scope.hasMedia(loc, device, msgsMedia);
                var isScaled = $scope.areImagesOverridden(loc, device, msgsMedia);
                return isEditable || hasMedia || isScaled;
            }
            else {
                return false;
            }
        }

        $scope.allCheckboxesCheckedInLoc = function(deviceGroup, loc, msgsMedia) {
            var devsInGroup = $scope.getDevsInDeviceGroup(deviceGroup);
            if (!$scope.tempPageContent.mediaData || !devsInGroup || devsInGroup.length === 0) {
                return false;
            }
            var isPrimary = $scope.isCurrentPrimaryLanguage($scope.getLanguageString(loc));
            var devs;
            if (isPrimary) { 
                var largestDev = devsInGroup[0];
                devs = $scope.getAllDevsSmallerThan(largestDev);
            }
            else {
                devs = devsInGroup;
            }
            var allScaled = true;
            _.each(devs, function(device) {
                var scaled = $scope.getMediaDataValue(loc, device, msgsMedia, "scaleImages");
                if (!scaled) {
                    allScaled = false;
                }
            });
            return allScaled;
        }

        $scope.unscaledHaveNoImages = function(deviceGroup, loc, msgsMedia) {
            var devsInGroup = $scope.getDevsInDeviceGroup(deviceGroup);
            if ($scope.tempPageContent.mediaData && devsInGroup && devsInGroup.length > 0) {
                var isPrimary = $scope.isCurrentPrimaryLanguage($scope.getLanguageString(loc));
                var devs;
                if (isPrimary) { 
                    var largestDev = devsInGroup[0];
                    devs = $scope.getAllDevsSmallerThan(largestDev);
                }
                else {
                    devs = devsInGroup;
                }
                var haveNoMedia = true;
                _.each(devs, function(device) {
                    var scaled = $scope.getMediaDataValue(loc, device, msgsMedia, "scaleImages");
                    if (!scaled) {
                        if (haveNoMedia) {
                            var imgs = $scope.getAllImages(msgsMedia).getGroup($scope.getLanguageString(loc), device);
                            var vids = $scope.getAllVids(msgsMedia).getGroup("ALL LANGUAGES", device);
                        
                            haveNoMedia = (!imgs || imgs.length===0) && (!vids || vids.length===0);
                        }
                    }
                });
                return haveNoMedia;
            }
            else {
                return false;
            }
        }

        $scope.deleteAllButtonInModalDisabled = function() {
            var isPrimary = $scope.isCurrentPrimaryLanguage($scope.getLanguageString($scope.currentLoc));
            if (isPrimary) {
                return !$scope.tempPageContent.deleteAllChoice; // deleteAllChoice needs to be filled with a 1 or a 2.
            }
            else {
                return false;
            }
        }

        $scope.deleteAllMediaForDeviceGroup = function(loc, deviceGroup, msgsMedia) { 
            //log("loc: " + loc + ", deviceGroup: " + deviceGroup + ", deleteAllChoice: " + $scope.tempPageContent.deleteAllChoice);
            var isCurrentLocPrimary = $scope.isCurrentPrimaryLanguage($scope.getLanguageString($scope.currentLoc));
            if (isCurrentLocPrimary) {
                if ($scope.tempPageContent.deleteAllChoice === "1") { // delete all in loc
                    var largestDev = $scope.getDevsInDeviceGroup(deviceGroup)[0];

                    $scope.deleteAllMedia2(null, largestDev, loc, msgsMedia); // delete media on largest dev.

                    var allDevsExceptLargest = $scope.getAllDevsSmallerThan(largestDev);
                    _.each(allDevsExceptLargest, function(device) { // check the box for each device except the largest

                        // to make checkbox change
                        $scope.setMediaDataValue(loc, device, msgsMedia, "scaleImages", true);
                        
                        // set the value in the json
                        $scope.setImagesToOverridden(loc, device, true, msgsMedia);

                        // Set, for every device, $scope.tempPageContent.mediaData.setDataValue(loc, device, "groupToInheritFromIfScaled", groupToInheritFrom); 
                        $scope.updateGroupsToInheritFrom(deviceGroup, msgsMedia);
                        $scope.updateImagesBelow(loc, device, msgsMedia); // calls $scope.deleteAllMedia2(null, device, locIndex);
                    });        
                }
                else if ($scope.tempPageContent.deleteAllChoice === "2") { // delete all in all locs.
                    //$scope.versionInfo.details.value.length
                    var allLocs = Object.keys($scope.versionInfo.details.value);
                    //log("allLocs: ", allLocs);
                    _.each(allLocs, function(locIndex) {
                        var isPrimary = $scope.isCurrentPrimaryLanguage($scope.getLanguageString(locIndex));

                        var devs;
                        if (isPrimary) {
                            var largestDev = $scope.getDevsInDeviceGroup(deviceGroup)[0]; //$scope.devsSorted[deviceGroup][0];
                            $scope.deleteAllMedia2(null, largestDev, loc, msgsMedia); // delete media on largest dev.
                            devs = $scope.getAllDevsSmallerThan(largestDev);
                        } 
                        else {
                            devs = $scope.getDevsInDeviceGroup(deviceGroup);//$scope.devsSorted[deviceGroup];
                        }
                        
                        _.each(devs, function(device) { // check the box for each device except the largest

                            // to make checkbox change
                            $scope.setMediaDataValue(locIndex, device, msgsMedia, "scaleImages", true);

                            // set the value in the json
                            $scope.setImagesToOverridden(locIndex, device, true, msgsMedia);

                            
                            // Don't do this on non-primary languages - that will happen on updateSnapshotDetails() on loc change
                            if (isPrimary) {
                                // Set, for every device, $scope.tempPageContent.mediaData.setDataValue(loc, device, "groupToInheritFromIfScaled", groupToInheritFrom); 
                                $scope.updateGroupsToInheritFrom(deviceGroup, msgsMedia); 
                                $scope.updateImagesBelow(locIndex, device, msgsMedia); // calls $scope.deleteAllMedia2(null, device, locIndex);
                            }
                            else {
                                // clear images from json
                                $scope.deleteAllMedia2(null, device, locIndex, msgsMedia);
                            }
                        });
                    });
                }
            }
            else { // non-primary loc
                // just select all checkboxes.  
                var devsSorted = $scope.getDevsInDeviceGroup(deviceGroup);
                _.each(devsSorted, function(device) { // check the box for each device except the largest

                    // to make checkbox change
                    $scope.setMediaDataValue(loc, device, msgsMedia, "scaleImages", true);

                    // set the value in the json
                    $scope.setImagesToOverridden(loc, device, true, msgsMedia);

                    // Set, for every device, $scope.tempPageContent.mediaData.setDataValue(loc, device, "groupToInheritFromIfScaled", groupToInheritFrom); 
                    $scope.updateGroupsToInheritFrom(deviceGroup, msgsMedia); 
                    $scope.updateImagesBelow(loc, device, msgsMedia); // calls $scope.deleteAllMedia2(null, device, locIndex);
                });
            }

            $scope.showDeleteAllModal(false);
        }

        $scope.showDeleteAllModal = function(show) {
            if (show) {
                $scope.tempPageContent.deleteAllChoice = "1";
            }
            $scope.modalsDisplay.confirmDeleteAllMedia = show;
        }

        $scope.getAppName = function() {
            if ($scope.appOverviewData) {
                //get the primary locs localizedMetaData.

                var locMetaData = _.find($scope.appOverviewData.localizedMetadata, function(localizedMetadata) {
                    return (localizedMetadata.localeCode === $scope.appOverviewData.primaryLocaleCode);
                });

                if (locMetaData) {
                    return locMetaData.name;
                }
                else {
                    return "";
                }
            }
            else {
                return "";
            }
        }

        $scope.deleteTransitionEnded = function(data) { 
            $scope.$broadcast('zoneDeleteTransitionEnded', data); // makes the following zones in same dropwell slide left
        };

        /********** Uncomment the below to load jsons every time this page opens. Currently getting all data from version page instead. **********/

       /*$scope.loadAppInfoDetails = function() {
            //$scope.tempPageContent.scrollnow = true;
            univPurchaseService.appInfo($scope.adamId).then(function(data) {
                if (data.status == "500") {
                    window.location = global_itc_path + "/wa/defaultError";
                } else {
                    //console.log("data",data.data);
                    //hold off loading the rest of the page until parentscope is loaded
                    var unbindwatch_loadAppInfoDetails = $scope.$watch(function(){
                        return ($scope.parentScopeLoaded && $scope.AppOverviewLoaded);
                    },function(val){
                        if (val) {
                            $scope.setupAppInfoPageData(data.data);
                            unbindwatch_loadAppInfoDetails();
                        }
                    });
                }
            });
        }

        $scope.loadVersionInfo = function() {
            //look up id in appOverviewData via platform and state
            $scope.platformOverviewInfo = _.findWhere($scope.appOverviewData.platforms,{'platformString':$stateParams.platform});
            $scope.stateParamsPlatform = $stateParams.platform;

            if ($state.current.name === "app_overview.mediaManager") {
                if ($scope.platformOverviewInfo.inFlightVersion !== null) {
                    $scope.uniqueId = $scope.platformOverviewInfo.inFlightVersion.id;
                } else {
                    $state.go('app_overview.store.versioninfo_deliverable',$stateParams,{reload:true});
                    $scope.uniqueId = $scope.platformOverviewInfo.deliverableVersion.id;
                }
            } else { //state is: app_overview.store.versioninfo.deliverable // tbd: make a deliverable version of media manager
                $scope.uniqueId = $scope.platformOverviewInfo.deliverableVersion.id;
            }

            univPurchaseService.appVersionInfo($scope.adamId,$stateParams.platform,$scope.uniqueId).then(function(data) {
                if (data.status == "500") {
                    window.location = global_itc_path + "/wa/defaultError";
                } else {
                    $scope.versionInfo = data.data;
                    $scope.setupVersionInfoPageData(false);
                            //hold off loading the rest of the page until parentscope is loaded
                    
                }
            });
        }

        */        

/*
        $scope.setIsReady = function() {
            if ($scope.parentScopeLoaded && $scope.appInfoloaded && $scope.versionloaded) {
                $scope.appInfoIsLoading = false;
            } else {
                $scope.appInfoIsLoading = true;
            }
        }

        $scope.setupAppInfoPageData = function(data) {

            //reset any error messaging in nav:
            $scope.$emit('appInfoErrorState',false);
            $scope.infoKeys = {}; //store for client side validation info keys
            $scope.appInfoDetails = data;
            log("$scope.appInfoDetails: ", $scope.appInfoDetails);
            //scroll to top if page was just saved and there's errors
            if ($scope.appInfoDetails.sectionErrorKeys !== undefined && $scope.appInfoDetails.sectionErrorKeys !== null && $scope.appInfoDetails.sectionErrorKeys.length > 0) {
                $scope.tempPageContent.contentSaved = false;
                //$scope.tempPageContent.showSaveError = true;
                $scope.tempPageContent.scrollnow = true;
                $scope.tempPageContent.confirmLeave.needToConfirm = true;
                $scope.tempPageContent.showSaveConfirm = false;
                $scope.tempPageContent.saveAttemptFailed = true;
                //console.log("$scope.tempPageContent.scrollnow "+$scope.tempPageContent.scrollnow)
            } else if ($scope.tempPageContent.contentSaved) {
                //$scope.tempPageContent.showSaveError = false;
                $scope.tempPageContent.scrollnow = false;
                $scope.tempPageContent.showSaveConfirm = true;
                $scope.tempPageContent.confirmLeave.needToConfirm = false;
                $scope.tempPageContent.saveAttemptFailed = false;
                //kick off overview reload...
                //$scope.$emit('reloadoverview');
            }

            $scope.appInfoloaded = true;

            $scope.setIsReady();

        }
*/
 /*       $scope.setupVersionInfoPageData = function(updatedVersionInfo) { //pass in updated version info after a save
     
            $scope.infoKeys = {};
            $scope.img_url_gen = new ai.imageservice.ImageURLGenerator($scope.referenceData.imageServiceBaseUrl); */
 /*           $scope.mainNavCurrentKey = 'ITC.AppVersion.MainNav.Versions';
            $rootScope.currentPage = $scope.l10n.interpolate('ITC.HomePage.ManagePurpleSoftwareLinkText'); //text in header
            //reset page load issues error
            $scope.tempPageContent.showAdditionalError = false;
            $scope.tempPageContent.additionalError = "";
            $scope.tempPageContent.deleteButtonOnWatchHasText = true;
            $scope.modalsDisplay.submitForReviewModal.show = false;

            
            //reset ready to save
            $scope.tempPageContent.userReadyToSave = false;

            //reset versioninfo scope
            if (updatedVersionInfo) { //if we have updated version info - put it into main scope object..
                //console.log("updated version info: " , updatedVersionInfo);
                $scope.versionInfo = updatedVersionInfo;
            }

            //scroll to top if page was just saved and there's errors
            if ($scope.versionInfo.sectionErrorKeys !== undefined && $scope.versionInfo.sectionErrorKeys !== null && $scope.versionInfo.sectionErrorKeys.length > 0) {
                $scope.tempPageContent.contentSaved = false;
                //$scope.tempPageContent.showSaveError = true;
                $scope.tempPageContent.scrollnow = true;
                //console.log("$scope.tempPageContent.scrollnow "+$scope.tempPageContent.scrollnow)
            } else if ($scope.tempPageContent.contentSaved) {
                //$scope.tempPageContent.showSaveError = false;
                $scope.tempPageContent.scrollnow = false;
                //refresh header...
                //$scope.$broadcast('reloadappheader');
            } else if ($scope.tempPageContent.contentReceivedUpdate) { //used for versioninfo updates unrelated to saving behavior. i.e. make app available.
                $scope.tempPageContent.scrollnow = false;
                //$scope.$broadcast('reloadappheader');
            }

            //add language TEXT to use for sorting.
            $scope.versionInfo.details.value = $scope.addPageLanguageValues($scope.versionInfo.details.value);
            $scope.versionInfo.details.value = $scope.sortDetailsByLocalization($scope.versionInfo.details.value);

*/
            //set default loc view to default loc/primary lang     
/*            var previousLoc = $scope.currentLoc;  
            $scope.primaryLangKey = $scope.getLanguageKey($scope.appOverviewData.primaryLocaleCode);
            if ($scope.currentLoc === undefined) { // don't set the currentLoc unless it hasn't been set yet    
                $scope.currentLoc = $scope.primaryLangKey;
            }
*/
            //remove used localizations from the list of localization that can be added 
 /*
            $scope.updateNonLocalizedList();

            $scope.initializeMediaErrorHolder();
            $scope.initializeMediaDataHolder();
            
            // moved this up just before currentLoc changes
            // if there were errors, don't clear previous values
            var mediaExisted = false;
            if (!$scope.updatedVersionInfoHasErrors($scope.versionInfo)) { // if no errors
                mediaExisted = $scope.initSnapshotDetails(); // clear previous values from temporary storage (groups)
            } else { // if had errors, keep temporary storage (groups) and save errors to them
                $scope.checkForSnapshotErrors($scope.versionInfo);
                $scope.checkForVideoErrors($scope.versionInfo);
                this.lastLoc = null; // important to clear out lastLoc and lastDev
                this.lastDev = null; // before calling updateSnapshotDetails()
            }
            
            // Only want this to happen if updatedVersionInfo is not false and previous loc is same as current loc
            // Any other case and this will happen when $scope.currentLoc changes.
            if (updatedVersionInfo && previousLoc === $scope.currentLoc) {
                $scope.updateSnapshotDetails(true, mediaExisted); // update snapshots & video from either the server or from temp storage
                if ($scope.watchDataExists()) {
                    $scope.updateWatchScreenshots(true); 
                }
            }


            //get cleaner "app type" value
            if ($state.params.platform == "ios") {
                $scope.tempPageContent.isIOS = true;
                $scope.tempPageContent.isMac = false;
                $scope.tempPageContent.appType = "iOS";
            } else if ($state.params.platform == "osx") {
                $scope.tempPageContent.isIOS = false;
                $scope.tempPageContent.isMac = true;
                $scope.tempPageContent.appType = "Mac";
            }


            // REFERENCE DATA FORMATTING
            $scope.$watch('referenceData',function() {
                if($scope.referenceData != undefined) {
                    $scope.updateDevices();
                    $scope.determinePreviewUploadAndPlayPermissions();
                    $scope.setNumVideos();
                }
            });

            
            // Screenshots: sort and make consecutive before we start listening to versionInfo changes.
            $scope.makeScreenshotSortOrderConsecutive();

            $scope.orignalVersionInfo = angular.copy($scope.versionInfo);
            
            $scope.shouldSaveEnabled();
            //$scope.enableSaveButton = false; //should not enable save upon dataload...

            */
 /*           $scope.versionloaded = true;
            $scope.setIsReady();
            //log("Version info: ", $scope.versionInfo);
        }
        */

/*

        //returns the "details" key of language supplied. (or false if not present)
        $scope.getLanguageKey = function(langstring) {
            var langkey;
            angular.forEach($scope.versionInfo.details.value, function(value, key) {
                if (value.language === langstring) {
                    langkey = key;
                }   
            });
            return langkey;
        }


        $scope.init = function() {
            $scope.AppOverviewLoaded = false;
            $scope.appInfoloaded = false;
            $scope.versionloaded = false;

            $scope.enableSaveButton = false;


            $scope.saveInProgress = false;

            $scope.tempPageContent = {};

            $scope.tempPageContent.confirmLeave = {}; //storage of error messaging for user leaving page.
            $scope.tempPageContent.confirmLeave.needToConfirm = false;
            $scope.tempPageContent.confirmLeave.msg = "";

            //$scope.tempPageContent.confirmLeaveWithModalShowing = {};
            //$scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModalSml = false;
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = false;

            $scope.tempPageContent.confirmLeaveOverloaded = {};
            $scope.tempPageContent.confirmLeaveOverloaded.needToConfirm = false;
            $scope.tempPageContent.confirmLeaveOverloaded.msg = "";

            $scope.tempPageContent.saveAttemptFailed = false;

            //check/watch for other sections to be loaded
            var unbindwatch_AppOverview = $scope.$watch(function(){
                return univPurchaseService.appOverviewInfoDataSource.data;
            },function(val){
                if (val !== null) {
                    $scope.appOverviewData = univPurchaseService.appOverviewInfoDataSource.data;
                    
                    unbindwatch_AppOverview();
                    $scope.AppOverviewLoaded = true;
                    $scope.loadVersionInfo();
                }
            }); 

            var unbindwatch_parentScope = $scope.$watch(function(){
                return $scope.parentScopeLoaded;
            },function(val){
                if (val !== null && val) {
                    unbindwatch_parentScope();
                    $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.Title'); //only used on custom confirmLeave modal
                    $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.message');
                    $scope.setIsReady(); 
                }
            });

            $scope.appInfoIsSaving = false;
            $scope.appInfoIsLoading = true;

            $scope.setIsReady();
            $scope.adamId = $stateParams.adamId;
            $scope.platform = $stateParams.platform;
            $scope.loadAppInfoDetails();
            
        }
        //$scope.init();
*/        
    }

    itcApp.register.controller('mediaManagerController', ['$scope','$location','$timeout','$rootScope','$stateParams', 'univPurchaseService', 'appDetailsService','appVersionReferenceDataService','saveVersionDetailsService','saveVersionService', 'sharedProperties','linkManager','$sce', '$upload','filterFilter', '$filter','createAppVersionService', 'devRejectAppService', 'getLocKeyFromRootAndDevice', '$state', mediaManagerController]);
    
});
