'use strict';
define(['sbl!app'], function (itcApp) {

    var appVersionInfoController = function ($scope,$location, $timeout, $rootScope,$stateParams, ai, appDetailsService,univPurchaseService, appVersionReferenceDataService, saveVersionDetailsService, saveVersionService, sharedProperties,linkManager,$sce, $upload,filterFilter, $filter, createAppVersionService, devRejectAppService, $state, ITC, validateScreenedWordsService, gameCenterService) {

        /* for ss */

        var $$ = $scope;
        window.scope = $scope;
        var RELEASE_MANUAL = "1";
        var RELEASE_AUTO = "2";
        var RELEASE_AUTO_AFTER_DATE = "3";
        var MAX_THUMBNAIL_SCREENSHOT_SIZE = 500;
        var THUMBNAIL_ICON_SIZE = 150;
        var THUMBNAIL_WATCH_ICON_SIZE = 160;

        $$.modals = {};
        $$.ITC = ITC;

        /*$scope.setisReady = function() {
            if ($scope.versionloaded) {
                $rootScope.isReady = true;
                $rootScope.wrapperclass = "nonfixedheader"; //moved this here so header isn't scrollable while page is loading...make header scroll away - so we can use fixed "action bar"
            } else {
                $rootScope.isReady = false;
            }
        }*/

        $scope.setisReady = function() {
            if ($scope.parentScopeLoaded && $scope.AppOverviewLoaded) { // && $scope.appInfoloaded) {
                $rootScope.isReady = true;
                //$rootScope.wrapperclass = "nonfixedheader";
            } else {
                $rootScope.isReady = false;
            }
            if ($scope.versionloaded) {
                $scope.appInfoIsLoading = false;
            } else {
                $scope.appInfoIsLoading = true;
            }
        }

        $scope.getTopLevelScreenshotsFromJSON = function(versionInfo, language) {
            var screenshots;
            if ($scope.hasProviderFeature('SSENABLED')) {
                screenshots = versionInfo.details.value[language].displayFamilies;
            }
            else {
                screenshots = versionInfo.details.value[language].screenshots;
            }
            return screenshots;
        }

        // saves/displays errors if the given updatedVersionInfo has snapshot errors.
        $scope.checkForSnapshotErrors = function(updatedVersionInfo, msgsScreenshots) {
            var allImages;
            if (msgsScreenshots) {
                allImages = $scope.allMsgsImages;
            }
            else {
                allImages = $scope.allImages;
            }
            var screenshotsArr, screenshot, langErrorKeys, deviceErrorKeys, details, device, screenshotSpecificErrors, langStr, screenshots;
            for (var language = 0; language < updatedVersionInfo.details.value.length; language++) {
                langStr = $scope.getLanguageString(language);
                langErrorKeys = $scope.getTopLevelScreenshotsFromJSON(updatedVersionInfo, language).errorKeys;

                // clear out previous language specific error
                allImages.setLanguageSpecificError(langStr, null);

                for (var deviceIndex = 0; deviceIndex < $scope.deviceNames.length; deviceIndex++) {
                    device = $scope.deviceNames[deviceIndex];
                    if (msgsScreenshots) {
                        screenshots = $scope.getMsgsScreenshots(language, device, updatedVersionInfo);
                    }
                    else {
                        screenshots = $scope.getScreenshots(language, device, updatedVersionInfo);
                    }

                    if (screenshots) {
                        deviceErrorKeys = screenshots.errorKeys;
                    }

                    // clear out previous device specific error
                    allImages.setLanguageDeviceSpecificError(langStr, device, null);

                    if (deviceErrorKeys && deviceErrorKeys.length>0) {
                        //console.log("DEVICE SNAPSHOT ERROR: (" + deviceErrorKeys.length + "): " + deviceErrorKeys.join(", "));
                        allImages.setLanguageDeviceSpecificError(langStr, device, deviceErrorKeys.join(", "));

                        var deviceErrorKey;
                        // clear out double errors - if don't do this, apple watch errors will show up on non-watch screenshot section
                        for (var deviceErrorKeyIndex = 0; deviceErrorKeyIndex < deviceErrorKeys.length; deviceErrorKeyIndex++) {
                            deviceErrorKey = deviceErrorKeys[deviceErrorKeyIndex];
                            var indexOfDeviceKey = langErrorKeys.indexOf(deviceErrorKey);
                            if (indexOfDeviceKey !== -1) {
                                // remove error from langErrorKeys, since it's in deviceErrorKeys
                                langErrorKeys.splice(indexOfDeviceKey, 1);
                            }
                        }
                    }

                    if (screenshots) {
                        screenshotsArr = screenshots.value;
                        for (var screenshotIndex = 0; screenshotIndex < screenshotsArr.length; screenshotIndex++) {
                            screenshot = screenshotsArr[screenshotIndex];

                            // clear out previous snapshot specific error
                            allImages.setError(langStr, language, device, screenshot.value.sortOrder, null);

                            if (screenshot.errorKeys) {
                                //console.log("SCREENSHOT SPECIFIC ERROR: " + screenshot.errorKeys + " at sortOrder: " + screenshot.value.sortOrder);
                                screenshotSpecificErrors = screenshot.errorKeys.join(", ");
                                allImages.setError(langStr, language, device, screenshot.value.sortOrder, screenshotSpecificErrors);
                            }
                        }
                    }
                }

                // a language specific error doesn't distinguish between iMessage screenhots and non-iMessage screenshots,
                // and so it causes errors to show up in both places instead of just one.
                if (!$scope.hasProviderFeature('VOYAGER')) {
                    if (langErrorKeys && langErrorKeys.length>0) {
                        //console.log("LANGUAGE SNAPSHOT ERROR: (" + langErrorKeys.length + "): " + langErrorKeys.join(", "));
                        allImages.setLanguageSpecificError(langStr, langErrorKeys.join(", "));
                    }
                }

            }
        };

        $scope.checkForVideoErrors = function(updatedVersionInfo) {
            if ($scope.referenceData.appPreviewEnabled) {
                var screenshotsArr, screenshot, langErrorKeys, deviceErrorKeys, details, device, screenshotSpecificErrors, langStr, detailsByDevice;
                for (var language = 0; language < updatedVersionInfo.details.value.length; language++) {
                    langStr = $scope.getLanguageString(language);

                    if (!$scope.hasProviderFeature('SSENABLED')) { // note: there are no language specific errorKeys with SS JSON structure.
                        details = updatedVersionInfo.details.value[language].appTrailers.value;
                        langErrorKeys = updatedVersionInfo.details.value[language].appTrailers.errorKeys;
                        if (langErrorKeys && langErrorKeys.length>0) {
                            //console.log("LANGUAGE VIDEO ERROR: (" + langErrorKeys.length + "): " + langErrorKeys.join(", "));
                            //$scope.tempPageContent.allVideos.setLanguageSpecificError(langStr, langErrorKeys.join(", "));
                            $scope.tempPageContent.allVideos.setLanguageSpecificError("ALL LANGUAGES", langErrorKeys.join(", "));
                        }
                    }

                    for (var deviceIndex = 0; deviceIndex < $scope.deviceNames.length; deviceIndex++) {
                        device = $scope.deviceNames[deviceIndex];
                        detailsByDevice = $scope.getAppTrailerFromJSON(language, device, updatedVersionInfo);
                        if (detailsByDevice) {
                            deviceErrorKeys = detailsByDevice.errorKeys;
                            if (deviceErrorKeys && deviceErrorKeys.length>0) {
                                //console.log("DEVICE VIDEO ERROR: (" + deviceErrorKeys.length + "): " + deviceErrorKeys.join(", "));
                                //$scope.tempPageContent.allVideos.setLanguageDeviceSpecificError(langStr, device, deviceErrorKeys.join(", "));
                                $scope.tempPageContent.allVideos.setLanguageDeviceSpecificError("ALL LANGUAGES", device, deviceErrorKeys.join(", "));
                            }
                        }
                    }
                }
            }
        };

        // returns true if the given updatedVersionInfo has section errors.
        // used for snapshots
        $scope.updatedVersionInfoHasErrors = function(updatedVersionInfo) {
            return (updatedVersionInfo &&
                updatedVersionInfo.sectionErrorKeys !== undefined &&
                updatedVersionInfo.sectionErrorKeys !== null &&
                updatedVersionInfo.sectionErrorKeys.length > 0);
        };

        /* **************************************************
        Info Message Handling (dev reject) Functions
        ************************************************** */
        // Called when anything in a blue info message is clicked. (Little workaround for not putting ng-clicks in the loc file)
        $scope.infoPageMessageClicked = function(e) {
            var link = e.target;
            if (link.id === "devRejectID") {
                $scope.tempPageContent.showDevRejectModal = true;
            }
            else {
                // tbd: handle another menu item.
                //console.log("something else in blue info message was clicked.");
            }
        };
        // Called when the reject button is clicked on the dev reject modal.
        $scope.devRejectApp = function() {
            $scope.devRejectInProcess = true;
            devRejectAppService.reject($scope.adamId,$scope.versionInfo.versionId).then(function(data){
                $scope.devRejectInProcess = false;
                if (data.status == "403") {
                    //console.log('dev reject error?');
                    $scope.tempPageContent.showDevRejectError = true;
                    $scope.tempPageContent.devRejectError = data.data.messages.error.join(" ");
                } else {
                    // success!
                    $scope.tempPageContent.showDevRejectError = false;
                    $scope.tempPageContent.showDevRejectModal = false;
                    $scope.$broadcast('reloadoverview');
                    $state.reload();
                }

            });
        };

        $scope.shouldShowAppReviewSection = function() {
            if($scope.versionInfo) {
                var returnVal = false;
                //check all values in appreivew - return false if all are not editable and empty or null
                angular.forEach($scope.versionInfo.appReviewInfo,function(aprItem,aprItemKey){
                    if (aprItem.value !== null && aprItem.value !== '' && aprItem.value.length > 0) {
                        returnVal=true;
                    } else if (aprItem.isEditable) {
                        returnVal=true;
                    }
                });
                return returnVal;
            }
        }

        $scope.$watch('versionInfo',function() {
            $scope.checkRatingsErrors();
            //console.log("version info updated...");
            $scope.errorCheckingLocalizations();
            $scope.shouldSaveEnabled();
            //$scope.updateDevices();
        },true);
        $scope.$watch('tempPageContent.formErrors.count',function(){
            $scope.shouldSaveEnabled();
        },true);
        $scope.$watch('tempPageContent.errorTracker',function(){
            $scope.shouldSaveEnabled();
        },true);


        /* **************************************************
        CONFIRM LEAVE FUNCTIONS
        ************************************************** */
        /* On user navigating away - check if there are changes and popup message if there are */
        $rootScope.$on('$stateChangeStart', function(event, next, toParams, current, fromParams) {
            if (!$scope.tempPageContent.confirmLeave.showConfirmLeaveModal) { //confirmLeave modal NOT showing at the moment...
                if ($scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm) {
                    event.preventDefault();
                    //var exitpath = next.url.split(global_itc_home_url+"/");
                    //$scope.tempPageContent.confirmLeave.userIsLeavingTO = exitpath[1]; //ra/ng //$location.url(next).hash()
                    $scope.tempPageContent.confirmLeave.userIsLeavingTO = next;
                    $scope.tempPageContent.confirmLeave.userIsLeavingTO.toParams = toParams;
                    $scope.tempPageContent.confirmLeave.showConfirmLeaveModalSml = true;
                } else if($scope.tempPageContent.confirmLeave.needToConfirm) {
                    //don't allow user to leave just yet - confirm with popup - store next link to allow them to continue
                    event.preventDefault();
                    //var exitpath = next.url.split(global_itc_home_url+"/");
                    //$scope.tempPageContent.confirmLeave.userIsLeavingTO = exitpath[1]; //ra/ng //$location.url(next).hash()
                    $scope.tempPageContent.confirmLeave.userIsLeavingTO = next;
                    $scope.tempPageContent.confirmLeave.userIsLeavingTO.toParams = toParams;
                    $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = true;
                }
            }
        });
        $scope.confirmLeaveModalFunctions = {};

        // Called if "don't save" button is clicked.
        $scope.confirmLeaveModalFunctions.leavePage = function() {
            if ($scope.tempPageContent.confirmLeave.userIsLeavingTO === null || $scope.tempPageContent.confirmLeave.userIsLeavingTO === undefined || $scope.tempPageContent.confirmLeave.userIsLeavingTO === "") {
                //$scope.tempPageContent.confirmLeave.userIsLeavingTO = "/";
                $scope.tempPageContent.confirmLeave.userIsLeavingTO.name = "home"
            }
                $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = false;
                $scope.tempPageContent.confirmLeave.showConfirmLeaveModalSml = false;
                $scope.tempPageContent.confirmLeave.needToConfirm = false;
                $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
                //$location.url($scope.tempPageContent.confirmLeave.userIsLeavingTO);
                $state.go($scope.tempPageContent.confirmLeave.userIsLeavingTO.name,$scope.tempPageContent.confirmLeave.userIsLeavingTO.toParams);
        }

        // Called if "cancel" is clicked.
        $scope.confirmLeaveModalFunctions.stayOnPage = function() {
            $scope.tempPageContent.confirmLeave.userIsLeavingTO = "";
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = false;
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModalSml = false;
        }

        // Called if "save" is clicked.
        $scope.confirmLeaveModalFunctions.saveChanges = function() {
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = false;
            $scope.saveVersionDetails();
        }

        //to enable BROWSER "do you want to leave" modal dialog when either a modal is showing or when the page has changes that might be lost
        $scope.$watch(function(){
            if ($scope.tempPageContent.confirmLeave.needToConfirm || $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm) {
                return true;
            }
        },function(val){
            if (val) {
                $scope.tempPageContent.confirmLeaveOverloaded.needToConfirm = true;
                $scope.tempPageContent.confirmLeaveOverloaded.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.message');
            } else {
                $scope.tempPageContent.confirmLeaveOverloaded.needToConfirm = false;
                $scope.tempPageContent.confirmLeaveOverloaded.msg = "";
            }
        });

        /* **************************************************
        Localization / Language Functions
        ************************************************** */
        $scope.LanginfoMessageClicked = function(e) {
            var link = e.target;
            if (link.id === "launch_app_store_info_modal") {
                $scope.tempPageContent.showLangInfoModal = true;
            }
        };


        /** HIGH LEVEL ERROR CHECKING **/
        var checkLocField = function(loc,field,origField,fieldKey,maxSize) {
            if (loc[field]) {
                if (loc[field].isEditable && loc[field].isRequired && (loc[field].value === "" || loc[field].value === null  || loc[field].value === undefined)) {
                    return true;
                } else if (loc[field].errorKeys !== null && loc[field].errorKeys.length > 0) {
                    var origLoc = _.findWhere(origField,{"language":loc.language});
                    if (origLoc !== undefined && origLoc !== null) {
                        if (angular.toJson(origLoc[field]) === angular.toJson(loc[field])) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else if (maxSize !== undefined && loc[field].value !== null && loc[field].value.length > maxSize) {
                    return true;
                }
            }
            return false;
        }
        //check specific fields in localization for content and server errors...
        $scope.errorCheckingLocalizations = function() {
            if ($scope.tempPageContent !== undefined) {
                $scope.tempPageContent.errorTracker = [];
                if ($scope.versionInfo !== undefined && $scope.versionInfo.details !== undefined && $scope.orignalVersionInfo !== undefined && $scope.versionInfo.details.value !== undefined && $scope.orignalVersionInfo.details.value !== undefined) {
                    angular.forEach($scope.versionInfo.details.value,function(loc,key){
                        var thisLocsHasErrors = false;
                        if (checkLocField(loc,"description",$scope.orignalVersionInfo.details.value,$scope.referenceData.appMetaDataReference.maxAppDescriptionChars)) {
                            thisLocsHasErrors = true;
                        }
                        //if (checkLocField(loc,"watchDescription",$scope.orignalVersionInfo.details.value,$scope.referenceData.appMetaDataReference.maxAppDescriptionChars)) {
                        //    thisLocsHasErrors = true;
                        //}
                        if (checkLocField(loc,"keywords",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"marketingURL",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"name",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"privacyURL",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"releaseNotes",$scope.orignalVersionInfo.details.value,$scope.referenceData.appMetaDataReference.maxAppReleaseNotesChars)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"supportURL",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (hasMediaErrorsInLoc(key)) {
                            thisLocsHasErrors = true;
                        }
                        if (thisLocsHasErrors) {
                            $scope.tempPageContent.errorTracker.push(key);
                        }
                    });
                }
            }
        }
        $scope.doesLocHaveError = function(locKey) {
            if ($scope.tempPageContent.errorTracker !== "undefined") {
                $scope.errorCheckingLocalizations();
            }
            if (_.indexOf($scope.tempPageContent.errorTracker,locKey) >= 0) {
                return true;
            } else {
                return false;
            }
        }

        // usedInSentence should be true if the locale is used in a sentence.
        // firstInSentence should be used if the locale is used FIRST in a sentence.
        $scope.getLocaleKey = function(loc, usedInSentence, firstInSentence){
            if (usedInSentence) {
                if (firstInSentence) {
                    return 'ITC.locale.' + loc + '.firstInSentence';
                }
                else {
                    return 'ITC.locale.' + loc + '.inSentence'; // See <rdar://problem/27459696>
                }
            }
            else {
                return 'ITC.locale.' + loc;
            }
        }
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
        $scope.getLanguageString = function(langkey) {
            if ($scope.versionInfo && langkey !== undefined) {
                return $scope.versionInfo.details.value[langkey].language;
            }
            else {
                return "";
            }
        }

        // usedInSentence should be true if the locale is used in a sentence.
        // firstInSentence should be used if the locale is used FIRST in a sentence.
        $scope.getLanguageStringDisplay = function(langstring, usedInSentence, firstInSentence) {
            //return $scope.referenceData.detailLanguages[langstring];
            var localString = $scope.getLocaleKey(langstring.toLowerCase(), usedInSentence, firstInSentence);
            return $scope.l10n.interpolate(localString);
        }
        $scope.isCurrentPrimaryLanguage = function(langstring) {
            if ($scope.appOverviewData && $scope.appOverviewData.primaryLocaleCode == langstring) {
                return true;
            } else {
                return false;
            }
        }
        $scope.appHasLocalization = function(langstring) {
            var langexists = _.findWhere($scope.versionInfo.details.value, {language: langstring});
            if (langexists !== undefined) {
                return true;
            } else {
                return false;
            }
        }
        $scope.updateNonLocalizedList = function() { //remove existing/added localizations from the available list of localization that can be addded
            $scope.nonLocalizedList = angular.copy($scope.referenceData.detailLocales);
            angular.forEach($scope.referenceData.detailLocales,function(refvalue){
                angular.forEach($scope.versionInfo.details.value,function(detailvalue,detailkey){
                    if (refvalue === detailvalue.language) {
                        var index = $scope.nonLocalizedList.indexOf(refvalue);
                        if (index > -1) {
                            $scope.nonLocalizedList.splice(index, 1);
                        }
                    }
                });
            });
            //sort
            $scope.nonLocalizedList = _.sortBy($scope.nonLocalizedList,function(lang) {
                var localString = 'ITC.locale.'+lang.toLowerCase();
                return $scope.l10n.interpolate(localString);
            });

            return $scope.nonLocalizedList;
        }
        /* Remove?
        $scope.setAsPrimary = function(langstring) {
            //console.info("setAsPrimary before re-sort: ", $scope.versionInfo.details.value);
            $scope.versionInfo.primaryLanguage.value = langstring;
            $scope.versionInfo.details.value = $scope.sortDetailsByLocalization($scope.versionInfo.details.value);
            $scope.changeLocView($scope.getLanguageKey(langstring));
            //console.info("setAsPrimary after re-sort: ", $scope.versionInfo.details.value);
        }*/
        $scope.changeLocView = function(key) {
            $scope.$emit('closepopups',true);

            // when a setAsPrimary changes the loc view but not the loc key (key is going from 0 to 0),
            // need to trigger an updateSnapshotDetails(), because the watch on $scope.currentLoc won't.
            var updateMedia = ($scope.currentLoc === key);

            $scope.currentLoc = key;

            if (updateMedia) {
                $scope.updateSnapshotDetails(true);
            }
        }
        $scope.addPageLanguageValues = function(versionDetailsObject) {
            angular.forEach(versionDetailsObject,function(detailvalue,key){
                versionDetailsObject[key].pageLanguageValue = $scope.referenceData.detailLanguages[detailvalue.language];
            });
            return versionDetailsObject;
        }
        $scope.sortDetailsByLocalization = function(versionDetailsObject) {//$scope.versionInfo.details.value
            //get primary language detail group
            //var primaryLangDetail = _.findWhere(versionDetailsObject,{language: $scope.appOverviewData.primaryLocaleCode});

            var primaryLangDetail = _.filter(versionDetailsObject,function(versioninfo){
                    if (versioninfo.language == $scope.appOverviewData.primaryLocaleCode) {
                        return true;
                    }
                });
            primaryLangDetail = primaryLangDetail[0];
            //now (temporarily) remove this language from list before sorting
            var sortedLocalizations = _.reject(versionDetailsObject,function(item) {
                if (item.language === $scope.appOverviewData.primaryLocaleCode) {
                    return true;
                } else {
                    return false;
                }
            });
            sortedLocalizations = _.sortBy(sortedLocalizations,function(lang) {
                var localString = 'ITC.locale.'+lang.language.toLowerCase();
                return $scope.l10n.interpolate(localString);
                //return lang.pageLanguageValue;
            });
            //add primary language to top of list
            sortedLocalizations.unshift(primaryLangDetail);
            return sortedLocalizations;
        }

        $scope.addLocalization = function(langstring) {
            var primaryLang = $scope.appOverviewData.primaryLocaleCode;
            var primaryLangCopyDetail = angular.copy(_.findWhere($scope.versionInfo.details.value,{language: primaryLang}));

            // clear loc errors
            primaryLangCopyDetail.sectionErrorKeys.length = 0;
            //clear out loc specific fields
            primaryLangCopyDetail.description.value = null;
            //primaryLangCopyDetail.watchDescription.value = null;
            primaryLangCopyDetail.releaseNotes.value = null;
            primaryLangCopyDetail.keywords.value = null;
            primaryLangCopyDetail.language = langstring;
            primaryLangCopyDetail.canDeleteLocale = true;
            // clear out app trailers from copy
            $scope.clearTrailerDataFromDetail(primaryLangCopyDetail);
            // clear screenshots and handle scaling
            $scope.clearScreenshotsAndHandleScaling(primaryLangCopyDetail);

            //add to versioninfo
            $scope.versionInfo.details.value.unshift(primaryLangCopyDetail);
            $scope.versionInfo.details.value = $scope.addPageLanguageValues($scope.versionInfo.details.value);
            $scope.versionInfo.details.value = $scope.sortDetailsByLocalization($scope.versionInfo.details.value);
            $scope.updateNonLocalizedList();
            $scope.copyMediaTempStorage(primaryLang, langstring);
            if ($scope.hasProviderFeature('VOYAGER')) {
                $scope.copyMediaTempStorage(primaryLang, langstring, true);
            }
            $scope.changeLocView($scope.getLanguageKey(langstring));
        }

        $scope.clearScaledEditability = function(detail) {
            if ($scope.hasProviderFeature('SSENABLED')) {
                var deviceObjs = detail.displayFamilies.value;
                _.each(deviceObjs, function(deviceObj) {
                    if (deviceObj.scaled) {
                        deviceObj.scaled.isEditable = true; // since we're copying from prim lang, this will be false for largest dev.
                    }
                });
            }
        }

        $scope.clearScreenshotsAndHandleScaling = function(detail) {
            if ($scope.hasProviderFeature('SSENABLED')) {
                var deviceObjs = detail.displayFamilies.value;
                _.each(deviceObjs, function(deviceObj) {
                    if (deviceObj.scaled) {
                        deviceObj.scaled.isEditable = true; // since we're copying from prim lang, this will be false for largest dev.
                        deviceObj.scaled.value = true; // make all scaled
                        deviceObj.screenshots.errorKeys = null;
                        deviceObj.screenshots.value.length = 0; // clear screenshots
                    }
                    if ($scope.hasProviderFeature('VOYAGER')) {
                        if (deviceObj.messagesScaled && deviceObj.messagesScreenshots) {
                            deviceObj.messagesScaled.isEditable = true; // since we're copying from prim lang, this will be false for largest dev.
                            deviceObj.messagesScaled.value = true; // make all scaled
                            deviceObj.messagesScreenshots.errorKeys = null;
                            deviceObj.messagesScreenshots.value.length = 0; // clear screenshots
                        }
                    }
                });
            }
        }

        $scope.clearTrailerDataFromDetail = function(detail) {
            if ($scope.hasProviderFeature('SSENABLED')) {
                var deviceObjs = detail.displayFamilies.value;
                _.each(deviceObjs, function(deviceObj) {
                    if (deviceObj.trailer) {
                        deviceObj.trailer.errorKeys = null;
                        deviceObj.trailer.value = null;
                    }
                });
            }
            else {
                if (detail.appTrailers && detail.appTrailers.value) {
                    detail.appTrailers.errorKeys = null; // clear top level error keys.
                    var device, deviceObj;
                    var devices = Object.keys(detail.appTrailers.value);
                    for (var i=0; i<devices.length; i++) {
                        device = devices[i];
                        deviceObj = detail.appTrailers.value[device];
                        // clear out errorKeys and value
                        deviceObj.errorKeys = null;
                        deviceObj.value = null;
                    }
                }
            }
        }

        $scope.copyMediaTempStorage = function(originalLangStr, newLangStr, msgsMedia) {
            var allImages;
            if (msgsMedia) {
                allImages = $scope.allMsgsImages;
            }
            else {
                allImages = $scope.allImages;
            }

            var devices = allImages.getDevicesForLanguage(originalLangStr);
            var group, groupCopy, dev;
            for (var i=0; i<devices.length; i++) {
                dev = devices[i];
                // get the group of snapshots at the primary language
                group = allImages.getGroup(originalLangStr, dev);
                if (group) {
                    groupCopy = group.slice(0); // important to make a copy (using slice)
                    // copy it to the new language group.
                    allImages.setGroup(newLangStr, devices[i], groupCopy);
                }
            }
        }
        $scope.removeLoc = function(key) {
            var tempcurlang = $scope.versionInfo.details.value[$scope.currentLoc].language;
            $scope.versionInfo.details.value.splice(key,1);
            if(key == $scope.currentLoc) {
                $scope.currentLoc = $scope.getLanguageKey($scope.appOverviewData.primaryLocaleCode);
            } else {
                $scope.currentLoc = $scope.getLanguageKey(tempcurlang);
            }
            $scope.updateNonLocalizedList();
            $scope.tempPageContent.appLocScrollTop = true;
            $scope.tempPageContent.showConfirmRemoveLoc = false;
        }
        $scope.confirmRemoveLoc = function(key) {
            $scope.tempPageContent.confirmRemoveLocFor = key;

            //if other platforms exist - use platform language... otherwise use default language...

            var language = $scope.getLanguageStringDisplay($scope.getLanguageString(key), true);

            if ($scope.appOverviewData.platforms.length > 1) {
                $scope.tempPageContent.confirmRemoveLocHeader = $scope.l10n.interpolate('ITC.AppInformation.ConfirmLocRemoval.Header',{'localization':language});
                $scope.tempPageContent.confirmRemoveLocText = $scope.l10n.interpolate('ITC.AppInformation.ConfirmLocRemoval.Text',{'localization':language});
            } else {
               $scope.tempPageContent.confirmRemoveLocHeader = $scope.l10n.interpolate('ITC.AppVersion.ConfirmLocRemoval.Header',{'localization':language});
                $scope.tempPageContent.confirmRemoveLocText = $scope.l10n.interpolate('ITC.AppVersion.ConfirmLocRemoval.Text',{'localization':language});

            }
            $scope.tempPageContent.showConfirmRemoveLoc = true;
        }
        $scope.$watch('currentLoc',function(val, oldVal){
            if (val !== undefined) { // english will make val 0, so check if undefined.
                $scope.updateDevices();
                // update snapshot pics!
                $scope.updateSnapshotDetails(true);
                if ($scope.watchDataExists()) {
                    $scope.watchSectionOpen = $scope.hasWatchData() || $scope.hasBinaryThatSupportsAppleWatch();
                    $scope.updateWatchScreenshots(true);
                }
                if ($scope.hasProviderFeature('SSENABLED') && $scope.hasProviderFeature('VOYAGER')) {
                    $scope.messagesSectionOpen = $scope.hasMsgsData() || $scope.hasBinaryThatSupportsMessages();
                    $scope.updateMsgSnapshotDetails(true);
                }
            }
        });

        /* **************************************************
        Rating Functions
        ************************************************** */
        $scope.checkRatingsErrors = function() {
            if ($scope.modalsDisplay !== undefined) {
                $scope.showRatingsErrorIcon = false;

                if ($scope.versionInfo !== undefined  && $scope.versionInfo.ratings.errorKeys !== null && $scope.versionInfo.ratings.errorKeys.length > 0 && angular.toJson($scope.versionInfo.ratings) === angular.toJson($scope.tempRatings)) {
                    $scope.showRatingsErrorIcon = true;
                /*} else if (!$scope.modalsDisplay.ratingModal && $scope.versionInfo !== undefined  && $scope.versionInfo.ratings !== undefined && $scope.versionInfo.ratings.errorKeys !== null && $scope.versionInfo.ratings.errorKeys.length > 0 && angular.toJson($scope.versionInfo.ratings) === angular.toJson($scope.orignalVersionInfo.ratings)) {
                    $scope.showRatingsErrorIcon = true;*/
                } else {
                    //$scope.tempPageContent.additionalErrors = _.without($scope.tempPageContent.additionalErrors,"ratings");
                    $scope.showRatingsErrorIcon = false;
                }
                if ($scope.versionInfo !== undefined  && $scope.versionInfo.ratings.errorKeys !== null && $scope.versionInfo.ratings.errorKeys.length > 0 && angular.toJson($scope.versionInfo.ratings) === angular.toJson($scope.orignalVersionInfo.ratings)) {
                    $scope.showRatingErroIconOnVersionPage = true;
                } else {
                    $scope.showRatingErroIconOnVersionPage = false;
                }

            }
        }
        $scope.initRatings = function() {
            $scope.checkRatingsErrors();

            $scope.showPromoArt = false;
            $scope.promoArtRequestlink = global_itc_path + "/wa/LCAppPage/viewPromoArt?adamId="+$scope.adamId;


            $scope.worldrating = {};
            $scope.brazil = {};
            $scope.korea = {};
            $scope.uae = {};

            $scope.worldrating.highestlevel = 0;
            $scope.worldrating.rating = "";
            $scope.worldrating.agerange = "";
            $scope.worldrating.canNotBeSold = false;

            $scope.brazil.highestlevel = 0;
            $scope.brazil.rating = "";
            $scope.brazil.categoryRestriction = false;
            $scope.brazil.canNotBeSold = false;

            $scope.uae.categoryRestriction = false;
            $scope.uae.canNotBeSold = false;

            $scope.korea.categoryRestriction = false;
            $scope.korea.canNotBeSold = false;

            $scope.allRatingsExist = true;

            //ensure we have all the data loaded
            if ($scope.versionInfo.ratings && $scope.versionInfo.ratings.nonBooleanDescriptors != undefined && $scope.versionInfo.ratings.booleanDescriptors != undefined) {

                //loop through
                angular.forEach($scope.versionInfo.ratings.nonBooleanDescriptors,function(rating,key){
                    if(rating.level === null) {
                        $scope.allRatingsExist = false;
                        //stop looking up ratings if any of them are null
                    } else {
                        var worldkey = "(World, "+rating.name+", "+rating.level+")";
                        var brazilkey = "(Brazil, "+rating.name+", "+rating.level+")";
                        var uaekey = "(United Arab Emirates, "+rating.name+", "+rating.level+")";
                        var koreakey = "(Korea, Republic Of, "+rating.name+", "+rating.level+")";

                        if ($scope.allRatingsExist && $scope.worldrating.highestlevel < $scope.referenceData.ratingsMap[worldkey].key) {
                            $scope.worldrating.highestlevel = $scope.referenceData.ratingsMap[worldkey].key;
                            $scope.worldrating.rating = $scope.referenceData.ratingsMap[worldkey].value;
                        }
                        if ($scope.allRatingsExist && $scope.brazil.highestlevel < $scope.referenceData.ratingsMap[brazilkey].key) {
                            $scope.brazil.highestlevel = $scope.referenceData.ratingsMap[brazilkey].key;
                            $scope.brazil.rating = $scope.referenceData.ratingsMap[brazilkey].value;
                        }
                        //check for store restrictions or removal
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[brazilkey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[brazilkey].length > 0) {
                                $scope.brazil.categoryRestriction = true;
                            } else {
                                $scope.brazil.canNotBeSold = true;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[uaekey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[uaekey].length > 0) {
                                $scope.uae.categoryRestriction = true;
                            } else {
                                $scope.uae.canNotBeSold = true;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[koreakey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[koreakey].length > 0) {
                                $scope.korea.categoryRestriction = true;
                            } else {
                                $scope.korea.canNotBeSold = true;
                            }
                        }
                    }
                });
                angular.forEach($scope.versionInfo.ratings.booleanDescriptors,function(rating,key){
                    if(rating.level === null) {
                        $scope.allRatingsExist = false;
                        //stop looking up ratings if any of them are null
                    } else {
                        //lookup each rating in ref data
                        var worldkey = "(World, "+rating.name+", "+rating.level+")";
                        var brazilkey = "(Brazil, "+rating.name+", "+rating.level+")";
                        var uaekey = "(United Arab Emirates, "+rating.name+", "+rating.level+")";
                        var koreakey = "(Korea, Republic Of, "+rating.name+", "+rating.level+")";
                        if ($scope.allRatingsExist && $scope.worldrating.highestlevel < $scope.referenceData.ratingsMap[worldkey].key) {
                            $scope.worldrating.highestlevel = $scope.referenceData.ratingsMap[worldkey].key;
                            $scope.worldrating.rating = $scope.referenceData.ratingsMap[worldkey].value;
                        }
                        if ($scope.allRatingsExist && $scope.brazil.highestlevel < $scope.referenceData.ratingsMap[brazilkey].key) {
                            $scope.brazil.highestlevel = $scope.referenceData.ratingsMap[brazilkey].key;
                            $scope.brazil.rating = $scope.referenceData.ratingsMap[brazilkey].value;
                        }
                        //check for store restrictions or removal
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[brazilkey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[brazilkey].length > 0) {
                                if (!$scope.brazil.canNotBeSold) { $scope.brazil.categoryRestriction = true; }
                            } else {
                                $scope.brazil.canNotBeSold = true;
                                $scope.brazil.categoryRestriction = false;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[uaekey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[uaekey].length > 0) {
                                if (!$scope.uae.canNotBeSold) { $scope.uae.categoryRestriction = true; }
                            } else {
                                $scope.uae.canNotBeSold = true;
                                $scope.uae.categoryRestriction = false;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[koreakey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[koreakey].length > 0) {
                                if (!$scope.korea.canNotBeSold) { $scope.korea.categoryRestriction = true; }
                            } else {
                                $scope.korea.canNotBeSold = true;
                                $scope.korea.categoryRestriction = false;
                            }
                        }
                    }

                });
            }

            if ($scope.brazil.categoryRestriction === false && $scope.brazil.canNotBeSold === true) {
                $scope.tempPageContent.showAdditionalRatings = false;
            } else {
                $scope.tempPageContent.showAdditionalRatings = true;
            }
        }
        $scope.showRatingModal = function() {
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;
            $scope.tempRatings = angular.copy($scope.versionInfo.ratings); //make a copy of the ratings to work in the modal
            //initialize whether made for kids is checked or not.
            if ($scope.versionInfo.ratings.ageBandMax !== null && $scope.versionInfo.ratings.ageBandMin !== null) {
                $scope.tempPageContent.ratingDialog.madeForKidsChecked = true;
            } else {
                $scope.tempPageContent.ratingDialog.madeForKidsChecked = false;
            }
            $scope.constructAgeBandList();
            //initialize front end logic for rating display message and agerange selection
            $scope.tempPageContent.ratingDialog.ageBandPlaceholder = $scope.tempRatings.ageBandMin + "_" + $scope.tempRatings.ageBandMax;
            $scope.updateRating();
            $scope.modalsDisplay.ratingModal = true;
        };
        $scope.closeRatingModal = function(shouldSave) {
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            if (shouldSave) {
                if ($scope.brazil.categoryRestriction === false && $scope.brazil.canNotBeSold === true) {
                    $scope.tempPageContent.showAdditionalRatings = false;
                } else {
                    $scope.tempPageContent.showAdditionalRatings = true;
                }

                $scope.versionInfo.ratings = $scope.tempRatings;
            } else {
                $scope.tempRatings = {};
            }
            $timeout(function(){
                $scope.updateBrazilRating();
            });
            $scope.modalsDisplay.ratingModal = false;
        };
        $scope.determinePrivacyPolicyPlaceholder = function(currentLoc) {
            if ($scope.versionInfo !== undefined && $scope.versionInfo.ratings !== undefined && currentLoc !== undefined && currentLoc !== null) {
                if (($scope.versionInfo.ratings.ageBandMin === undefined || $scope.versionInfo.ratings.ageBandMin === null) && $scope.versionInfo.details.value[currentLoc].privacyURL.isRequired === false) {
                    return $scope.l10n.interpolate('ITC.AppVersion.LocalizedSection.UrlPlaceholderOptional');
                } else {
                    return $scope.l10n.interpolate('ITC.AppVersion.LocalizedSection.UrlPlaceholder');
                }
            }
        }
        $scope.updateRating = function() {
            $scope.checkRatingsErrors();

            $scope.worldrating = {};
            $scope.brazil = {};
            $scope.korea = {};
            $scope.uae = {};

            $scope.worldrating.highestlevel = 0;
            $scope.worldrating.rating = "";
            $scope.worldrating.agerange = "";
            $scope.worldrating.canNotBeSold = false;

            $scope.brazil.highestlevel = 0;
            $scope.brazil.rating = "";
            $scope.brazil.categoryRestriction = false;
            $scope.brazil.canNotBeSold = false;

            $scope.uae.categoryRestriction = false;
            $scope.uae.canNotBeSold = false;

            $scope.korea.categoryRestriction = false;
            $scope.korea.canNotBeSold = false;

            $scope.allRatingsExist = true;

            $scope.tempPageContent.ratingDialog.showInfoMessage = false;
            $scope.tempPageContent.ratingDialog.showWarningMessage = false;
            $scope.tempPageContent.ratingDialog.showErrorMessage = false;
            $scope.tempPageContent.ratingDialog.enableDone = false;

            //ensure we have all the data loaded
            if ($scope.tempRatings && $scope.tempRatings.nonBooleanDescriptors != undefined && $scope.tempRatings.booleanDescriptors != undefined) {

                //loop through
                angular.forEach($scope.tempRatings.nonBooleanDescriptors,function(rating,key){
                    if(rating.level === null) {
                        $scope.allRatingsExist = false;
                        //stop looking up ratings if any of them are null
                    } else {
                        var worldkey = "(World, "+rating.name+", "+rating.level+")";
                        var brazilkey = "(Brazil, "+rating.name+", "+rating.level+")";
                        var uaekey = "(United Arab Emirates, "+rating.name+", "+rating.level+")";
                        var koreakey = "(Korea, Republic Of, "+rating.name+", "+rating.level+")";

                        /*console.log("$scope.referenceData.ratingsMap[worldkey].key " + $scope.referenceData.ratingsMap[worldkey].key);
                        console.log("$scope.referenceData.ratingsMap ",$scope.referenceData.ratingsMap);
                        console.log("World key: " + worldkey);
                        console.log("rating.name "+ rating.name);
                        console.log("rating.level "+ rating.level);*/
                        if ($scope.allRatingsExist && $scope.worldrating.highestlevel < $scope.referenceData.ratingsMap[worldkey].key) {
                            $scope.worldrating.highestlevel = $scope.referenceData.ratingsMap[worldkey].key;
                            $scope.worldrating.rating = $scope.referenceData.ratingsMap[worldkey].value;
                        }
                        if ($scope.allRatingsExist && $scope.brazil.highestlevel < $scope.referenceData.ratingsMap[brazilkey].key) {
                            $scope.brazil.highestlevel = $scope.referenceData.ratingsMap[brazilkey].key;
                            $scope.brazil.rating = $scope.referenceData.ratingsMap[brazilkey].value;
                        }
                        //check for store restrictions or removal
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[brazilkey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[brazilkey].length > 0) {
                                $scope.brazil.categoryRestriction = true;
                            } else {
                                $scope.brazil.canNotBeSold = true;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[uaekey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[uaekey].length > 0) {
                                $scope.uae.categoryRestriction = true;
                            } else {
                                $scope.uae.canNotBeSold = true;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[koreakey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[koreakey].length > 0) {
                                $scope.korea.categoryRestriction = true;
                            } else {
                                $scope.korea.canNotBeSold = true;
                            }
                        }
                    }
                });
                angular.forEach($scope.tempRatings.booleanDescriptors,function(rating,key){
                    if(rating.level === null) {
                        $scope.allRatingsExist = false;
                        //stop looking up ratings if any of them are null
                    } else {
                        //lookup each rating in ref data
                        var worldkey = "(World, "+rating.name+", "+rating.level+")";
                        var brazilkey = "(Brazil, "+rating.name+", "+rating.level+")";
                        var uaekey = "(United Arab Emirates, "+rating.name+", "+rating.level+")";
                        var koreakey = "(Korea, Republic Of, "+rating.name+", "+rating.level+")";
                        if ($scope.allRatingsExist && $scope.worldrating.highestlevel < $scope.referenceData.ratingsMap[worldkey].key) {
                            $scope.worldrating.highestlevel = $scope.referenceData.ratingsMap[worldkey].key;
                            $scope.worldrating.rating = $scope.referenceData.ratingsMap[worldkey].value;
                        }
                        if ($scope.allRatingsExist && $scope.brazil.highestlevel < $scope.referenceData.ratingsMap[brazilkey].key) {
                            $scope.brazil.highestlevel = $scope.referenceData.ratingsMap[brazilkey].key;
                            $scope.brazil.rating = $scope.referenceData.ratingsMap[brazilkey].value;
                        }
                        //check for store restrictions or removal
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[brazilkey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[brazilkey].length > 0) {
                                if (!$scope.brazil.canNotBeSold) { $scope.brazil.categoryRestriction = true; }
                            } else {
                                $scope.brazil.canNotBeSold = true;
                                $scope.brazil.categoryRestriction = false;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[uaekey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[uaekey].length > 0) {
                                if (!$scope.uae.canNotBeSold) { $scope.uae.categoryRestriction = true; }
                            } else {
                                $scope.uae.canNotBeSold = true;
                                $scope.uae.categoryRestriction = false;
                            }
                        }
                        if ($scope.allRatingsExist && $scope.referenceData.disabledInStoreRatings[koreakey] !== undefined) {
                            if ($scope.referenceData.disabledInStoreRatings[koreakey].length > 0) {
                                if (!$scope.korea.canNotBeSold) { $scope.korea.categoryRestriction = true; }
                            } else {
                                $scope.korea.canNotBeSold = true;
                                $scope.korea.categoryRestriction = false;
                            }
                        }
                    }

                });
            }

            if ($scope.showRatingsErrorIcon) {
                $scope.tempPageContent.ratingDialog.enableDone = false;
            }

            //set raings to display
            if ($scope.allRatingsExist) {
                $scope.tempRatings.countryRatings.Brazil = $scope.brazil.rating;
                $scope.tempRatings.rating = $scope.worldrating.rating;
                //show info message if we can sell in store and there are no category or store restrictions...
                if ($scope.tempRatings.rating != "No Rating" && !$scope.korea.canNotBeSold && !$scope.korea.categoryRestriction && !$scope.uae.canNotBeSold && !$scope.uae.categoryRestriction && !$scope.brazil.canNotBeSold && !$scope.brazil.categoryRestriction) { // will be sold in all stores - no restricionts
                    $scope.tempPageContent.ratingDialog.showInfoMessage = true;
                    $scope.tempPageContent.ratingDialog.showWarningMessage = false;
                    $scope.tempPageContent.ratingDialog.showErrorMessage = false;
                    $scope.tempPageContent.ratingDialog.enableDone = true;
                //show warning message if there are category restrictions for some stores
                } else if ($scope.tempRatings.rating != "No Rating" && ($scope.korea.canNotBeSold || $scope.korea.categoryRestriction || $scope.uae.canNotBeSold || $scope.uae.categoryRestriction || $scope.brazil.canNotBeSold || $scope.brazil.categoryRestriction)) {
                    $scope.tempPageContent.ratingDialog.showInfoMessage = false;
                    $scope.tempPageContent.ratingDialog.showWarningMessage = true;
                    $scope.tempPageContent.ratingDialog.showErrorMessage = false;
                    $scope.tempPageContent.ratingDialog.enableDone = true;

                } else {
                    $scope.tempPageContent.ratingDialog.showInfoMessage = false;
                    $scope.tempPageContent.ratingDialog.showWarningMessage = false;
                    $scope.tempPageContent.ratingDialog.showErrorMessage = true;
                    $scope.tempPageContent.ratingDialog.enableDone = true;//false;
                }

                //create dropdown list
                $scope.tempPageContent.ratingDialog.ageBandRatings = [];
                if ($scope.worldrating.highestlevel === 2) {
                    $scope.tempPageContent.ratingDialog.ageBandRatings.push($scope.tempPageContent.ageBandRatings[$scope.tempPageContent.ageBandRatings.length-1]);
                } else if ($scope.worldrating.highestlevel === 1) {
                    $scope.tempPageContent.ratingDialog.ageBandRatings = angular.copy($scope.tempPageContent.ageBandRatings);
                } else {
                    $scope.tempPageContent.ratingDialog.ageBandRatings = [];
                }

                //does our agebandselection still make sense?
                $scope.ageBandSelect = $scope.tempPageContent.ratingDialog.ageBandRatings.map(function(e) { return e.internalName; }).indexOf($scope.tempPageContent.ratingDialog.ageBandPlaceholder);
                //if (_.indexOf($scope.tempPageContent.ratingDialog.ageBandRatings,$scope.tempRatings.ageBand) < 0 || !$scope.tempPageContent.ratingDialog.madeForKidsChecked) {
                if ($scope.ageBandSelect < 0 || !$scope.tempPageContent.ratingDialog.madeForKidsChecked) {
                    $scope.tempRatings.ageBandMin = null;
                    $scope.tempRatings.ageBandMax = null;
                    $scope.tempPageContent.ratingDialog.ageBandPlaceholder = null;
                } else {
                    $scope.tempRatings.ageBandMin = $scope.tempPageContent.ratingDialog.ageBandRatings[$scope.ageBandSelect].minAge;
                    $scope.tempRatings.ageBandMax = $scope.tempPageContent.ratingDialog.ageBandRatings[$scope.ageBandSelect].maxAge;
                    $scope.tempPageContent.ratingDialog.ageBandPlaceholder = $scope.tempPageContent.ratingDialog.ageBandRatings[$scope.ageBandSelect].internalName;
                }

                //last check - change enableDone to false if madeforkids is shown but no value is given
                if ($scope.worldrating.highestlevel < 3 && $scope.tempPageContent.ratingDialog.madeForKidsChecked && ($scope.tempPageContent.ratingDialog.ageBandPlaceholder === undefined || $scope.tempPageContent.ratingDialog.ageBandPlaceholder === null)) {
                        $scope.tempPageContent.ratingDialog.enableDone = false;
                } else if ($scope.worldrating.highestlevel >= 3) {
                    $scope.tempRatings.ageBandMin = null;
                    $scope.tempRatings.ageBandMax = null;
                    $scope.tempPageContent.ratingDialog.ageBandPlaceholder = null;
                }
                if ($scope.tempRatings.ageBandMin != null && $scope.tempRatings.ageBandMin !== "undefined" && $scope.tempRatings.ageBandMin !== "") {
                    $scope.tempPageContent.ratingDialog.agebandhasvalue = true;
                } else {
                    $scope.tempPageContent.ratingDialog.agebandhasvalue = false;
                    $scope.tempPageContent.ratingDialog.ageBandPlaceholder = null;
                }

            }
        };
        $scope.updateBrazilRating = function() {
            $scope.brazilClass = $filter('brazilRatingClass')($scope.versionInfo.ratings.countryRatings.Brazil);
        }
        $scope.constructAgeBandList = function() {
            $scope.tempPageContent.ageBandRatings = angular.copy($scope.referenceData.ageBands);
            angular.forEach($scope.tempPageContent.ageBandRatings,function(ratingItem,ratingArraykey){
                ratingItem.loc = "ITC.apps.ratings.ageBand." + ratingItem.minAge + "_" + ratingItem.maxAge;
            });
        }

        /* **************************************************
        IAP Functions
        ************************************************** */
        $scope.checkAddOns = function() {
            $scope.tempPageContent.addOns.submitNextVersion = [];
            if ($scope.versionInfo.submittableAddOns != undefined && $scope.versionInfo.submittableAddOns != null) {
                //loop through submittable addons collect list of those set to "true"
                angular.forEach($scope.versionInfo.submittableAddOns.value,function(value,key){
                    if (value.itcsubmitNextVersion) {
                        $scope.tempPageContent.addOns.submitNextVersion.push({'referenceName':value.referenceName,'vendorId':value.vendorId,'addOnType':value.addOnType});
                    }
                });
            }
            if ($scope.tempPageContent.addOns.sortorder === undefined || $scope.tempPageContent.addOns.sortorder === "")
            {
                $scope.tempPageContent.addOns.sortorder = "referenceName"; //set default sort
            }
            if ($scope.tempPageContent.addOns.reverse === undefined || $scope.tempPageContent.addOns.reverse === "")
            {
                $scope.tempPageContent.addOns.reverse = true; //set default sort
            }
            $scope.tempPageContent.addOns.reverse = !$scope.tempPageContent.addOns.reverse;
            $scope.sortIapColumns($scope.tempPageContent.addOns.sortorder);
        }
        $scope.showIapModal = function() {
            //create special list for modal
            $scope.tempPageContent.addOns.modal.tempAddOnsList = [];
            angular.forEach($scope.versionInfo.submittableAddOns.value,function(value,key){
                if (value.itcsubmitNextVersion) {
                    $scope.tempPageContent.addOns.modal.tempAddOnsList.push({'referenceName':value.referenceName,'vendorId':value.vendorId,'addOnType':value.addOnType,'isSelected':true});
                } else {
                    $scope.tempPageContent.addOns.modal.tempAddOnsList.push({'referenceName':value.referenceName,'vendorId':value.vendorId,'addOnType':value.addOnType,'isSelected':false});
                }
            });
            if ($scope.tempPageContent.addOns.modal.sortorder === undefined || $scope.tempPageContent.addOns.modal.sortorder === "")
            {
                $scope.tempPageContent.addOns.modal.sortorder = "referenceName"; //set default sort
            }
            if ($scope.tempPageContent.addOns.modal.reverse === undefined || $scope.tempPageContent.addOns.modal.reverse === "")
            {
                $scope.tempPageContent.addOns.modal.reverse = true; //set default sort
            }
            $scope.tempPageContent.addOns.modal.reverse = !$scope.tempPageContent.addOns.modal.reverse
            $scope.sortIapColumns($scope.tempPageContent.addOns.modal.sortorder,true);
            $scope.modalsDisplay.iapModal = true;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;
            $scope.tempPageContent.IAPmodal.doneButtonDisabled = true;
            $scope.tempPageContent.addOns.modal.tempAddOnsListOnLoad = angular.copy($scope.tempPageContent.addOns.modal.tempAddOnsList);
        }
        $scope.$watch('tempPageContent.addOns.modal.tempAddOnsList',function(){
            // console.log("running...");
            // console.log("test",$scope.tempPageContent.addOns.modal.tempAddOnsListOnLoad,$scope.tempPageContent.addOns.modal.tempAddOnsList);
            if(angular.toJson($scope.tempPageContent.addOns.modal.tempAddOnsList) !== angular.toJson($scope.tempPageContent.addOns.modal.tempAddOnsListOnLoad)) {
                $scope.tempPageContent.IAPmodal.doneButtonDisabled = false;
            } else {
                $scope.tempPageContent.IAPmodal.doneButtonDisabled = true;
            }
        },true);
        $scope.closeIapModal = function(value) {
            if (value) {
                //loopthrough special list and turn on addons where appropriate
                angular.forEach($scope.tempPageContent.addOns.modal.tempAddOnsList,function(value,key){
                    if (value.isSelected) {
                        //find twin in main version info and set to true...
                        angular.forEach($scope.versionInfo.submittableAddOns.value,function(versValue,versKey){
                            if (value.vendorId === versValue.vendorId) {
                                versValue.itcsubmitNextVersion = true;
                            }
                        });
                    } else {
                        angular.forEach($scope.versionInfo.submittableAddOns.value,function(versValue,versKey){
                            if (value.vendorId === versValue.vendorId) {
                                versValue.itcsubmitNextVersion = false;
                            }
                        });
                    }
                });
            } else {
                $scope.tempPageContent.addOns.modal.tempAddOnsList = [];
            }
            $scope.checkAddOns();
            $scope.modalsDisplay.iapModal = false;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
        }
        $scope.chanageIapOrder = function (isModal) {
            isModal = typeof isModal !== 'undefined' ? isModal : false;
            if (isModal) {
                $scope.tempPageContent.addOns.modal.tempAddOnsList = $filter('orderBy')($scope.tempPageContent.addOns.modal.tempAddOnsList, $scope.tempPageContent.addOns.modal.sortorder,$scope.tempPageContent.addOns.modal.reverse);
                $scope.tempPageContent.addOns.modal.tempAddOnsListOnLoad = $filter('orderBy')($scope.tempPageContent.addOns.modal.tempAddOnsListOnLoad, $scope.tempPageContent.addOns.modal.sortorder,$scope.tempPageContent.addOns.modal.reverse);
            } else {
                $scope.tempPageContent.addOns.submitNextVersion = $filter('orderBy')($scope.tempPageContent.addOns.submitNextVersion, $scope.tempPageContent.addOns.sortorder,$scope.tempPageContent.addOns.reverse);
            }
        };
        $scope.sortIapColumns = function(fieldname,isModal) {
            isModal = typeof isModal !== 'undefined' ? isModal : false;
            if (isModal) {
                $scope.tempPageContent.addOns.modal.reverse = $scope.tempPageContent.addOns.modal.sortorder!==fieldname?false:$scope.tempPageContent.addOns.modal.reverse;
                $scope.tempPageContent.addOns.modal.sortorder = fieldname;
                $scope.chanageIapOrder(true);
                $scope.tempPageContent.addOns.modal.reverse = !$scope.tempPageContent.addOns.modal.reverse;
            } else {
                $scope.tempPageContent.addOns.reverse = $scope.tempPageContent.addOns.sortorder!==fieldname?false:$scope.tempPageContent.addOns.reverse;
                $scope.tempPageContent.addOns.sortorder = fieldname;
                $scope.chanageIapOrder();
                $scope.tempPageContent.addOns.reverse = !$scope.tempPageContent.addOns.reverse;
            }
        };
        $scope.columnIapClass = function(fieldname,isModal) {
            if ($scope.tempPageContent !== undefined) {
                isModal = typeof isModal !== 'undefined' ? isModal : false;
                if (isModal) {
                    return $scope.tempPageContent.addOns.modal.sortorder===fieldname?'sorted':'';
                } else {
                    return $scope.tempPageContent.addOns.sortorder===fieldname?'sorted':'';
                }
            }
        }
        $scope.removeAddOn = function(vendorid) {
            angular.forEach($scope.versionInfo.submittableAddOns.value,function(value,key){
                if (vendorid === value.vendorId) {
                    value.itcsubmitNextVersion = false;
                }
            });
            $scope.checkAddOns();
        }
        $scope.showIAPSection = function() {
            if ($scope.versionInfo !== undefined) {
                if ($scope.versionInfo.submittableAddOns !== null && $scope.versionInfo.submittableAddOns.value !== null && $scope.versionInfo.submittableAddOns.value.length > 0) {
                    return true;
                } else if ($scope.versionInfo.submittableAddOns.errorKeys !== null && $scope.versionInfo.submittableAddOns.errorKeys.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        /* **************************************************
        Mac Entitlement Functions
        ************************************************** */
        $scope.updateEntitlementsList = function() {
            //full list here: $scope.referenceData.macOSEntitlements
            $scope.tempPageContent.entitlements.requiredList = []; //_.without($scope.referenceData.macOSEntitlements,false);
            $scope.tempPageContent.entitlements.nonRequiredList = []; //_.without($scope.referenceData.macOSEntitlements,true);
            angular.forEach($scope.referenceData.macOSEntitlements,function(value,key){
                //check if exists in appversion info...
                var testHasBeenChosen = []; //_.findWhere($scope.versionInfo.appReviewInfo.entitlementUsages.value,{value:{'entitlement':key}});
                angular.forEach($scope.versionInfo.appReviewInfo.entitlementUsages.value,function(loopvalue,loopkey){
                    if (loopvalue.value.entitlement === key) {
                        testHasBeenChosen.push(key);
                    }
                });
                if (testHasBeenChosen.length < 1) {
                    if (value) {
                        $scope.tempPageContent.entitlements.requiredList.push(key);
                    } else {
                        $scope.tempPageContent.entitlements.nonRequiredList.push(key);
                    }
                }
            });
        }
        $scope.addEntitlement = function(entitlement) {
            //get true/false is optional for this entitlement
            var entitlementToAdd = _.findWhere($scope.referenceData.macOSEntitlements,{'entitlement':entitlement});
            $scope.versionInfo.appReviewInfo.entitlementUsages.value.push({isEditable: true, value:{'entitlement':entitlement,'isOptional':entitlementToAdd,'justification':''}});
            $scope.updateEntitlementsList();
            //console.log("version info now: ",$scope.versionInfo);
        }
        $scope.removeEntitlement = function(entitlement) {
           $scope.versionInfo.appReviewInfo.entitlementUsages.value = _.reject($scope.versionInfo.appReviewInfo.entitlementUsages.value,function(ent){
                //console.log("ent.entitlement " + ent.entitlement);
                if (ent.value.entitlement === entitlement) {
                    return true;
                } else {
                    return false;
                }
           });
           $scope.updateEntitlementsList();
        }

        var loadBuildCandidates = function() {

            $$.buildListLoaded = false;

            return appDetailsService
                .getBuildCandidates( $$.adamId, $$.uniqueId )
                .then( function( data ) {
                    processBuildsList( data );
                    $$.buildListLoaded = true;
                });
        };

        var processBuildsList = function( data ) {

            if (!$$.buildList && typeof data === 'object')
                $$.buildList = data.data;

            if (!$$.buildList) {
                loadBuildCandidates();
                return;
            }

            if (!$$.versionInfo) {
                return;
            }

            // Needed for file size modal tooltip, to modify the text shown adjacent to every build
            $$.buildList.builds.forEach( function( build ) {
                build.isBeingShownOnVersionPage = true;
            });

            //set chosen build to current build if it exists
            if ($$.versionInfo.preReleaseBuildVersionString.value !== null && $$.versionInfo.preReleaseBuildVersionString.value !== "") {
                angular.forEach( $$.buildList.builds, function( build, key ) {
                    if ( build.buildVersion === $$.versionInfo.preReleaseBuildVersionString.value ) {
                        $$.tempPageContent.buildModal.chosenBuild = key + "";
                        return;
                    }
                });
            }
            else { $$.tempPageContent.buildModal.chosenBuild = ""; }
        }

        /* **************************************************
        Build Functions
        ************************************************** */
        $scope.showBuildPicker = function() {
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;
            $scope.modalsDisplay.buildsModal = true;
            $scope.buildListLoaded = false;

            // Load again to get fresh data <rdar://problem/23218132>
            loadBuildCandidates();
        }
        $scope.closeBuildModal = function(saving) {
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            if (saving) {
                //move copy of currently selected build to main versionInfo JSON...
                var selectedBuild = $scope.buildList.builds[$scope.tempPageContent.buildModal.chosenBuild];
                $scope.versionInfo.preReleaseBuildTrainVersionString = selectedBuild.trainVersion;
                $scope.versionInfo.preReleaseBuildVersionString.value = selectedBuild.buildVersion;
                $scope.versionInfo.preReleaseBuildUploadDate = selectedBuild.uploadDate;
                $scope.versionInfo.preReleaseBuildIconUrl = selectedBuild.iconUrl;
                $scope.versionInfo.preReleaseBuildIsLegacy = false;
                $scope.updateAtvIcons(selectedBuild);
                $scope.updateMsgsIcons(selectedBuild);

                // Just so the atv section shows - doesn't effect backend.
                if ($scope.isTVPlatform()) {
                    $scope.versionInfo.largeAppIcon = selectedBuild.largeAppIcon;
                    $scope.versionInfo.atvHomeScreenIcon = selectedBuild.atvHomeScreenIcon;
                    $scope.versionInfo.atvTopShelfIcon = selectedBuild.atvTopShelfIcon;
                }
                if ($scope.hasProviderFeature('VOYAGER')) {
                    if ($scope.versionInfo.preReleaseBuild === null) $scope.versionInfo.preReleaseBuild = {};
                    $scope.versionInfo.preReleaseBuild.iconAssetToken = selectedBuild.iconAssetToken;
                    $scope.versionInfo.preReleaseBuild.messagesIconAssetToken = selectedBuild.messagesIconAssetToken;
                    $scope.versionInfo.preReleaseBuild.watchIconAssetToken = selectedBuild.watchIconAssetToken;
                    $scope.versionInfo.preReleaseBuild.launchProhibited = selectedBuild.launchProhibited;
                    $scope.versionInfo.preReleaseBuild.hasMessagesExtension = selectedBuild.hasMessagesExtension;
                    $scope.versionInfo.preReleaseBuild.hasStickers = selectedBuild.hasStickers;
                }

                $scope.modalsDisplay.buildsModal = false;
            } else {
                $scope.modalsDisplay.buildsModal = false;
            }
            $scope.tempPageContent.buildModal.chosenBuild = "";
        }

        $scope.removeBuild = function() {
            $scope.versionInfo.preReleaseBuildTrainVersionString = null;
            $scope.versionInfo.preReleaseBuildVersionString.value = null;
            $scope.versionInfo.preReleaseBuildUploadDate = null;
            $scope.versionInfo.preReleaseBuildIconUrl = null;
            $scope.versionInfo.preReleaseBuildIsLegacy = false;
            $scope.clearAtvIcons();
            $scope.clearMsgsIcons();
        }

        $scope.getBuildLink = function() {
            if ($scope.versionInfo !== undefined) {
                if ($scope.versionInfo.preReleaseBuildIsLegacy) {
                    //if version is
            /*if ($stateParams.ver && $stateParams.ver === "cur") {
                $scope.isLiveVersion = true;
            } else if ($rootScope.appPageHeader.inFlightVersion === null) {
                $scope.isLiveVersion = true;
            } else {
                $scope.isInFlightVersion = true;
            }*/
                    var versionstring="&versionString=latest";

                    if ($state.current.name === "app_overview.store.versioninfo_deliverable") {
                        versionstring = "&versionString=live"
                    }

                    return global_itc_path + "/wa/LCAppPage/viewBinaryDetails?adamId="+$scope.adamId+versionstring;
                } else {
                    var platform = $scope.versionInfo.platform,
                        trainVer = $scope.versionInfo.preReleaseBuildTrainVersionString,
                        buildVer = $scope.versionInfo.preReleaseBuildVersionString.value;

                    return global_itc_home_url + '/app/'+$scope.adamId+'/activity/'+platform+'/builds/'+trainVer+'/'+buildVer+'/details';
                }
            }
        }
        $scope.getBuildStatus = function(buildState) {
            return $scope.l10n.interpolate('ITC.apps.betaStatus.'+buildState);
        }

        $scope.hasBuildsAvailableForPicker = function() {
            return ($$.buildList && $$.buildList.builds && $$.buildList.builds.length > 0);
        }

        $scope.shouldShowBuildPickerIcon = function() {
            if ($scope.versionInfo !== undefined) {
                if (($scope.versionInfo.preReleaseBuildVersionString.value === null || $scope.versionInfo.preReleaseBuildVersionString.value === '') && $scope.versionInfo.preReleaseBuildVersionString.isEditable && $scope.versionInfo.preReleaseBuildsAreAvailable) {
                    return true;
                } else {
                    return false;
                }
            }
            /*if ( $scope.versionInfo !== undefined ) {
                var versionString = deep( $$.versionInfo, 'preReleaseBuildVersionString.value' );
                return (
                    ((versionString === null || versionString === '') && $scope.versionInfo.preReleaseBuildVersionString.isEditable)
                    && $scope.hasBuildsAvailableForPicker()
                )
            }
            return false;*/
        }

        // Fired by the "this build exceeds 100MB" tooltip, and relays the requested build into the displayProcessedFileSizeModal
        $$.$on( 'displayProcessedFileSizeModal', function( event, data ) {

            $$.buildForFileSizeModal = data.build;

            $timeout( function() {
                $$.modals.displayProcessedFileSizes = true;
                $scope.closeBuildModal(false);
            });

        });

        /* **************************************************
        Screenshot Functions
        ************************************************** */
        $scope.loadAppVersionReferenceData = function() {
            appVersionReferenceDataService.async().then(function(data) {
                $scope.appVersionReferenceData = data.data;
            });
        }
        // Sets the num of videos to 0 or 1 depending on the appPreviewEnabled property.
        $scope.setNumVideos = function() {
            var hasLegalGeos = $scope.referenceData.legalAppPreviewGeos[$scope.currentDevice];
            if (hasLegalGeos && $scope.referenceData.appPreviewEnabled) {
                $scope.numVideos = 1;
            }
            else {
                $scope.numVideos = 0; // show no video
            }
        };

        $scope.isVideoEnabled = function() {
            return $scope.numVideos > 0;
        };

        // First look for the error in mediaData... errorInPopup, then look in allImages errors
        $scope.getDropwellError = function(loc, device, msgsMedia) {
            if (!$scope.tempPageContent || !$scope.tempPageContent.mediaData) {
                return null;
            }
            var error = $scope.getMediaDataValue(loc, device, msgsMedia, "errorInPopup");
            if (!error) {
                var localeCode = $scope.getLanguageString(loc);
                if (msgsMedia) {
                    error = $scope.allMsgsImages.getLanguageDeviceSpecificError(localeCode, device);
                }
                else {
                    error = $scope.allImages.getLanguageDeviceSpecificError(localeCode, device); // TBD: look for video errors too
                }
            }
            return error;
        }

        // var localeCode = $scope.getLanguageString(loc);
        //$scope.allImages.clearGeneralErrors(localeCode, device)

        // Initializes some variables for app trailer directives. Returns true if media already existed before this call.
        $scope.initSnapshotDetails = function() {
            this.lastLoc = null;
            this.lastDev = null;

            var mediaExisted = (($scope.previewImages && $scope.previewImages.length > 0) || ($scope.tempPageContent.previewVideos && $scope.tempPageContent.previewVideos.length > 0));

            $scope.watchSectionOpen = true;
            $scope.tempPageContent.appPreviewSnapshotShowing = true;
            $scope.numImagesNotReady = 0;
            $scope.numWatchImagesNotReady = 0;
            $scope.numImages = 5; // max num of images
            $scope.numVideos = 0;   // this is updated in setNumVideos once we have referenceData
            $scope.previewImages = new Array(); // a pointer to the images at the current location/device
            $scope.tempPageContent.previewVideos = new Array();  // a pointer to the videos at the current location/device
            $scope.watchImages = new Array(); // a pointer to the watch images

            $scope.imageUploadsInProgress = 0;

            // A generic object to hold groups of language/device combinations.
            var group = function() {

                // returns true if this group was already initialized
                this.initialized = function(language, device) {
                    return (this[language] && this[language][device] && this[language][device].arr);
                };

                this.clearGroup = function(language, device) {
                    if (this[language]) {
                        if (this[language][device]) {
                            this[language][device].arr = null;
                        }
                        this[language][device] = null;
                    }
                };

                // Initializes the group with an empty array and returns it.
                // Won't hurt to re-initialize.
                this.initializeGroup = function(language, device) {
                    if (this[language]) {
                        if (!this[language][device]) {
                            this[language][device] = {};
                        }
                        if (!this[language][device].arr) {
                            this[language][device].arr = new Array();
                        }
                    }
                    else {
                        this[language] = {};
                        this[language][device] = {};
                        this[language][device].arr = new Array();
                    }
                    return this[language][device].arr;
                };

                // gets the group
                this.getGroup = function(language, device) {
                    if (this[language] && this[language][device]) {
                        return this[language][device].arr;
                    }
                    else {
                        return null;
                    }
                };

                this.setGroup = function(language, device, array) {
                    if (!this[language]) {
                        this[language] = {};
                    }
                    if (!this[language][device]) {
                        this[language][device] = {};
                    }

                    this[language][device].arr = array;
                };

                // return true if there's an error in the given group (in a specific snapshot/video)
                this.hasErrorsInGroup = function(language, device) {
                    var snapshots = this.getGroup(language, device);
                    if (snapshots) {
                        for (var i = 0; i < snapshots.length; i++) {
                            if (snapshots[i].error) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                // Returns an array of devices at the given language.
                this.getDevicesForLanguage = function(language) {
                    var deviceArr = new Array();
                    var langArr = this[language];
                    if (langArr) {
                        for (var key in langArr) {
                            if (key === 'length' || key=== 'error' || !langArr.hasOwnProperty(key)) continue;
                            deviceArr.push(key);
                        }
                    }
                    return deviceArr;
                };

                // set an error for the snapshot at the given sortOrder, for the given group (language/device)
                this.setError = function(language, locKey, device, sortOrder, error) {
                    var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex(device, locKey);

                    var group = this.getGroup(language, device);

                    if (group && (group.length > (sortOrder-startSortOrderIndex))) {
                        group[sortOrder-startSortOrderIndex].error = error;
                    }
                };

                // set a general error at the language/device level (not for a specific snapshot as in this.setError)
                this.setLanguageDeviceSpecificError = function(language, device, error) {
                    if (!this[language]) {
                        this[language] = {};
                    }
                    if (!this[language][device]) {
                        this[language][device] = {};
                    }
                    this[language][device].error = error;

                };

                this.getLanguageDeviceSpecificError = function(language, device) {
                    if (this[language] && this[language][device]) {
                        return this[language][device].error;
                    }
                    return null;
                };

                this.hasLanguageDeviceSpecificError = function(language, device) {
                    return (this[language] && this[language][device] && this[language][device].error);
                };

                // set a general error at the lanuage level (for all devices)
                this.setLanguageSpecificError = function(language, error) {
                    if (!this[language]) {
                        this[language] = {};
                    }
                    this[language].error = error;
                };

                this.hasLanguageSpecificError = function(language) {
                    return (this[language] && this[language].error);
                };

                this.getLanguageSpecificError = function(language) {
                    if (this[language]) {
                        return this[language].error;
                    }
                    return null;
                };

                this.clearGeneralErrors = function(language, device) {
                    this.setLanguageSpecificError(language, null);
                    this.setLanguageDeviceSpecificError(language, device, null);
                };

            };

            // One object to hold all snapshots for all language/device combinations and one to
            // hold all videos for all language/device combinations
            $scope.allImages = new group();
            $scope.tempPageContent.allVideos = new group();

            if ($scope.hasProviderFeature('VOYAGER')) {
                $scope.allMsgsImages = new group();
                $scope.tempPageContent.allMsgsVideos = new group();
            }

            $scope.tempPageContent.showModal = false;
            $scope.progress = -1;
            $scope.fileReaderSupported = window.FileReader != null;
            $scope.uploadRightAway = true;

            $scope.snapshotInfo = {};
            if ($scope.versionInfo) {
                $scope.snapshotInfo.error = $scope.getErrorsInGroup($scope.currentLoc, $scope.currentDevice);
                $scope.snapshotInfo.watchError = $scope.getErrorsInGroup($scope.currentLoc, "watch");
            }
            else {
                $scope.snapshotInfo.error = false;
                $scope.snapshotInfo.watchError = false;
            }
            $scope.snapshotInfo.showWatchImagesInSlideShow = false;

            $scope.sortableOptions2  = {
                //connectWith: '#dragDropRedo',
                placeholder: 'screenshotZonePlaceholder',
                forcePlaceholderSize: true,
                //helper: "clone",
                //'ui-floating': true, // no
                tolerance: "pointer",
                handle: "div.zone",
                //disabled: false,
                sort: function(event, ui) {
                    // moved everything to start()
                },
                start: function(event, ui) {
                    //log("start");
                    var zone = ui.item.find(".zone");
                    var tray = $(event.target).closest(".dropTray");

                    if (!$scope.isScaled(ui)) {
                        var h = zone.height();
                        var w = zone.width();
                        var marginTop = zone.css("margin-top");
                        ui.placeholder.height(h);
                        ui.placeholder.width(w);
                        ui.placeholder.css("margin-top", marginTop);

                        var i = Array.prototype.indexOf.call(event.target.children, ui.item[0]);
                        $scope.startDragIndex = i;

                        // adds blue border
                        tray.addClass("midDrag");
                    }
                    else {
                        ui.placeholder.height(0);
                        ui.placeholder.width(0);
                        ui.placeholder.removeClass("screenshotZonePlaceholder");

                        tray.addClass("notAllowed");
                    }
                },
                stop: function(event, ui) {
                    //log("stop");
                    var zone = ui.item.find(".zone");
                    var tray = $(event.target).closest(".dropTray");
                    if (!$scope.isScaled(ui)) {

                        var parentEl = zone.parent();
                        var device = parentEl.attr("device");
                        var isMsgsMedia = parentEl.attr("is-msgs-media");

                        var i = Array.prototype.indexOf.call(event.target.children, ui.item[0]);
                        if ($scope.startDragIndex !== i) {
                            $scope.moveImageDev($scope.startDragIndex, i, device, isMsgsMedia);
                        }

                        // removes blue border
                        tray.removeClass("midDrag");
                    }
                    else {
                        tray.removeClass("notAllowed");
                    }
                },
                // update is triggered right before stop. This is the place to cancel sorting.
                update: function(e, ui) {
                    //log("update");
                    if ($scope.isScaled(ui)) {
                        ui.item.sortable.cancel();
                    }
                },
                /*
                // change is triggered during sorting, but only when the DOM position has changed.
                change: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    console.log("CHANGE");
                },*/
            };

            $scope.isScaled = function(ui) {
                    var scaled = false;
                    if ($scope.hasProviderFeature('SSENABLED')) {
                        var zone = ui.item.find(".zone");
                        var parentEl = zone.parent();
                        var device = parentEl.attr("device");
                        scaled = $scope.areImagesOverridden($scope.currentLoc, device);
                    }
                    return scaled;
            };

            $scope.sortableOptions  = {
                //connectWith: '#dragDropRedo',
                placeholder: 'screenshotZonePlaceholder',
                forcePlaceholderSize: true,
                //helper: "clone",
                //'ui-floating': true, // no
                tolerance: "pointer",
                handle: "div.zone",
                //disabled: false,
                sort: function(event, ui) {
                    /*if (!$scope.areImagesEditable()) {
                        //$(document).find(".dropTray .sortablePart").sortable( "destroy" );
                        //$(this).disable();
                        $scope.sortableOptions.disabled = true;
                    }
                    else {*/
                    var zone = ui.item.find(".zone");
                    var h = zone.height();
                    var w = zone.width();
                    var marginTop = zone.css("margin-top");
                    ui.placeholder.height(h);
                    ui.placeholder.width(w);
                    ui.placeholder.css("margin-top", marginTop);
                    //}
                },
                start: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    var i = Array.prototype.indexOf.call(event.target.children, ui.item[0]);
                    $scope.startDragIndex = i;

                    // adds blue border
                    var tray = $(event.target).closest(".dropTray");
                    tray.addClass("midDrag");
                },
                stop: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    var i = Array.prototype.indexOf.call(event.target.children, ui.item[0]);
                    if ($scope.startDragIndex !== i) {
                        $scope.moveImage($scope.startDragIndex, i);
                    }

                    // removes blue border
                    var tray = $(event.target).closest(".dropTray");
                    tray.removeClass("midDrag");
                },
                // doesn't seem to get called.
                create: function(event, ui) {
                    //console.log("CREATE");
                    if (!$scope.areImagesEditable(false)) {
                        //$(document).find(".dropTray .sortablePart").sortable( "destroy" );
                        //$(this).disable();
                    };
                },
                // update is triggered when the user stopped sorting and the DOM position has changed.
                /*update: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    console.log("UPDATE");
                },
                // change is triggered during sorting, but only when the DOM position has changed.
                change: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    console.log("CHANGE");
                },*/
            };

            $scope.sortableWatchOptions  = {
                placeholder: 'screenshotZonePlaceholder',
                forcePlaceholderSize: true,
                tolerance: "pointer",
                handle: "div.zone",
                sort: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    var h = zone.height();
                    var w = zone.width();
                    var marginTop = zone.css("margin-top");
                    ui.placeholder.height(h);
                    ui.placeholder.width(w);
                    ui.placeholder.css("margin-top", marginTop);
                },
                start: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    var i = Array.prototype.indexOf.call(event.target.children, ui.item[0]);
                    $scope.startDragIndex = i;

                    // adds blue border
                    var tray = $(event.target).closest(".dropTray");
                    tray.addClass("midDrag");
                },
                stop: function(event, ui) {
                    var zone = ui.item.find(".zone");
                    var i = Array.prototype.indexOf.call(event.target.children, ui.item[0]);
                    if ($scope.startDragIndex !== i) {
                        $scope.moveImage($scope.startDragIndex, i, true);
                    }

                    // removes blue border
                    var tray = $(event.target).closest(".dropTray");
                    tray.removeClass("midDrag");
                },
                // doesn't seem to get called.
                create: function(event, ui) {
                    //console.log("CREATE");
                    if (!$scope.areImagesEditable(true)) {
                        //$(document).find(".dropTray .sortablePart").sortable( "destroy" );
                        //$(this).disable();
                    };
                },
            };

            //if (!$scope.areImagesEditable()) {
                //$(document).find(".dropTray .sortablePart").sortable( "destroy" );
            //};
            return mediaExisted;
        };

        // Creates a map of device names to user friendly (those that are displayed in UI), like "iphone4" to "4-inch".
        // This map is used to create the menu item pills above the snapshots.
        // This method depends on both $scope.referenceData and $scope.l10n to be set, and is therefore triggered by a change
        // in either.
        $scope.updateDevices = function() {
            $scope.deviceNameMap = {};
            $scope.deviceNames = new Array(); // just for correct sort order.
            $scope.deviceNamesToDisplay = new Array();

            if ($scope.referenceData && $scope.l10n && $scope.versionInfo && ($scope.currentLoc!==undefined)) { // these 4 pieces of info come in separately, asynchronously. make sure we have them all.

                var appType = $state.params.platform;
                var device;
                var details = $scope.versionInfo.details.value[$scope.currentLoc];
                var isEditable = details.screenshots.isEditable;

                for (var i = 0; i < $scope.referenceData.deviceFamilies[appType].length; i++) {
                    device = $scope.referenceData.deviceFamilies[appType][i];
                    var locKey = "ITC.apps.deviceFamily." + device;
                    var userFriendlyName = $scope.l10n.interpolate(locKey);
                    $scope.deviceNameMap[device] = userFriendlyName;
                    $scope.deviceNames[i] = device;
                    if (device !== "watch") {
                        var hasScreenshots = details.screenshots.value[device].value.length>0;
                        var hasVideo = false;
                        if ($scope.referenceData.appPreviewEnabled) {
                            var dataForDevice = details.appTrailers.value[device];
                            if (dataForDevice) {
                                hasVideo = dataForDevice.value !== null;
                            }
                        }
                        var hasMedia = hasScreenshots || hasVideo;

                        if (hasMedia || isEditable) { //same as: if (!hasMedia && !isEditable)
                            $scope.deviceNamesToDisplay.push(device);

                            if (!$scope.currentDevice) {
                                $scope.currentDevice = device;
                            }
                        }
                    }
                }
            }
        };


        /*$scope.$watch('versionInfo', function(newVal, oldVal) {
            $scope.updateDevices();
        });*/

        // Updates some variables from data received from the server for app trailer
        // Note: this method should be called first from loadAppDetails() then
        // any time $scope.currentLoc changes and
        // anytime $scope.currentDevice changes.
        $scope.updateSnapshotDetails = function(async, mediaExisted) {
            if (!$scope.currentDevice) {
                return;
            }

            log("parent updateSnapshotDetails ");

            $scope.snapshotInfo.dontAnimate = true;
            $scope.snapshotInfo.error = $scope.getErrorsInGroup($scope.currentLoc, $scope.currentDevice); //false; // clear out any errors from previous device/lang group.
            $scope.snapshotInfo.totalImageWidth = 0; // always start a new batch of images off with a totalImageWidth (before any are added) of 0.
            var videoWasLoading = ($scope.tempPageContent.appPreviewSnapshotShowing === false);
            $scope.tempPageContent.appPreviewSnapshotShowing = true;
            $scope.tempPageContent.appPreviewDropped = false;
            $scope.numImagesNotReady = 0;
            $scope.snapshotInfo.maxHeight = 0;
            $scope.snapshotInfo.showSlideShow = false;
            $scope.snapshotInfo.currentIndex = -1;
            $scope.snapshotInfo.videoShowing = false;
            $scope.snapshotInfo.cantPlayVideo = false;
            $scope.snapshotInfo.grabHasHappenedBefore = false;
            $scope.tempPageContent.imagesNotYetLoaded = 0;

            $scope.sortableOptions.disabled = !$scope.areImagesEditable(false);

            var that = this;
            var func = function() {

                $scope.dontShowInstructions = true;

                var timeoutDelay = 0;
                if (mediaExisted) {
                    timeoutDelay = 500;
                }

                var savedImgs, savedVids;

                // temporarily save images at previewImages before changing them, in order to clear out
                // previewImages - if not cleared out, the animation gets a little wacky. We put the images
                // right back below.
                if (that.lastLoc && that.lastDev) {    // if lastLoc and lastDev exists
                    // save images
                    savedImgs = $scope.previewImages.slice(0);  // copy the array by value!!
                    $scope.snapshotInfo.ignoreImageLengthChange = true;
                    $scope.previewImages.length = 0;
                    $scope.$apply();
                    $scope.snapshotInfo.ignoreImageLengthChange = false;

                    // save videos
                    if ($scope.referenceData.appPreviewEnabled) {
                        savedVids = $scope.tempPageContent.previewVideos.slice(0);  // copy the array by value!!
                        $scope.snapshotInfo.ignoreVideoLengthChange = true;
                        $scope.$apply(); // apply the ignoreVideoLengthChange beroe changing previewVideos
                        $scope.tempPageContent.previewVideos.length = 0;
                        $scope.$apply();
                        $scope.snapshotInfo.ignoreVideoLengthChange = false;
                    }
                    //$scope.$apply();

                    // if there were images or videos, they take 500ms to fade out.
                    // If there weren't, no need to wait 500 secs.
                    if (savedImgs.length > 0 || (savedVids && savedVids.length>0)) {
                        timeoutDelay = 500;
                    }
                }

                $timeout(function() {
                    if (savedImgs) { // put the images back.
                        $scope.allImages.setGroup(that.lastLoc, that.lastDev, savedImgs);
                    }
                    if (savedVids) { // put the videos back.

                        // only setGroup if loaded the video.
                        if (videoWasLoading) {
                            $scope.tempPageContent.allVideos.clearGroup("ALL LANGUAGES", that.lastDev);
                        }
                        else {
                            $scope.tempPageContent.allVideos.setGroup("ALL LANGUAGES", that.lastDev, savedVids);
                        }
                    }

                    var langStr = $scope.getLanguageString($scope.currentLoc);

                    // IMAGES
                    // if already initialized this language/device group just get the group
                    if ($scope.allImages.initialized(langStr, $scope.currentDevice)) {

                        $scope.previewImages = $scope.allImages.getGroup(langStr, $scope.currentDevice);
                        $scope.$apply(); // important

                        $scope.tempPageContent.imagesNotYetLoaded = $scope.previewImages.length;

                        for (var i = 0; i < $scope.previewImages.length; i++) {
                            $scope.$broadcast('setImagePreview', i);
                        }

                    }
                    else { // if not, initialize the group with data from the server

                        // little fix in case sort order indices start at 1 (or more). They should start at 0!
                        //$scope.decrementScreenshotSortOrderStartIndices($scope.currentDevice, $scope.currentLoc);
                        var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex($scope.currentDevice, $scope.currentLoc);

                        // copy values from server ($scope.versionInfo.details) to this temporary data
                        // structure $scope.allImages
                        var details = $scope.versionInfo.details.value[$scope.currentLoc];

                        /*
                        var snapshotsValue = details.screenshots.value[$scope.currentDevice];
                        var snapshotsArr;
                        if (snapshotsValue) {
                            snapshotsArr = snapshotsValue.value;
                        }
                        else {
                            snapshotsArr = new Array();
                        }*/

                        var snapshotsArr = details.screenshots.value[$scope.currentDevice].value;

                        //console.info("got snapshots from json: ", snapshotsArr);
                        var snapshot;
                        $scope.previewImages = $scope.allImages.initializeGroup(langStr, $scope.currentDevice);
                        for (var i = 0; i < snapshotsArr.length; i++) {
                            snapshot = snapshotsArr[i].value;
                            if ((snapshot.sortOrder-startSortOrderIndex) < $scope.numImages) {
                                var dataPlusImageInfo = {};

                                var config = {
                                    token: snapshot.assetToken,
                                };
                                var thumbnailConfig = {
                                    token: snapshot.assetToken,
                                    width: MAX_THUMBNAIL_SCREENSHOT_SIZE,
                                    height: MAX_THUMBNAIL_SCREENSHOT_SIZE
                                };
                                dataPlusImageInfo.data = $scope.img_url_gen.generateUrlForToken(config);
                                dataPlusImageInfo.thumbnailData = $scope.img_url_gen.generateUrlForToken(thumbnailConfig);

                                //dataPlusImageInfo.data = snapshot.url;
                                //dataPlusImageInfo.thumbnailData = snapshot.thumbNailUrl;
                                dataPlusImageInfo.videoType = false;
                                $scope.previewImages[snapshot.sortOrder - startSortOrderIndex] = dataPlusImageInfo;
                            }
                        }

                        $scope.$apply(); // important

                        $scope.tempPageContent.imagesNotYetLoaded = $scope.previewImages.length;

                        // no longer necessary with media-image dir.
                        for (var i = 0; i < $scope.previewImages.length; i++) {
                            $scope.$broadcast('setImagePreview', i);
                        }
                    }

                    // VIDEOS
                    if ($scope.referenceData.appPreviewEnabled) { // appTrailers will be null if the property com.apple.jingle.label.appPreview.enabled=false in the properties file

                        // if already initialized this language/device group just get the group
                        if ($scope.tempPageContent.allVideos.initialized("ALL LANGUAGES", $scope.currentDevice)) { // one video for ALL languages
                        //if ($scope.tempPageContent.allVideos.initialized(langStr, $scope.currentDevice)) {

                            $scope.tempPageContent.previewVideos = $scope.tempPageContent.allVideos.getGroup("ALL LANGUAGES", $scope.currentDevice); // one video for ALL languages
                            //$scope.tempPageContent.previewVideos = $scope.tempPageContent.allVideos.getGroup(langStr, $scope.currentDevice);
                            $scope.$apply(); // important

                            if ($scope.tempPageContent.previewVideos.length === 1) {
                                var video = $scope.tempPageContent.previewVideos[0];
                                // THOUGHT: if video.data already exists (which it does if switching to a device that already has a video)
                                // there is no need to have setVideoURL do the copyPreview once video loads. We already have the image data!

                                // set up the object (data) to pass to setVideoURL
                                var data = {};
                                if (video.videoFile) {
                                    data.file = video.videoFile;
                                    data.previewImage = video.data; // the preview image blob!
                                    data.thumbnailData = video.data;
                                    data.previewImageFromServer = false;
                                    var videoFile = URL.createObjectURL(data.file);
                                    var videoURL = $sce.trustAsResourceUrl(videoFile);   // this does seem necessary.
                                    data.url = videoURL;

                                    data.previewTimestamp = video.previewTimestamp;
                                    data.upload = false; // don't upload. it's already been uploaded (on drop)

                                    $scope.tempPageContent.appPreviewSnapshotShowing = false;
                                    $scope.$apply();
                                    $scope.$broadcast('setVideoURL', data);
                                }
                                else { // if no file (ie. if the video was from the server)
                                    var data = {};
                                    data.data = video.data;
                                    data.previewImage = video.data;
                                    data.thumbnailData = video.data;
                                    if (data.previewImage.indexOf("data:") === 0) { // it is possible that the video will be from the server but the preview image is new
                                        data.previewImageFromServer = false;
                                    }
                                    else {
                                        data.previewImageFromServer = true;
                                    }
                                    data.previewTimestamp = video.previewTimestamp;
                                    data.isPortrait = (video.imgHeight > video.imgWidth);
                                    data.upload = false;
                                    //$scope.copyPreview(data, false); // NO. Need to setVideoURL in the last case below.

                                    if (video.processingVideo) { // if video is processing
                                        data.processingVideo = true;
                                        data.cantPlayVideo = true;
                                        $scope.copyPreview(data, false);
                                    }
                                    else if (video.videoError) { // if video error
                                        data.videoError = true;
                                        data.cantPlayVideo = true;
                                        $scope.copyPreview(data, false);
                                    }
                                    else { // if video is good and ready
                                        if (video.videoUrlFromServer) {
                                            data.videoUrlFromServer = video.videoUrlFromServer;
                                            data.processingVideo = false;
                                            $scope.tempPageContent.appPreviewSnapshotShowing = false;
                                            $scope.$apply();
                                            $scope.$broadcast('setVideoURL', data);
                                        }
                                        else { // shouldn't happen
                                            //console.log("Woops - video.videoUrlFromServer was null.");
                                        }
                                    }
                                }
                            }
                        }
                        else { // if not, initialize the group with data from the server

                            // copy values from server ($scope.versionInfo.details) to this temporary data
                            // structure $scope.allImages
                            var details = $scope.versionInfo.details.value[$scope.currentLoc];

                            var dataForDevice = details.appTrailers.value[$scope.currentDevice];
                            if (dataForDevice) {
                                var videoData = dataForDevice.value;

                                $scope.tempPageContent.previewVideos = $scope.tempPageContent.allVideos.initializeGroup("ALL LANGUAGES", $scope.currentDevice);
                                $scope.$apply();

                                if (videoData) {

                                    //console.info("***got video from json: ", videoData);
                                    /* videoData example:
                                        contentType: null
                                        descriptionXML: null
                                        fullSizedPreviewImageUrl: "https://t3.mzstatic.com/us/r38/PurpleVideo4/v4/8b/a9/c0/8ba9c0c9-a963-4286-526a-71bcdd043be9/Job28f35160-0cca-46f2-80b3-7a11dc7c02e2-62011460-PreviewImage_quicktime-Time1400885179368.png?downloadKey=1401665664_bc433c04ed9a9f4f88d3871381c05300"
                                        isPortrait: false
                                        pictureAssetToken: null
                                        previewFrameTimeCode: "00:05"
                                        previewImageStatus: "ERROR"
                                        previewImageUrl: "https://t2.mzstatic.com/us/r38/Video6/v4/86/92/97/869297e0-dcf0-92fa-cec2-5a92ad13fd6d/image230x172.jpeg"
                                        videoAssetToken: null
                                        videoStatus: "Done"
                                        videoUrl
                                    */

                                    var data = {};
                                    data.data = videoData.fullSizedPreviewImageUrl;
                                    data.thumbnailData = videoData.previewImageUrl;
                                    data.previewImage = videoData.fullSizedPreviewImageUrl;
                                    data.previewImageFromServer = true;
                                    //data.file = scope.file; // need to set data.file???
                                    data.previewTimestamp = "00:00:" + videoData.previewFrameTimeCode;
                                    data.isPortrait = videoData.isPortrait;
                                    data.upload = false;
                                    // options for videoStatus: Error, Done, Running, NotFound
                                    if (videoData.videoStatus === "Done" && videoData.videoUrl) {
                                        data.videoUrlFromServer = videoData.videoUrl;
                                        data.processingVideo = false;
                                        $scope.tempPageContent.appPreviewSnapshotShowing = false;
                                        $scope.$apply();
                                        $scope.$broadcast('setVideoURL', data);
                                    }
                                    // videoUrl has not been filled yet. Video is processing
                                    else if (videoData.videoStatus === "Running" || !videoData.videoUrl) {
                                        var data = {};
                                        data.data = videoData.fullSizedPreviewImageUrl;
                                        data.thumbnailData = videoData.previewImageUrl;
                                        if (!videoData.fullSizedPreviewImageUrl) {
                                            // not sure yet how to handle this
                                            //console.log("preview image url does not exist yet: " + videoData.previewImageStatus);
                                        }
                                        data.previewImage = videoData.fullSizedPreviewImageUrl;
                                        data.previewImageFromServer = true;
                                        //data.file = scope.file; // need to set data.file???
                                        data.previewTimestamp = "00:00:" + videoData.previewFrameTimeCode;
                                        data.isPortrait = videoData.isPortrait;
                                        data.upload = false;
                                        data.processingVideo = true;
                                        data.cantPlayVideo = true;
                                        $scope.copyPreview(data, false);
                                    }
                                    else if (videoData.videoStatus === "Error") { // shouldn't happen anymore. Backend no longer returns Error.
                                        //console.log("video status ERROR.");

                                        var data = {};
                                        data.data = videoData.fullSizedPreviewImageUrl;
                                        data.thumbnailData = videoData.previewImageUrl;
                                        if (!videoData.fullSizedPreviewImageUrl) {
                                            // not sure yet how to handle this
                                            //console.log("preview image url does not exist yet: " + videoData.previewImageStatus);
                                        }
                                        data.previewImage = videoData.fullSizedPreviewImageUrl;
                                        data.previewImageFromServer = true;
                                        //data.file = scope.file; // need to set data.file???
                                        data.previewTimestamp = "00:00:" + videoData.previewFrameTimeCode;
                                        data.isPortrait = videoData.isPortrait;
                                        data.upload = false;
                                        data.videoError = true;
                                        data.cantPlayVideo = true;
                                        $scope.copyPreview(data, false);
                                    }
                                }
                            }

                        }
                    }

                    that.lastLoc = langStr;
                    that.lastDev = $scope.currentDevice;

                    // TBD: REMOVE
                    $scope.$broadcast('mediaUpdated'); // let the dropzone know, so it can update it's instruction text.

                    $scope.dontShowInstructions = false;
                    $scope.updateDropTrayText(false);

                }, timeoutDelay); // wait for disappearing images to animate away.
            };

            // Why a $timeout? Because of the important $apply call below that has to happen before the
            // $broadcast. Without this $timeout, an exception occurs if a digest cycle is in progress.
            // Since this method is called during a digest cycle (from $scope.loadAppDetails),
            // an exception occurs otherwise. More info here:
            // http://stackoverflow.com/questions/23070822/angular-scope-apply-vs-timeout-as-a-safe-apply
            if (async) {
                $timeout(func);
            }
            else {
                func();
            }
        };

        // updateSnapshotDetails for watch screenshots
        $scope.updateWatchScreenshots = function(async) {
            $scope.snapshotInfo.watchError = $scope.getErrorsInGroup($scope.currentLoc, "watch"); //false; // clear out any errors from previous lang group.
            $scope.numWatchImagesNotReady = 0;
            $scope.watchSectionOpen = $scope.hasWatchData() || $scope.hasBinaryThatSupportsAppleWatch();
            $scope.tempPageContent.watchImagesNotYetLoaded = 0;

            $scope.sortableWatchOptions.disabled = !$scope.areImagesEditable(true);
            var WATCH_DEVICE_NAME = "watch";
            var that = this;
            var func = function() {

                var timeoutDelay = 0;

                var savedImgs;

                // temporarily save images at previewImages before changing them, in order to clear out
                // previewImages - if not cleared out, the animation gets a little wacky. We put the images
                // right back below.
                /*if (that.lastLoc && that.lastDev) {    // if lastLoc and lastDev exists
                    // save images
                    savedImgs = $scope.previewImages.slice(0);  // copy the array by value!!
                    $scope.snapshotInfo.ignoreImageLengthChange = true;
                    $scope.previewImages.length = 0;
                    $scope.$apply();
                    $scope.snapshotInfo.ignoreImageLengthChange = false;

                    // save videos
                    if ($scope.referenceData.appPreviewEnabled) {
                        savedVids = $scope.tempPageContent.previewVideos.slice(0);  // copy the array by value!!
                        $scope.snapshotInfo.ignoreVideoLengthChange = true;
                        $scope.$apply(); // apply the ignoreVideoLengthChange beroe changing previewVideos
                        $scope.tempPageContent.previewVideos.length = 0;
                        $scope.$apply();
                        $scope.snapshotInfo.ignoreVideoLengthChange = false;
                    }
                    //$scope.$apply();

                    // if there were images or videos, they take 500ms to fade out.
                    // If there weren't, no need to wait 500 secs.
                    if (savedImgs.length > 0 || (savedVids && savedVids.length>0)) {
                        timeoutDelay = 500;
                    }
                }*/

                $timeout(function() {
                    /*if (savedImgs) { // put the images back.
                        $scope.allImages.setGroup(that.lastLoc, that.lastDev, savedImgs);
                    }
                    if (savedVids) { // put the videos back.

                        // only setGroup if loaded the video.
                        if (videoWasLoading) {
                            $scope.tempPageContent.allVideos.clearGroup("ALL LANGUAGES", that.lastDev);
                        }
                        else {
                            $scope.tempPageContent.allVideos.setGroup("ALL LANGUAGES", that.lastDev, savedVids);
                        }
                    }*/

                    var langStr = $scope.getLanguageString($scope.currentLoc);

                    // IMAGES
                    // if already initialized this language/device group just get the group
                    if ($scope.allImages.initialized(langStr, WATCH_DEVICE_NAME)) {

                        $scope.watchImages = $scope.allImages.getGroup(langStr, WATCH_DEVICE_NAME);
                        $scope.$apply(); // important

                        $scope.tempPageContent.watchImagesNotYetLoaded = $scope.watchImages.length;
                        for (var i = 0; i < $scope.watchImages.length; i++) {
                            $scope.$broadcast('setWatchImage', i);
                        }

                    }
                    else { // if not, initialize the group with data from the server

                        // little fix in case sort order indices start at 1 (or more). They should start at 0!
                        //$scope.decrementScreenshotSortOrderStartIndices($scope.currentDevice, $scope.currentLoc);
                        var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex(WATCH_DEVICE_NAME, $scope.currentLoc);

                        // copy values from server ($scope.versionInfo.details) to this temporary data
                        // structure $scope.allImages
                        var details = $scope.versionInfo.details.value[$scope.currentLoc];

                        /*
                        var snapshotsValue = details.screenshots.value[$scope.currentDevice];
                        var snapshotsArr;
                        if (snapshotsValue) {
                            snapshotsArr = snapshotsValue.value;
                        }
                        else {
                            snapshotsArr = new Array();
                        }*/

                        var snapshotsArr = details.screenshots.value[WATCH_DEVICE_NAME].value;

                        //console.info("got snapshots from json: ", snapshotsArr);
                        var snapshot;
                        $scope.watchImages = $scope.allImages.initializeGroup(langStr, WATCH_DEVICE_NAME);
                        for (var i = 0; i < snapshotsArr.length; i++) {
                            snapshot = snapshotsArr[i].value; // is it possible that snapshot is null here?
                            if ((snapshot.sortOrder-startSortOrderIndex) < $scope.numImages) {
                                var dataPlusImageInfo = {};

                                var config = {
                                    token: snapshot.assetToken,
                                };
                                var thumbnailConfig = {
                                    token: snapshot.assetToken,
                                    width: MAX_THUMBNAIL_SCREENSHOT_SIZE,
                                    height: MAX_THUMBNAIL_SCREENSHOT_SIZE
                                };
                                dataPlusImageInfo.data = $scope.img_url_gen.generateUrlForToken(config);
                                dataPlusImageInfo.thumbnailData = $scope.img_url_gen.generateUrlForToken(thumbnailConfig);

                                //dataPlusImageInfo.data = snapshot.url;
                                //dataPlusImageInfo.thumbnailData = snapshot.thumbNailUrl;

                                dataPlusImageInfo.videoType = false;
                                $scope.watchImages[snapshot.sortOrder - startSortOrderIndex] = dataPlusImageInfo;
                            }
                        }

                        $scope.$apply(); // important
                        $scope.tempPageContent.watchImagesNotYetLoaded = $scope.watchImages.length;
                        for (var i = 0; i < $scope.watchImages.length; i++) {
                            $scope.$broadcast('setWatchImage', i);
                        }
                    }


                    //that.lastLoc = langStr;
                    //that.lastDev = $scope.currentDevice;

                    $scope.updateDropTrayText(true);

                }, timeoutDelay); // wait for disappearing images to animate away.
            };

            // Why a $timeout? Because of the important $apply call below that has to happen before the
            // $broadcast. Without this $timeout, an exception occurs if a digest cycle is in progress.
            // Since this method is called during a digest cycle (from $scope.loadAppDetails),
            // an exception occurs otherwise. More info here:
            // http://stackoverflow.com/questions/23070822/angular-scope-apply-vs-timeout-as-a-safe-apply
            if (async) {
                $timeout(func);
            }
            else {
                func();
            }
        };

        // Broadcasts a width change to the drop zone.
        $scope.updatePreviewWidth = function(watchTray) {
            var data = {};

            data.total = $scope.getTotalPreviewImagesWidth(watchTray);
            $scope.setMaxImageHeight();

            $scope.updateDropTrayMinWidth(data, watchTray);
        };

        /* **************************************************
            Apple Watch related functions
        ************************************************** */

        $scope.getDescriptionLabelText = function() {
            var key;
            if ($scope.watchDataExists()) {
                key = 'ITC.AppVersion.LocalizedSection.DescriptionLabel.Info2Popup';
            }
            else {
                key = 'ITC.AppVersion.LocalizedSection.DescriptionLabel.InfoPopup';
            }

            if ($scope.l10n && $scope.l10n.interpolate) {
                return $scope.l10n.interpolate(key);
            }
            else {
                return "";
            }
        }

        $scope.hasBinaryThatSupportsAppleWatch = function() {
            return  $scope.versionInfo && $scope.versionInfo.bundleInfo && $scope.versionInfo.bundleInfo.supportsAppleWatch;
        }

        // Determines if the JSON has watch data.
        $scope.watchDataExists = function() {
            return  $scope.currentLoc !== undefined && $scope.versionInfo && $state.params.platform && $scope.referenceData &&
                    _.contains($scope.referenceData.deviceFamilies[$state.params.platform], "watch") &&
                    //$scope.versionInfo.details.value[$scope.currentLoc].watchDescription != undefined &&
                    _.contains($scope.getDevicesFromScreenshotsJSON($scope.currentLoc), "watch");
        }

        $scope.watchDataExistsAndIsntEmptyAndIsEditable = function() {
            var watchDataExists = $scope.watchDataExists();
            if (watchDataExists) {
                var watchScreenshots = $scope.getScreenshots($scope.currentLoc, "watch");
                var screenshotsAreEditable = watchScreenshots.value && watchScreenshots.isEditable;
                if (screenshotsAreEditable) {
                    return true;
                } else { // if they're uneditable (as in a rfs app)
                    var screenshotsArentEmpty = watchScreenshots.value && watchScreenshots.value.length>0;
                    return screenshotsArentEmpty; // don't show if empty
                }
            }
            else {
                return false;
            }
        }

        $scope.watchSectionToggleShouldBeDisabled = function() {
            return ($scope.hasBinaryThatSupportsAppleWatch() || $scope.hasWatchData()) && $scope.watchSectionOpen;
        }

        // Returns true if the watch area has some data filled in (in current loc), false otherwise.
        $scope.hasWatchData = function() {
            if ($scope.watchDataExists()) {
                //var hasDescription = $scope.versionInfo.details.value[$scope.currentLoc].watchDescription.value &&
                //                        $scope.versionInfo.details.value[$scope.currentLoc].watchDescription.value.length > 0;
                var hasIcon = $scope.versionInfo.watchAppIcon && $scope.versionInfo.watchAppIcon.value && $scope.versionInfo.watchAppIcon.value.assetToken;
                var watchScreenshotsArr = $scope.getScreenshotsArr($scope.currentLoc, "watch");
                var hasScreenshots = watchScreenshotsArr && watchScreenshotsArr.length>0;
                return hasScreenshots || hasIcon;
            }
            else {
                return false;
            }
        }

        $scope.toggleWatchSection = function(e) {
            var arrow = $(e.target);
            if (arrow.hasClass("disabled")) { // if disabled
                return;                       // don't toggle
            }
            else {
                $scope.watchSectionOpen = !$scope.watchSectionOpen;
            }
        }

        $scope.toggleMessagesSection = function(e) {
            var arrow = $(e.target);
            if (arrow.hasClass("disabled")) { // if disabled
                return;                       // don't toggle
            }
            else {
                $scope.messagesSectionOpen = !$scope.messagesSectionOpen;
            }
        }

        $scope.showMessagesSection = function() {
            if ($scope.hasProviderFeature('VOYAGER') && $scope.hasProviderFeature('SSENABLED') && $scope.isIOSApp()) {
                var hasScreenshots = $scope.hasScreenshotsInDevs(true);
                var isEditable = $scope.areImagesEditableTopLevel();
                return isEditable || hasScreenshots;
            }
            else {
                return false;
            }
        }

        $scope.isDropTrayEmpty = function(watchTray) {
            if (watchTray) {
                return $scope.watchImages.length === 0;
            }
            else {
                return $scope.previewImages.length === 0 && $scope.tempPageContent.previewVideos.length === 0;
            }
        };

        /* **************************************************
        Functions for screenshot/video drops (moved from drop directive)
        ************************************************** */

        var isImage = function(item) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|'.indexOf(type) !== -1;
        }

        var isVideo = function(item) {
            var itemType = item.type.slice(item.type.lastIndexOf('/') + 1);
            var type = '|' + itemType + '|';

            // little test to see if this file type can be played in this browser
            //var elem = document.createElement("video");
            //console.log("Can this browser play a movie of type " + itemType + "? " + elem.canPlayType(item.type));
            //elem.remove();

            return '|mp4|quicktime|x-m4v|'.indexOf(type) !== -1;
        }

        $scope.onWatchFileSelect = function($files) {
            $scope.onFileSelect($files, true);
        };

        $scope.onFileSelect = function($files, watchFiles) {
            // if the drop zone has a loader, don't accept additional drops.
            if (!$scope.readyForDrop(watchFiles) || !$scope.areImagesEditable(watchFiles)) {
                //console.log("not ready for drop.");
                return;
            }


            //scope.dontAnimate = false; // do animate.

            var file;
            // get number of image files
            var numImageFiles = 0;
            var imageFiles = new Array();
            var videoFiles = new Array();
            var maxNumVids = $scope.numVideos;
            var vidNotUploadable = false;

            var existingImages;
            var error = false;
            if (watchFiles) {
                $scope.snapshotInfo.watchError = false; // clear previous watch errors
                existingImages = $scope.watchImages;
                maxNumVids = 0;
            }
            else {
                $scope.snapshotInfo.error = false; // clear previous errors
                existingImages = $scope.previewImages;
            }

            for (var i = 0; i < $files.length; i++) {
                file = $files[i];
                if (isVideo(file) && maxNumVids>0 && $scope.isVideoEditable()) {
                    if ($scope.isVideoEditableAndUploadable()) {
                        videoFiles.push(file);
                    }
                    else {
                        videoFiles.push(file); // just push it.
                        vidNotUploadable = true;
                        //scope.error = scope.locFile['ITC.AppVersion.Media.CantUploadVideoDetail'];
                    }
                }
                else if(isImage(file) && $scope.areImagesEditable(watchFiles)) {
                    imageFiles.push(file);
                }
                else {
                    error = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.WrongFileType'); // to cancel other file uploads if one is a wrong file type?
                }

            }

            var vidError = false;
            if (!watchFiles) { // don't bother checking for video errors on watch file upload
                if (videoFiles.length > maxNumVids && !vidNotUploadable) {
                    error = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.TooManyVideosSelected',{'maxNumVideos': maxNumVids});
                    vidError = true;
                }
                else if ($scope.tempPageContent.previewVideos.length>0 && (($scope.tempPageContent.previewVideos.length+videoFiles.length) > maxNumVids)) { // AppPreviewAlreadySelected error msg takes precedence over CantUploadVideoDetail
                    error = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.AppPreviewAlreadySelected');
                    vidError = true;
                }
                else if (vidNotUploadable) {
                    error = $scope.l10n.interpolate('ITC.AppVersion.Media.CantUploadVideoDetail');
                    vidError = true;
                }
                else {
                    for (var i = 0; i < videoFiles.length; i++) {
                        file = videoFiles[i];
                        $scope.videoFileSelectedForUpload(file);
                    }
                }
            }

            var numImagesToAdd = imageFiles.length;
            var max = $scope.numImages;

            // if there's a video error, don't upload images.
            var tooManyImages = ((existingImages.length+imageFiles.length) > max);
            if (vidError || tooManyImages) {
                var numLeftToAdd = max - existingImages.length;

                // get the right tooManyImagesError
                var tooManyImagesError = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.TooManyImagesSelected',{'maxNumImages': numLeftToAdd});
                if (numLeftToAdd === 0) {
                    tooManyImagesError = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.ImagesAlreadySelected',{'maxNumImages': max});
                }
                else if (numLeftToAdd === 1) {
                    tooManyImagesError = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.TooManyImagesSelectedSingular');
                }

                if (vidError && tooManyImages) { // include both messages
                    error += " " + tooManyImagesError;
                }
                else if (tooManyImages) { // no video error
                    error = tooManyImagesError;
                }
            }
            else {
                for (var i = 0; i < numImagesToAdd; i++) {
                    file = imageFiles[i];
                    $scope.imageFileSelectedForUpload(file, watchFiles);
                }
            }

            if (watchFiles) {
                $scope.snapshotInfo.watchError = error;
            }
            else {
                $scope.snapshotInfo.error = error;
            }

        };

        $scope.imageFileSelectedForUpload = function(file, watchFile) {
            var imgFile = URL.createObjectURL(file);
            //imgFile = $sce.trustAsResourceUrl(imgFile);  // necessary? doesn't seem so

            $scope.validateImageFileSize(file, imgFile, watchFile);
            //scope.dontValidateFileSize(file, imgFile); // temporary to test uploader errors
        };

        $scope.validateImageFileSize = function(file, url, watchFile) {
            if ($scope.referenceData.imageSpecs) {
                var ret;
                var validSizesForDevice;
                if (watchFile) {
                    validSizesForDevice = $scope.referenceData.imageSpecs["watch"].geos;
                }
                else {
                    validSizesForDevice = $scope.referenceData.imageSpecs[$scope.currentDevice].geos;
                }

                var loadFunc = function() {
                    //console.log("dummy image loaded");
                    var width = this.width;
                    var height = this.height;

                    var dimensionsArr = new Array();
                    var expectedW, expectedH, expectedDimensionsArr;
                    for (var i = 0; i < validSizesForDevice.length; i++) {
                        expectedDimensionsArr = validSizesForDevice[i].split("x");
                        expectedW = parseInt(expectedDimensionsArr[0]);
                        expectedH = parseInt(expectedDimensionsArr[1]);
                        if (expectedW === width && expectedH === height) {
                            $scope.continueWithImageUpload(file, url, watchFile);
                            return;
                        }
                    }

                    // if got here, the height/width do not match the expected heights/widths.
                    if (watchFile) {
                        $scope.snapshotInfo.watchError = $sce.trustAsHtml($scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.WrongImageDimensions.watch'));
                    }
                    else {
                        $scope.snapshotInfo.error = $sce.trustAsHtml($scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.WrongImageDimensions.' + $scope.versionInfo.platform));
                    }

                    $scope.$apply();

                    // remove dummy element from the dom here? it's not attached to anything in the dom, so
                    // I *think* it gets garbage collected.
                };

                var loadErrorFunc = function() {
                    //console.log("some error happened getting image dimensions on the client. letting the server handle it.");
                    $scope.continueWithImageUpload(file, url, watchFile);
                };

                // create a dummy element just to get the width and height of the image.
                var img = document.createElement('img');
                var jqImg = $(img);
                jqImg.bind('load', loadFunc);
                jqImg.bind('error', loadErrorFunc);
                img.src = url;
            }
        };

        $scope.videoFileSelectedForUpload = function(file) {
            // validate file size here.
            if ($scope.validateVideoFileSize(file)) {
                var videoFile = URL.createObjectURL(file);
                var videoURL = $sce.trustAsResourceUrl(videoFile);   // this does seem necessary.

                $scope.validateVideoFileDimensions(file, videoURL); // calls continueWithUpload if it passes validation.
                //$scope.continueWithVideoUpload(file, videoURL);
            }
            else {
                $scope.snapshotInfo.error = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.FileTooLarge');
            }
        };

        // Checks if file size is under 500mb.
        $scope.validateVideoFileSize = function(file) {
            var megabytes = file.size/1000000;
            return megabytes <= 500; // valid if less than or equal to 500 MB
        };

        $scope.validateVideoFileDimensions = function(file, url) {
            if ($scope.referenceData.legalAppPreviewGeos) {
                //console.log("validateVideoFileDimensions");
                var validSizesForDevice = $scope.referenceData.legalAppPreviewGeos[$scope.currentDevice];

                var loadFunc = function() {
                    //console.log("dummy video loaded");
                    var width = this.videoWidth;
                    var height = this.videoHeight;

                    var dimensionsArr = new Array();
                    var expectedW, expectedH, expectedDimensionsArr;
                    for (var i = 0; i < validSizesForDevice.length; i++) {
                        expectedDimensionsArr = validSizesForDevice[i].split("x");
                        expectedW = parseInt(expectedDimensionsArr[0]);
                        expectedH = parseInt(expectedDimensionsArr[1]);
                        if (expectedW === width && expectedH === height) {
                            $scope.continueWithVideoUpload(file, url);
                            return;
                        }
                    }

                    // if got here, the height/width do not match the expected heights/widths.
                    //scope.error = "The image dimensions should be: " + validSizesForDevice.join(", ");
                    $scope.snapshotInfo.error = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.WrongVideoDimensions',{'validDimensions': validSizesForDevice.join(", ")});

                    $scope.$apply();

                    // remove dummy element from the dom here? it's not attached to anything in the dom, so
                    // I *think* it gets garbage collected.
                };

                var loadErrorFunc = function() {
                    console.log("some error happened getting video dimensions on the client. letting the server handle it.");
                    $scope.continueWithVideoUpload(file, url);
                };

                // create a dummy element just to get the width and height of the video.
                var vid = document.createElement("video");
                var jqVid = $(vid);
                jqVid.on("loadeddata", loadFunc);
                jqVid.on('error', loadErrorFunc);
                vid.src = url;
            }
        };

        $scope.continueWithVideoUpload = function(file, url, device) {
            var data = {};
            data.url = url;
            data.file = file;
            $scope.videoDropped(data, device);
        };

        $scope.continueWithImageUpload = function(file, url, watchFile) {
            var data = {};
            data.url = url;
            data.file = file;
            $scope.imageDropped(data, watchFile);
        };

        // if watchTray is true, returns true if the watch drop tray is ready for drop
        // if false, returns true if main drop tray is ready for drop
        $scope.readyForDrop = function(watchTray) {
            if (watchTray) {
                var ready = $scope.watchImagesReady() && $scope.watchImagesLoaded();
                return ready;
            }
            else {
                var ready = $scope.imagesReady() && $scope.videoReady() && $scope.imagesLoaded();
                return ready;
            }
        };

        $scope.watchImagesReady = function() {
            return parseInt($scope.numWatchImagesNotReady)===0;
        };

        $scope.imagesLoaded = function() {
            return $scope.tempPageContent.imagesNotYetLoaded===undefined || $scope.tempPageContent.imagesNotYetLoaded===0;
        };

        $scope.watchImagesLoaded = function() {
            return $scope.tempPageContent.watchImagesNotYetLoaded===undefined || $scope.tempPageContent.watchImagesNotYetLoaded===0;
        };

        $scope.imagesReady = function() {
            return parseInt($scope.numImagesNotReady)===0;
        };

        // Returns true once the video snapshot is showing, which happens before the video is loaded.
        // So by "ready", we mean "showing" by the drop zone.
        $scope.videoReady = function() {
            return $scope.tempPageContent.appPreviewSnapshotShowing;
        };

        /**** Error Handling on Drop Tray ****/

        $scope.$watch('snapshotInfo.error', function(newVal, oldVal) {
            if (newVal) {
                $scope.tempPageContent.appPreviewSnapshotShowing = true;
                scope.showDropTrayError(newVal);
            }
            else {
                scope.clearDropTrayError();
            }
        });

        $scope.$watch('snapshotInfo.watchError', function(newVal, oldVal) {
            if (newVal) {
                scope.showWatchDropTrayError(newVal);
            }
            else {
                scope.clearWatchDropTrayError();
            }
        });

        $scope.showDropTrayError = function(msg) {
            var dropTray = $(document).find(".dropTray.mainScreenshotContainer");
            dropTray.addClass("error");

            // show the error for 3 seconds regardless of mouse hover.
            var errorPopup = dropTray.find('.errorPopUp');
            errorPopup.addClass("open");
            $scope.mainDropTrayErrorStayOpen = true;
            $timeout(function(){
                errorPopup.removeClass("open");
                $scope.mainDropTrayErrorStayOpen = false;
            },3000);
        };

        scope.clearDropTrayError = function() {
            var dropTray = $(document).find(".dropTray.mainScreenshotContainer");
            dropTray.removeClass("error");
        };

        $scope.showWatchDropTrayError = function(msg) {
            var dropTray = $(document).find(".dropTray.watchContainer");
            dropTray.addClass("error");

            // show the error for 3 seconds regardless of mouse hover.
            var errorPopup = dropTray.find('.errorPopUp');
            errorPopup.addClass("open");
            $scope.watchDropTrayErrorStayOpen = true;
            $timeout(function(){
                errorPopup.removeClass("open");
                $scope.watchDropTrayErrorStayOpen = false;
            },3000);
        };

        scope.clearWatchDropTrayError = function() {
            var dropTray = $(document).find(".dropTray.watchContainer");
            dropTray.removeClass("error");
        };

        // TBD: move this to an "add listeners" method.
        var mainDropTray = $(document).find(".dropTray.mainScreenshotContainer");
        var watchDropTray = $(document).find(".dropTray.watchContainer");
        mainDropTray.bind('mouseenter', function() {
            if ($scope.snapshotInfo.error) {
                var errorPopup = $(this).find(" > .errorPopUp");
                errorPopup.addClass("open");
            }
        });
        mainDropTray.bind('mouseleave', function() {
            if ($scope.snapshotInfo.error && !$scope.mainDropTrayErrorStayOpen) {
                var errorPopup = $(this).find(" > .errorPopUp");
                errorPopup.removeClass("open");
            }
        });
        watchDropTray.bind('mouseenter', function() {
            if ($scope.snapshotInfo.watchError) {
                var errorPopup = $(this).find(" > .errorPopUp");
                errorPopup.addClass("open");
            }
        });
        watchDropTray.bind('mouseleave', function() {
            if ($scope.snapshotInfo.watchError && !$scope.watchDropTrayErrorStayOpen) {
                var errorPopup = $(this).find(" > .errorPopUp");
                errorPopup.removeClass("open");
            }
        });

        /**** End Error Handling on Drop Tray ****/

        $scope.$watch('previewImages.length', function(newVal, oldVal) {
            if (!$scope.hasProviderFeature('SSENABLED')) {
                if (!$scope.snapshotInfo.ignoreImageLengthChange) {
                    $scope.updateDropTrayText(false);
                }
            }

            // delay adding/removing the "empty" class exactly the same amount of time it takes
            // screenshots to animate away
           /*
            var dropTray = $(document).find(".dropTray.mainScreenshotContainer");
            if (newVal===0 && $scope.tempPageContent.previewVideos.length === 0) {
                $timeout(function() {
                    dropTray.addClass("empty");
                }, 500);
            }
            else {
                $timeout(function() {
                    dropTray.removeClass("empty");
                }, 500);
            }
            */
        });

        $scope.$watch('watchImages.length', function(newVal, oldVal) {
            if (!$scope.hasProviderFeature('SSENABLED')) {
                if (!$scope.snapshotInfo.ignoreImageLengthChange) {
                    $scope.updateDropTrayText(true);
                }
            }

            /*
            var dropTray = $(document).find(".dropTray.watchContainer");
            if (newVal===0) {
                $timeout(function() {
                    dropTray.addClass("empty");
                }, 500);
            }
            else {
                $timeout(function() {
                    dropTray.removeClass("empty");
                }, 500);
            }*/
        });

        $scope.$watch('tempPageContent.previewVideos.length', function(newVal, oldVal) {
            if (!$scope.hasProviderFeature('SSENABLED')) {
                if (!$scope.snapshotInfo.ignoreVideoLengthChange) {
                    $scope.updateDropTrayText(false);
                }
            }
        });

        // updates the text depending how many images/video have been dropped.
        $scope.updateDropTrayText = function (watchTray) {
            if ($scope.l10n) { // if no locFile yet, this method will be called again once there is.
                var existingImages;
                if (watchTray) {
                    existingImages = $scope.watchImages;
                }
                else {
                    existingImages = $scope.previewImages;
                }
                var numImagesLeft = $scope.numImages - existingImages.length;
                var imgsLocKey = 'ITC.AppVersion.Media.Dropzone.UpToXScreenshots'; // default to plural

                //scope.instructionDetails = $scope.l10n['ITC.AppVersion.Media.Dropzone.OptionalText'];
                //scope.videoInstructionsInDetails = false;

                // handle video text
                if (watchTray) {
                    // do nothing - don't set dropVideoInstructions
                }
                else if ($scope.numVideos === 0 || $scope.tempPageContent.previewVideos.length === 1 || !$scope.isVideoEditable()) { // if not allowing video or there's already a video
                    $scope.dropVideoInstructions = "";
                    $scope.and = "";
                }
                else {
                    $scope.dropVideoInstructions = $scope.l10n['ITC.AppVersion.Media.Dropzone.AppPreviewText'] + " ";

                    // not doing details right now
                    /*if (!$scope.isVideoEditableAndUploadable()) {
                        //scope.instructionDetails = scope.locFile['ITC.AppVersion.Media.CantUploadVideoDetail'];
                        //scope.videoInstructionsInDetails = true;
                    }
                    else {
                        //scope.instructionDetails = scope.locFile['ITC.AppVersion.Media.Dropzone.OptionalText'];
                        //scope.videoInstructionsInDetails = false;
                    }*/
                }

                // handle images text
                if (numImagesLeft === 0 || !$scope.areImagesEditable(watchTray)) {
                    if (watchTray) {
                        $scope.dropWatchImageInstructions = "";
                    } else {
                        $scope.dropImageInstructions = "";
                    }
                    $scope.and = "";
                }
                else {
                    if (numImagesLeft>0 && $scope.dropVideoInstructions.length>0) {
                        scope.and = " " + $scope.l10n['ITC.AppVersion.Media.Dropzone.And'] + " ";
                    }
                    else {
                        scope.and = "";
                    }

                    if (numImagesLeft === 1) {
                        imgsLocKey = 'ITC.AppVersion.Media.Dropzone.UpToXScreenshot';
                    }

                    if (watchTray) {
                        $scope.dropWatchImageInstructions = $scope.l10n.interpolate(imgsLocKey, {'numImages': numImagesLeft});
                    } else {
                        $scope.dropImageInstructions = $scope.l10n.interpolate(imgsLocKey, {'numImages': numImagesLeft});
                    }

                }
            }
        };

        $scope.getWatchInstructionHeader = function() {
            var instructionHeader = "";
            if ($scope.l10n && $scope.watchImages && $scope.l10n.interpolate) {
                var numImagesLeft = $scope.numImages - $scope.watchImages.length;
                var locKey = 'ITC.AppVersion.Media.Dropzone.DragText.Images';
                if (numImagesLeft === 1) {
                    locKey = 'ITC.AppVersion.Media.Dropzone.DragText.Image';
                }
                instructionHeader = $scope.l10n.interpolate(locKey,{'imageNumber': numImagesLeft});
            }

            return instructionHeader;
        }

        $scope.getInstructionHeader = function() {
            var instructionHeader = "";
            var locKey;
            if ($scope.l10n && $scope.previewImages && $scope.tempPageContent.previewVideos && $scope.l10n.interpolate) {
                var numImagesLeft = $scope.numImages - $scope.previewImages.length;
                if ($scope.dropVideoInstructions.length>0) {
                    locKey = 'ITC.AppVersion.Media.Dropzone.DragText.VideoAndImages';
                    if (numImagesLeft === 1) {
                        locKey = 'ITC.AppVersion.Media.Dropzone.DragText.VideoAndImage';
                    }
                    instructionHeader = $scope.l10n.interpolate(locKey,{'imageNumber': numImagesLeft});
                }
                else {
                    locKey = 'ITC.AppVersion.Media.Dropzone.DragText.Images';
                    if (numImagesLeft === 1) {
                        locKey = 'ITC.AppVersion.Media.Dropzone.DragText.Image';
                    }
                    instructionHeader = $scope.l10n.interpolate(locKey,{'imageNumber': numImagesLeft});
                }
            }

            return instructionHeader;
        }


        // Displayed under the drop tray
        $scope.getMainDropTrayInstructions = function() {
            var instructions = "";
            if ($scope.l10n && $scope.tempPageContent.previewVideos && $scope.previewImages && $scope.l10n.interpolate) {
                if ($scope.numVideos > 0) {
                    instructions = $scope.l10n.interpolate('ITC.AppVersion.Media.Dropzone.DropTrayInstructionsWithVideo',
                           {'numVideos': $scope.tempPageContent.previewVideos.length,
                            'maxNumVideos': $scope.numVideos,
                            'numImages': $scope.previewImages.length,
                            'maxNumImages': $scope.numImages});
                }
                else {
                    instructions = $scope.l10n.interpolate('ITC.AppVersion.Media.Dropzone.DropTrayInstructionsWithoutVideo',
                           {'numImages': $scope.previewImages.length,
                            'maxNumImages': $scope.numImages});
                }
            }
            return instructions;
        }

        // Displayed under the watch drop tray
        $scope.getWatchDropTrayInstructions = function() {
            var instructions = "";
            if ($scope.l10n && $scope.watchImages && $scope.l10n.interpolate) {
                instructions = $scope.l10n.interpolate('ITC.AppVersion.Media.Dropzone.DropTrayInstructionsWithoutVideo',
                                {'numImages': $scope.watchImages.length,
                                 'maxNumImages': $scope.numImages});
            }
            return instructions;
        }

        $scope.mainDropTrayChooseFileIsEnabled = function() {
            var enabled = false;
            if ($scope.tempPageContent.previewVideos && $scope.previewImages) {
                var readyForDrop = $scope.readyForDrop(false);
                if ($scope.numVideos > 0) {
                    enabled = (($scope.tempPageContent.previewVideos.length < $scope.numVideos) || ($scope.previewImages.length < $scope.numImages)) && readyForDrop;
                }
                else {
                    enabled = ($scope.previewImages.length < $scope.numImages) && readyForDrop;
                }
                $scope.mainDropTrayChooseFileEnabled = enabled;
            }
            return enabled;
        }

        $scope.$watch('mainDropTrayChooseFileEnabled',function(val) {
            var el = $("#mainDropTrayFileSelect");
            if (val) {
                el.removeAttr("disabled");
            }
            else if (val === false) {
                el.attr("disabled", "true");
            }
        });

        $scope.watchDropTrayChooseFileIsEnabled = function() {
            var enabled = false;
            if ($scope.watchImages) {
                enabled = $scope.watchImages.length < $scope.numImages && $scope.readyForDrop(true);
                $scope.watchDropTrayChooseFileEnabled = enabled;
            }
            return enabled;
        }

        $scope.$watch('watchDropTrayChooseFileEnabled',function(val) {
            var el = $("#watchDropTrayFileSelect");
            if (val) {
                el.removeAttr("disabled");
            }
            else if (val === false) {
                el.attr("disabled", "true");
            }
        });

        $scope.mainDropTrayDeleteAllEnabled = function() {
            return (($scope.tempPageContent.previewVideos.length > 0) || ($scope.previewImages.length > 0)) && $scope.readyForDrop(false);
        }

        $scope.watchDropTrayDeleteAllEnabled = function() {
            return ($scope.watchImages.length > 0) && $scope.readyForDrop(true);
        }

        $scope.updateDropTrayMinWidth = function(data, watchTray) {
            var total = data.total;

            var dropTray;
            if (watchTray) {
                dropTray = $(document).find(".dropTray.watchContainer");
            }
            else {
                dropTray = $(document).find(".dropTray.mainScreenshotContainer");
            }
            var parent = dropTray.find('.appTrailersContainer');
            parent.css("min-width", total + "px");
        };

        $scope.showInstructions = function() {
            if ($scope.dontShowInstructions) { // don't show instructions till done updating images
                return false;
            }
            else {
                return ($scope.dropVideoInstructions || $scope.dropImageInstructions) &&
                    $scope.tempPageContent.previewVideos.length===0 && $scope.previewImages.length===0 && $scope.areImagesEditable(false);
            }
        }

        $scope.showWatchInstructions = function() {
            return $scope.dropWatchImageInstructions && $scope.watchImages.length===0 && $scope.areImagesEditable(true);
        }

        /* **************************************************
        End Functions for screenshot/video drops
        ************************************************** */


        /* **************************************************
        New Version Function
        ************************************************** */
        $scope.closeVersionModal = function(saving) {
            $scope.tempPageContent.showSaveVerError = false;
            $scope.tempPageContent.saveVerMsg = "";
            $scope.tempPageContent.clearValidationNewVersionModal = true;
            if (saving) {
                $scope.createAppVersionSaving = true;
                //submit data to api
                var newVersionJson = { version: $scope.tempPageContent.newVersionNumber };
                createAppVersionService.create($scope.adamId,newVersionJson).then(function(data){
                    $scope.createAppVersionSaving = false;
                    if (data.status == "403") {
                        // if ($scope.modalsDisplay) $scope.modalsDisplay.newVersion = false;
                        $scope.tempPageContent.showSaveVerError = true;
                        $scope.tempPageContent.saveVerMsg = data.data.messages.error[0];
                    } else if (data.status == "500") {
                        // if ($scope.modalsDisplay) $scope.modalsDisplay.newVersion = false;
                        $scope.tempPageContent.showSaveVerError = true;
                        $scope.tempPageContent.saveVerMsg = $scope.l10n.interpolate('ITC.savingerror.canNotSave');
                    } else {
                        //save went through - go to (new) version page (reload page)
                        $state.reload();
                    }
                });
            } else {
                $scope.modalsDisplay.newVersion = false;
            }
        }

        /* **************************************************
        App Icon functions
        ************************************************** */

        $scope.largeAppIconUpload = function() {
            if ($scope.tempPageContent.LargeAppIconFile !== undefined && $scope.tempPageContent.LargeAppIconFile !== null) {
                $scope.tempPageContent.appIconInProgress = true;
                $scope.imageUploadsInProgress++;
                $scope.appIconUpload = $upload.upload({
                    url: $scope.referenceData.directUploaderUrls.imageUrl,
                    method: 'POST',
                    headers: {'Content-Type': $scope.tempPageContent.LargeAppIconFile.type,
                              'X-Apple-Upload-Referrer': window.location.href,
                              'X-Apple-Upload-AppleId': $scope.adamId,
                              'X-Apple-Request-UUID': _.guid(),
                              'X-Apple-Upload-itctoken': $scope.appVersionReferenceData.ssoTokenForImage,
                              'X-Apple-Upload-ContentProviderId': $scope.user.contentProviderId,
                              'X-Original-Filename': $scope.convertToUnicodeStr($scope.tempPageContent.LargeAppIconFile.name),
                              'X-Apple-Upload-Validation-RuleSets': $scope.referenceData.imageSpecs.largeAppIcon.pictureType
                             },
                    file: $scope.tempPageContent.LargeAppIconFile
                }).progress(function(evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    //console.log("Success uploading large app icon to DU");
                    $scope.addAppIconDataToMainJson(data, $scope.tempPageContent.LargeAppIconFile.name);
                    $scope.tempPageContent.appIconInProgress = false;
                    $scope.imageUploadsInProgress--;

                    $scope.tempPageContent.appIconDisplayUrl = URL.createObjectURL($scope.tempPageContent.LargeAppIconFile);

                }).error(function(data, status, headers, config) {
                    //console.log("LARGE APP ICON ERROR: Status - " + status);
                    if (data) {
                       var locErrorKey = "ITC.apps.validation."+ data.suggestionCode.toLowerCase();
                        var errorToShow = $scope.l10n.interpolate(locErrorKey);
                        if ($scope.l10n.interpolate(locErrorKey) === locErrorKey) {
                            errorToShow = $scope.l10n.interpolate('ITC.AppVersion.GeneralInfoSection.AppIconErrors.ImageNotLoaded');
                        }
                    } else {
                        var errorToShow = $scope.l10n.interpolate('ITC.AppVersion.DUGeneralErrors.FileNotLoaded');
                    }

                    $scope.tempPageContent.appIconInProgress = false;
                    $scope.tempPageContent.userReadyToSave = false; //if we are in mid-save - stop
                    /*$scope.versionloaded = true;
                    $scope.setisReady();*/
                    $scope.setIsSaving(false);
                    $scope.saveInProgress = false;
                    $scope.simpleDropErrors.error = errorToShow;
                    $scope.imageUploadsInProgress--;
                });
            }
        }
        $scope.addAppIconDataToMainJson = function(data, originalFilename) {
            if (!$scope.versionInfo.largeAppIcon.value) {
                $scope.versionInfo.largeAppIcon.value = {};
            }
            $scope.versionInfo.largeAppIcon.value.assetToken = data.token;
            $scope.versionInfo.largeAppIcon.value.originalFileName = originalFilename;
            $scope.versionInfo.largeAppIcon.value.size = data.length;
            $scope.versionInfo.largeAppIcon.value.width = data.width;
            $scope.versionInfo.largeAppIcon.value.height = data.height;
            $scope.versionInfo.largeAppIcon.value.checksum = data.md5;
        }

        /* **************************************************
        Watch App Icon functions
        ************************************************** */
        $scope.watchAppIconUpload = function() {
            if ($scope.tempPageContent.WatchAppIconFile !== undefined && $scope.tempPageContent.WatchAppIconFile !== null) {
                $scope.tempPageContent.watchAppIconInProgress = true;
                $scope.imageUploadsInProgress++;
                $scope.watchAppIconUpload2 = $upload.upload({
                    url: $scope.referenceData.directUploaderUrls.imageUrl,
                    method: 'POST',
                    headers: {'Content-Type': $scope.tempPageContent.WatchAppIconFile.type,
                              'X-Apple-Upload-Referrer': window.location.href,
                              'X-Apple-Upload-AppleId': $scope.adamId,
                              'X-Apple-Request-UUID': _.guid(),
                              'X-Apple-Upload-itctoken': $scope.appVersionReferenceData.ssoTokenForImage,
                              'X-Apple-Upload-ContentProviderId': $scope.user.contentProviderId,
                              'X-Original-Filename': $scope.convertToUnicodeStr($scope.tempPageContent.WatchAppIconFile.name),
                              'X-Apple-Upload-Validation-RuleSets': $scope.referenceData.imageSpecs.watchAppIcon.pictureType
                             },
                    file: $scope.tempPageContent.WatchAppIconFile
                }).progress(function(evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    //console.log("Success uploading large app icon to DU");
                    $scope.addWatchAppIconDataToMainJson(data, $scope.tempPageContent.WatchAppIconFile.name);
                    $scope.tempPageContent.watchAppIconInProgress = false;
                    $scope.imageUploadsInProgress--;

                    $scope.tempPageContent.watchAppIconDisplayUrl = URL.createObjectURL($scope.tempPageContent.WatchAppIconFile);

                }).error(function(data, status, headers, config) {
                    //console.log("LARGE APP ICON ERROR: Status - " + status);
                    if (data) {
                       var locErrorKey = "ITC.apps.validation."+ data.suggestionCode.toLowerCase();
                        var errorToShow = $scope.l10n.interpolate(locErrorKey);
                        if ($scope.l10n.interpolate(locErrorKey) === locErrorKey) {
                            errorToShow = $scope.l10n.interpolate('ITC.AppVersion.GeneralInfoSection.AppIconErrors.ImageNotLoaded');
                        }
                    } else {
                        var errorToShow = $scope.l10n.interpolate('ITC.AppVersion.DUGeneralErrors.FileNotLoaded');
                    }

                    $scope.tempPageContent.watchAppIconInProgress = false;
                    $scope.tempPageContent.userReadyToSave = false; //if we are in mid-save - stop
                    /*$scope.versionloaded = true;
                    $scope.setisReady();*/
                    $scope.setIsSaving(false);
                    $scope.saveInProgress = false;
                    $scope.simpleDropErrors.watchIconError = errorToShow;
                    $scope.imageUploadsInProgress--;
                });
            }
        }
        $scope.addWatchAppIconDataToMainJson = function(data, originalFilename) {
            if (!$scope.versionInfo.watchAppIcon.value) {
                $scope.versionInfo.watchAppIcon.value = {};
            }
            $scope.versionInfo.watchAppIcon.value.assetToken = data.token;
            $scope.versionInfo.watchAppIcon.value.originalFileName = originalFilename;
            $scope.versionInfo.watchAppIcon.value.size = data.length;
            $scope.versionInfo.watchAppIcon.value.width = data.width;
            $scope.versionInfo.watchAppIcon.value.height = data.height;
            $scope.versionInfo.watchAppIcon.value.checksum = data.md5;
        }

        /* **************************************************
        Save Function
        ************************************************** */
        $scope.saveVersionDetails = function() {
            console.log("started to save version details");
            console.log($scope.versionInfo);
            $scope.tempPageContent.userReadyToSave = true;
            $scope.saveInProgress = true;
            /*$scope.versionloaded = false;
            $scope.setisReady();*/
            $scope.setIsSaving(true);
            //only thing stopping save is any uploads in progress... will watch for them to be done then come back
            if ($scope.imageUploadsInProgress === 0) {
                if ($stateParams.ver && $stateParams.ver === "cur") {
                    $scope.saveIsLive = true;
                } else {
                    $scope.saveIsLive = false;
                }
                //appVersionInfo $scope.adamId,$stateParams.platform,$scope.uniqueId

                //saveVersionService.async($scope.adamId,$scope.versionInfo,$scope.saveIsLive).then(function(data) {
                univPurchaseService.updateAppVersionInfo($scope.adamId,$stateParams.platform,$scope.uniqueId,$scope.versionInfo).then(function(data) {
                    if (data.status == "500") {
                        //console.log("We've got a server error... 500")
                        /*$scope.versionloaded = true;
                        $scope.setisReady();*/
                        $scope.setIsSaving(false);
                        $scope.saveInProgress = false;
                        $scope.tempPageContent.showAdditionalError = true;
                        //$scope.tempPageContent.messageDisplaying = true;
                        $scope.tempPageContent.additionalError = $scope.l10n.interpolate('ITC.AppVersion.PageLevelErrors.ProblemDuringSave');
                        $scope.tempPageContent.scrollnow = true;
                    } else {
                        //console.log("tried to save version details");
                        //console.log(data);
                        $scope.$emit('refreshSubmitSummary');
                        $scope.$emit('reloadoverview');
                        //check for errors...
                        $scope.tempPageContent.contentSaved = true; //but may not have gone through - sectionErrorKeys will indicate status
                        //section error key check done in setupPageData...
                        $scope.setupPageData(data.data);
                    }
                });
            }
        };
                //used to check to see if "save" button should be enabled
        //Also acts as a general check if there are changes on page
        $scope.shouldSaveEnabled = function() {
            if ($scope.tempPageContent !== undefined && $scope.l10n !== undefined && Object.keys($scope.l10n).length > 0 && $scope.versionInfo !== undefined) {
                //console.log("should save enabled called..." + (angular.toJson($scope.versionInfo) !== angular.toJson($scope.orignalVersionInfo)) );
                if (angular.toJson($scope.versionInfo) !== angular.toJson($scope.orignalVersionInfo) ||  $scope.imageUploadsInProgress > 0) {
                        //there are changes now on the page - hide the "content saved" message
                        $scope.tempPageContent.contentSaved = false;
                        $scope.enableSaveButton = true;
                        $scope.tempPageContent.showSaveConfirm = false; //hide save confirm messages - and "saved" button styling
                        $scope.tempPageContent.confirmLeave.needToConfirm = true;
                        if ($scope.imageUploadsInProgress === 0) {
                            $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.Title'); //only used on custom confirmLeave modal
                            $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.message');
                        } else {
                            $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.UploadInProgressBeforeLeaving.Title'); //only used on custom confirmLeave modal
                            $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.UploadInProgressBeforeLeaving.message');
                        }
                } else if ($scope.versionInfo.isSaveError) {
                    $scope.enableSaveButton = true;
                    $scope.tempPageContent.confirmLeave.needToConfirm = true;
                    $scope.tempPageContent.contentSaved = false;
                    if ($scope.imageUploadsInProgress === 0) {
                        $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.Title'); //only used on custom confirmLeave modal
                        $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.message');
                    } else {
                        $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.UploadInProgressBeforeLeaving.Title'); //only used on custom confirmLeave modal
                        $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.UploadInProgressBeforeLeaving.message');
                    }
                } else {
                        //no new changes - nothing to save.
                        $scope.enableSaveButton = false;

                        //but is this in response to an error. if we have error keys and the issue isn't from a backend save error - save is not enabled - but we need to warn them before they leave the page.
                        if ($scope.versionInfo.sectionErrorKeys !== undefined &&
                        $scope.versionInfo.sectionErrorKeys !== null &&
                        $scope.versionInfo.sectionErrorKeys.length > 0 && $scope.versionInfo.validationError) {
                            $scope.tempPageContent.confirmLeave.needToConfirm = true;
                            if ($scope.imageUploadsInProgress === 0) {
                                $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.Title'); //only used on custom confirmLeave modal
                                $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.SaveChangesBeforeLeaving.message');
                            } else {
                                $scope.tempPageContent.confirmLeave.msgH1 = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.UploadInProgressBeforeLeaving.Title'); //only used on custom confirmLeave modal
                                $scope.tempPageContent.confirmLeave.msg = $scope.l10n.interpolate('ITC.AppVersion.PageLevelMessages.UploadInProgressBeforeLeaving.message');
                            }
                        } else {
                            $scope.tempPageContent.confirmLeave.needToConfirm = false;
                            $scope.tempPageContent.confirmLeave.msg = "";
                        }


                }
                //now check for errors on the page
                if (($scope.versionInfo.sectionErrorKeys !== undefined &&
                        $scope.versionInfo.sectionErrorKeys !== null &&
                        $scope.versionInfo.sectionErrorKeys.length > 0) ||
                    ($scope.tempPageContent.errorTracker !== undefined &&
                        $scope.tempPageContent.errorTracker.length > 0) ||
                    ($scope.tempPageContent.formErrors.count !== undefined &&
                        $scope.tempPageContent.formErrors.count > 0) ||
                    $scope.showRatingsErrorIcon) {
                        $scope.tempPageContent.thisPageHasErrors = true;
                        $scope.tempPageContent.showSaveConfirm = false;
                } else if ($scope.tempPageContent.contentSaved) {
                    $scope.tempPageContent.thisPageHasErrors = false;
                    $scope.tempPageContent.showSaveConfirm = true;
                }

                $timeout(function() {//removing this will cause a crash since this function is called from within a "$watch"
                    $scope.$apply();
                });
            }
        }


        /* **************************************************
        Main page load / init functions
        ************************************************** */
        $scope.loadVersionDetails = function() {
            $scope.tempPageContent.scrollnow = true;

            //look up id in appOverviewData via platform and state
            $scope.platformOverviewInfo = _.findWhere($scope.appOverviewData.platforms,{'platformString':$stateParams.platform});
            $scope.stateParamsPlatform = $stateParams.platform;


            if ($state.current.name === "app_overview.store.versioninfo") {
                if ($scope.platformOverviewInfo.inFlightVersion !== null) {
                    $scope.uniqueId = $scope.platformOverviewInfo.inFlightVersion.id;
                } else {
                    $state.go('app_overview.store.versioninfo_deliverable',$stateParams,{reload:true});
                    $scope.uniqueId = $scope.platformOverviewInfo.deliverableVersion.id;
                }
            } else { //state is: app_overview.store.versioninfo.deliverable
                $scope.uniqueId = $scope.platformOverviewInfo.deliverableVersion.id;
            }

            //adding this to ensure we have all pagewrapper JSONs before loading app details...
            univPurchaseService.appVersionInfo($scope.adamId,$stateParams.platform,$scope.uniqueId).then(function(data) {
                if (data.status == "500") {
                    window.location = global_itc_path + "/wa/defaultError";
                } else {
                    $scope.versionInfo = data.data;
                            //hold off loading the rest of the page until parentscope is loaded
                    $scope.$parent.$watch('parentScopeLoaded',function() {
                        if ($scope.parentScopeLoaded && !$scope.pageHasLoadedOnce) {
                            $scope.setupPageData(false);
                            $scope.pageHasLoadedOnce = true;
                        }
                    });
                }
            });

            loadBuildCandidates();
        }

        $scope.reloadVersionDetails = function(showMM) {
            $scope.tempPageContent.scrollnow = true;

            //look up id in appOverviewData via platform and state
            $scope.platformOverviewInfo = _.findWhere($scope.appOverviewData.platforms,{'platformString':$stateParams.platform});
            $scope.stateParamsPlatform = $stateParams.platform;


            if ($state.current.name === "app_overview.store.versioninfo") {
                if ($scope.platformOverviewInfo.inFlightVersion !== null) {
                    $scope.uniqueId = $scope.platformOverviewInfo.inFlightVersion.id;
                } else {
                    $state.go('app_overview.store.versioninfo_deliverable',$stateParams,{reload:true});
                    $scope.uniqueId = $scope.platformOverviewInfo.deliverableVersion.id;
                }
            } else { //state is: app_overview.store.versioninfo.deliverable
                $scope.uniqueId = $scope.platformOverviewInfo.deliverableVersion.id;
            }

            $scope.appInfoIsLoading = true;

            //adding this to ensure we have all pagewrapper JSONs before loading app details...
            univPurchaseService.appVersionInfo($scope.adamId,$stateParams.platform,$scope.uniqueId).then(function(data) {
                if (data.status == "500") {
                    $scope.appInfoIsLoading = false;
                    window.location = global_itc_path + "/wa/defaultError";
                } else {
                    $scope.currentLoc = $scope.getLanguageKey($scope.appOverviewData.primaryLocaleCode);
                    $scope.setupPageData(data.data);
                    $timeout(function() {
                        $scope.appInfoIsLoading = false;
                        if ($scope.hasProviderFeature('SSENABLED')) {
                            $scope.reallyShowMediaManager(showMM, $scope.tempPageContent.savedGoToTab, $scope.tempPageContent.savedGoToDevice);
                        }
                    }, 500); // it takes 500 ms for screenshots to disappear. If we delay showing MM by 500, we see no screenshots disappearing.

                }
            });

            loadBuildCandidates();
        }

        $scope.showTVAssetsFromBinary = function() {
            return $scope.isTVPlatform() && $scope.hasAtvIcons();
        }

        $scope.isTVPlatform = function() {
            return ($stateParams.platform === "appletvos" || $stateParams.platform === "appletvtemplate");
        }

        $scope.hasAtvIcons = function() {
            //comment this line out.
            //return true;

            if ($scope.versionInfo) {
                var hasAppIcon = $scope.versionInfo.largeAppIcon && $scope.versionInfo.largeAppIcon.value && $scope.versionInfo.largeAppIcon.value.assetToken;
                var hasHomeScreenIcon = $scope.versionInfo.atvHomeScreenIcon && $scope.versionInfo.atvHomeScreenIcon.assetToken;
                var hasTopShelfIcon = $scope.versionInfo.atvTopShelfIcon && $scope.versionInfo.atvTopShelfIcon.assetToken;
                return hasAppIcon || hasHomeScreenIcon || hasTopShelfIcon;
            }
            else {
                return false;
            }
        }

        $scope.clearAtvIcons = function() {
            if (!$scope.showTVAssetsFromBinary()) {
                return;
            }

            if ($scope.tempPageContent.lsrData && $scope.tempPageContent.lsrData.lsrTokens && $scope.tempPageContent.lsrData.lsrUrlsFlattened) {
                $scope.tempPageContent.lsrData.lsrTokens.length = 0;
                $scope.tempPageContent.lsrData.lsrUrlsFlattened.length = 0;
            }

            // so that this section doesn't show
            $scope.versionInfo.largeAppIcon = null;
            $scope.versionInfo.atvHomeScreenIcon = null;
            $scope.versionInfo.atvTopShelfIcon = null;
        }

        $scope.showMsgsAssetsFromBinary = function() {
            if ($scope.versionInfo && $scope.versionInfo.preReleaseBuild && $scope.versionInfo.preReleaseBuild !== null) {
                return $scope.hasProviderFeature('VOYAGER') &&
                    ($scope.versionInfo.preReleaseBuild.iconAssetToken || $scope.versionInfo.preReleaseBuild.messagesIconAssetToken || $scope.versionInfo.preReleaseBuild.watchIconAssetToken);
            }
            else {
                return false;
            }
        }

        $scope.clearMsgsIcons = function() {
            if (!$scope.showMsgsAssetsFromBinary()) {
                return;
            }

            if ($scope.tempPageContent.msgsData && $scope.tempPageContent.msgsData.msgsTokens && $scope.tempPageContent.msgsData.msgsUrlsFlattened) {
                $scope.tempPageContent.msgsData.msgsTokens.length = 0;
                $scope.tempPageContent.msgsData.msgsUrlsFlattened.length = 0;
            }

            // so that this section doesn't show
            $scope.versionInfo.preReleaseBuild.iconAssetToken = null;
            $scope.versionInfo.preReleaseBuild.messagesIconAssetToken = null;
            $scope.versionInfo.preReleaseBuild.watchIconAssetToken = null;
        }

        // Updates $scope.tempPageContent.lsrData from data in data.
        $scope.updateAtvIcons = function(data) {

            if (!$scope.isTVPlatform()) {
                return;
            }

            if (!$scope.tempPageContent.lsrData) {
                $scope.tempPageContent.lsrData = {};
            }

            if ($scope.tempPageContent.lsrData.lsrTokens) {
                $scope.tempPageContent.lsrData.lsrTokens.length = 0;
            }
            else {
                $scope.tempPageContent.lsrData.lsrTokens = new Array();
            }

            var hasAppIcon = data.largeAppIcon && data.largeAppIcon.value && data.largeAppIcon.value.assetToken;
            var hasHomeScreenIcon = data.atvHomeScreenIcon && data.atvHomeScreenIcon.assetToken;
            var hasTopShelfIcon = data.atvTopShelfIcon && data.atvTopShelfIcon.assetToken;

            if (hasAppIcon) {
                $scope.tempPageContent.lsrData.lsrTokens.push(
                    {
                        title: $scope.l10n.interpolate('ITC.AppVersion.BuildSection.Assets.type.largeAppIcon'),
                        parallax: true,
                        token: data.largeAppIcon.value.assetToken
                    });
            }
            if (hasTopShelfIcon) {
                $scope.tempPageContent.lsrData.lsrTokens.push(
                    {
                        title: $scope.l10n.interpolate('ITC.AppVersion.BuildSection.Assets.type.atvTopShelfIcon'),
                        parallax: false, // not an lsr
                        token: data.atvTopShelfIcon.assetToken
                    });
            }
            if (hasHomeScreenIcon) {
                $scope.tempPageContent.lsrData.lsrTokens.push(
                    {
                        title: $scope.l10n.interpolate('ITC.AppVersion.BuildSection.Assets.type.atvHomeScreenIcon'),
                        parallax: true,
                        token: data.atvHomeScreenIcon.assetToken
                    });
            }

            $scope.tempPageContent.lsrData.currentIndex = 0;

            $scope.tempPageContent.lsrData.lsrUrlsFlattened = _.map($scope.tempPageContent.lsrData.lsrTokens, function(token) {
                return $scope.getFlattenedLsrUrl(token);
            });

        }

        // Updates $scope.tempPageContent.lsrData from data in data.
        $scope.updateMsgsIcons = function(data) {

            if (!$scope.hasProviderFeature('VOYAGER')) {
                return;
            }

            if (!$scope.tempPageContent.msgsData) {
                $scope.tempPageContent.msgsData = {};
            }

            if ($scope.tempPageContent.msgsData.msgsTokens) {
                $scope.tempPageContent.msgsData.msgsTokens.length = 0;
            }
            else {
                $scope.tempPageContent.msgsData.msgsTokens = new Array();
            }

            var hasIcon = data && data.iconAssetToken;
            var hasMsgsIcon = data && data.messagesIconAssetToken;
            var hasWatchIcon = data && data.watchIconAssetToken;

            if (hasIcon) {
                $scope.tempPageContent.msgsData.msgsTokens.push(
                    {
                        title: $scope.l10n.interpolate('ITC.AppVersion.BuildSection.Assets.type.appIcon'),
                        parallax: false,
                        token: data.iconAssetToken,
                        mask: "appIcon"
                    });
            }
            if (hasWatchIcon) {
                $scope.tempPageContent.msgsData.msgsTokens.push(
                    {
                        title: $scope.l10n.interpolate('ITC.AppVersion.BuildSection.Assets.type.appleWatchIcon'),
                        parallax: false,
                        token: data.watchIconAssetToken,
                        mask: "appleWatchIcon"
                    });
            }
            if (hasMsgsIcon) {
                $scope.tempPageContent.msgsData.msgsTokens.push(
                    {
                        title: $scope.l10n.interpolate('ITC.AppVersion.BuildSection.Assets.type.iMsgIcon'),
                        parallax: false, // not an lsr
                        token: data.messagesIconAssetToken,
                        mask: "iMessageIcon",
                        //height: 55
                    });
            }

            $scope.tempPageContent.msgsData.currentIndex = 0;

            $scope.tempPageContent.msgsData.msgsUrlsFlattened = _.map($scope.tempPageContent.msgsData.msgsTokens, function(token) {
                return $scope.getFlattenedLsrUrl(token, true);
            });

        }

        // For testing only. To be removed once there are real assets.
        $scope.initAtvIconsTest = function() {
            if (!$scope.tempPageContent.lsrData) {
                $scope.tempPageContent.lsrData = {};
            }

            if ($scope.tempPageContent.lsrData.lsrTokens) {
                $scope.tempPageContent.lsrData.lsrTokens.length = 0;
            }
            else {
                $scope.tempPageContent.lsrData.lsrTokens = new Array();
            }

            // tbd - get the asset tokens from the json
            $scope.tempPageContent.lsrData.lsrTokens.push(
                    {title: 'a', parallax: true, token: 'Music4/v4/87/a6/3b/87a63b66-efe3-59e6-e9c5-74dfaf58cee9/source'});
            $scope.tempPageContent.lsrData.lsrTokens.push(
                    {title: 'b', parallax: true, token: 'Features/v4/60/40/04/60400454-9e59-5825-1f25-bc7fa033f59f/source'});
            $scope.tempPageContent.lsrData.lsrTokens.push(
                    {title: 'c', parallax: true, token: 'Video/v4/53/63/02/5363022e-fab6-baa1-29be-f0ae809540c3/source'});
            $scope.tempPageContent.lsrData.lsrTokens.push(
                    {title: 'd', parallax: false, token: 'Purple5/v4/81/d3/8f/81d38f44-ced5-4d74-01b9-a9ef65518aa4/pr_source.png'}); // not an lsr

            $scope.tempPageContent.lsrData.currentIndex = 0;

            $scope.tempPageContent.lsrData.lsrUrlsFlattened = _.map($scope.tempPageContent.lsrData.lsrTokens, function(token) {
                return $scope.getFlattenedLsrUrl(token);
            });
        }

        $scope.getFlattenedLsrUrl = function(token, useFixedWidth) {
            if (!$scope.tempPageContent) {
                return;
            }
            if (!$scope.tempPageContent.allFlattenedUrls) {
                $scope.tempPageContent.allFlattenedUrls = {};
            }

            var memoizedUrl = $scope.tempPageContent.allFlattenedUrls[token.token];
            if (memoizedUrl) {
                return memoizedUrl;
            }

            var ht = 75; // default
            if (token.height) {
                ht = token.height;
            }
            var config = {
                token: token.token,
                height: ht,
                formatType: ai.imageservice.FormatType.PNG // gets a flattened lsr.
            };
            if (useFixedWidth) {
                config.height = 9999; // conserves aspect ratio (any huge number will work)
                config.width = 75;
            }
            var url = $scope.img_url_gen.generateUrlForToken(config);
            $scope.tempPageContent.allFlattenedUrls[token.token] = url; // memoize it
            return url;
        }

        $scope.imageAssetClicked = function(index, dataType) {
            $scope.tempPageContent[dataType].currentIndex = index;
            $scope.tempPageContent[dataType].showSlideshow = true;
        }

        $scope.useMessagesIcon = function() {
            return $scope.versionInfo.preReleaseBuild.launchProhibited && $scope.versionInfo.preReleaseBuild.hasMessagesExtension;
        }

        $scope.getBuildIconUrl = function() {
            if (!$scope.versionInfo) {
                return null;
            }
            if (!$scope.versionInfo.preReleaseBuild) {
                return $scope.versionInfo.preReleaseBuildIconUrl;
            }
            var token = {};
            if ($scope.useMessagesIcon()) {
                token.token = $scope.versionInfo.preReleaseBuild.messagesIconAssetToken;
            }
            else {
                token.token = $scope.versionInfo.preReleaseBuild.iconAssetToken;
            }

            if (!token.token) {
                return null;
            }
            return $scope.getFlattenedLsrUrl(token, true);
        }

        $scope.getBuildIconMask = function() {
            if (!$scope.versionInfo || ! $scope.versionInfo.preReleaseBuild) {
                return null;
            }

            if ($scope.useMessagesIcon()) {
                return "iMessageIcon";
            }
            else {
                return "appIcon";
            }
        }

        /******* For use in choose a build modal *******/

        $scope.useMessagesIconForBuild = function(build) {
            return build.launchProhibited && build.hasMessagesExtension;
        }

        $scope.getBuildIconUrlForBuild = function(build) {
            if (!$scope.versionInfo) {
                return null;
            }

            var token = {};
            if ($scope.useMessagesIconForBuild(build)) {
                token.token = build.messagesIconAssetToken;
            }
            else {
                token.token = build.iconAssetToken;
            }

            if (!token.token) {
                return null;
            }
            return $scope.getFlattenedLsrUrl(token, true);
        }

        $scope.getBuildIconMaskForBuild = function(build) {
            if ($scope.useMessagesIconForBuild(build)) {
                return "iMessageIcon";
            }
            else {
                return "appIcon";
            }
        }

        /****** End For use in choose a build modal *******/

        $scope.setupPageData = function(updatedVersionInfo) { //pass in updated version info after a save
                $scope.infoKeys = {};
                $scope.img_url_gen = new ai.imageservice.ImageURLGenerator($scope.referenceData.imageServiceBaseUrl);
                $scope.mainNavCurrentKey = 'ITC.AppVersion.MainNav.Versions';
                $rootScope.currentPage = $scope.l10n.interpolate('ITC.HomePage.ManagePurpleSoftwareLinkText'); //text in header
                //reset page load issues error
                $scope.tempPageContent.showAdditionalError = false;
                $scope.tempPageContent.additionalError = "";
                $scope.tempPageContent.deleteButtonOnWatchHasText = true;
                $scope.modalsDisplay.submitForReviewModal.show = false;

                $scope.updateAtvIcons($scope.versionInfo);
                $scope.updateMsgsIcons($scope.versionInfo.preReleaseBuild);
                //$scope.initAtvIconsTest(); // comment out - just for testing

                //reset ready to save
                $scope.tempPageContent.userReadyToSave = false;

                //reset versioninfo scope
                if (updatedVersionInfo) { //if we have updated version info - put it into main scope object..
                    //console.log("updated version info: " , updatedVersionInfo);
                    $scope.versionInfo = updatedVersionInfo;
                }

                //confirm status hasn't changed from what is in overviewdata
                var matchingPlatform = _.findWhere($scope.appOverviewData.platforms,{'platformString': $scope.versionInfo.platform});
                if (matchingPlatform !== undefined) {
                    var overviewStatusValue;
                    //find matching version
                    if (matchingPlatform.deliverableVersion !== null && parseInt(matchingPlatform.deliverableVersion.id) === $scope.versionInfo.versionId) {
                        overviewStatusValue = matchingPlatform.deliverableVersion.state;
                    } else if (matchingPlatform.inFlightVersion !== null && parseInt(matchingPlatform.inFlightVersion.id) === $scope.versionInfo.versionId) {
                        overviewStatusValue = matchingPlatform.inFlightVersion.state;
                    }
                    if (overviewStatusValue !== undefined && overviewStatusValue !== $scope.versionInfo.status) {
                        //status is different refresh overviewData and reload
                        $scope.$emit('reloadoverview');
                    }
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

                //set default loc view to default loc/primary lang
                var previousLoc = $scope.currentLoc;
                $scope.primaryLangKey = $scope.getLanguageKey($scope.appOverviewData.primaryLocaleCode);
                if ($scope.currentLoc === undefined) { // don't set the currentLoc unless it hasn't been set yet
                    $scope.currentLoc = $scope.primaryLangKey;
                }
                //remove used localizations from the list of localization that can be added
                $scope.updateNonLocalizedList();

                // format readonly description, release notes
                if ($scope.versionInfo.details != undefined && $scope.versionInfo.details.value[$scope.currentLoc].description.value != "" && $scope.versionInfo.details.value[$scope.currentLoc].description.value != null) {
                   $scope.currentDescriptionReadonly = $sce.trustAsHtml($scope.versionInfo.details.value[$scope.currentLoc].description.value.replace(/\n([ \t]*\n)+/g, '</p><p>').replace('\n', '<br />'));
                }
                //if ($scope.versionInfo.details != undefined && $scope.versionInfo.details.value[$scope.currentLoc].watchDescription != undefined && $scope.versionInfo.details.value[$scope.currentLoc].watchDescription.value != "" && $scope.versionInfo.details.value[$scope.currentLoc].watchDescription.value != null) {
                //   $scope.currentWatchDescriptionReadonly = $sce.trustAsHtml($scope.versionInfo.details.value[$scope.currentLoc].watchDescription.value.replace(/\n([ \t]*\n)+/g, '</p><p>').replace('\n', '<br />'));
                //}
                if ($scope.versionInfo.details != undefined && $scope.versionInfo.details.value[$scope.currentLoc].releaseNotes.value != "" && $scope.versionInfo.details.value[$scope.currentLoc].releaseNotes.value != null) {
                    $scope.currentRealeaseNotesReadonly = $sce.trustAsHtml($scope.versionInfo.details.value[$scope.currentLoc].releaseNotes.value.replace(/\n([ \t]*\n)+/g, '</p><p>').replace('\n', '<br />'));
                }

                //determine class for description textarea
                /*if ($scope.hideIfNullAndNotEditable($scope.versionInfo.details.value[$scope.currentLoc].releaseNotes)) {
                    $scope.tempPageContent.descriptionClass = 'tall';
                } else {
                    $scope.tempPageContent.descriptionClass = 'extraTall';
                }*/

                //format localized error strings:

                $scope.tempPageContent.descriptionMaxCharsExceeded = $scope.l10n.interpolate('ITC.AppVersion.LocalizedSection.DescriptionErrors.MaxCharsExceeded', {'maxchars':$scope.referenceData.appMetaDataReference.maxAppDescriptionChars});

                $scope.tempPageContent.releaseNotesMaxCharsExceeded = $scope.l10n.interpolate('ITC.AppVersion.LocalizedSection.ReleaseNotesErrors.MaxCharsExceeded',{'maxchars':$scope.referenceData.appMetaDataReference.maxAppReleaseNotesChars});

                $scope.tempPageContent.reviewNotesMaxCharsExceeded = $scope.l10n.interpolate('ITC.AppVersion.AppReviewSection.reviewNotesMaxChars',{'maxchars':$scope.referenceData.appMetaDataReference.maxReviewNotesChars});

                $scope.tempPageContent.entitlementMaxCharsExceeded = $scope.l10n.interpolate('ITC.AppVersion.AppSandboxInformation.EntitlementJustificationMaxChars',{'maxchars':$scope.referenceData.appMetaDataReference.maxJustificationChars});

                //$scope.updateEULAInfo();

                $scope.initializeMediaErrorHolder();
                $scope.initializeMediaDataHolder();

                // moved this up just before currentLoc changes
                // if there were errors, don't clear previous values
                var mediaExisted = false;
                if (!$scope.updatedVersionInfoHasErrors($scope.versionInfo)) { // if no errors
                    mediaExisted = $scope.initSnapshotDetails(); // clear previous values from temporary storage (groups)
                } else { // if had errors, keep temporary storage (groups) and save errors to them
                    $scope.checkForSnapshotErrors($scope.versionInfo);
                    if ($scope.hasProviderFeature('SSENABLED') && $scope.hasProviderFeature('VOYAGER')) {
                        $scope.checkForSnapshotErrors($scope.versionInfo, true);
                    }
                    $scope.checkForVideoErrors($scope.versionInfo);
                    this.lastLoc = null; // important to clear out lastLoc and lastDev
                    this.lastDev = null; // before calling updateSnapshotDetails()
                }

                // Only want this to happen if updatedVersionInfo is not false and previous loc is same as current loc
                // Any other case and this will happen when $scope.currentLoc changes.
                if (updatedVersionInfo && previousLoc === $scope.currentLoc) {
                    $scope.updateSnapshotDetails(true, mediaExisted); // update snapshots & video from either the server or from temp storage
                    if ($scope.watchDataExists()) {
                        $scope.watchSectionOpen = $scope.hasWatchData() || $scope.hasBinaryThatSupportsAppleWatch();
                        $scope.updateWatchScreenshots(true);
                    }
                    if ($scope.hasProviderFeature('SSENABLED') && $scope.hasProviderFeature('VOYAGER')) {
                        $scope.messagesSectionOpen = $scope.hasMsgsData() || $scope.hasBinaryThatSupportsMessages();
                        $scope.updateMsgSnapshotDetails(true);
                    }
                }

            if (deep($scope,'versionInfo.largeAppIcon.errorKeys') !== undefined) {
                if (!$scope.versionInfo.largeAppIcon.errorKeys || $scope.versionInfo.largeAppIcon.errorKeys.length === 0) { // as long as the error wasn't with the app icon
                    $scope.simpleDropErrors.error = false; // clear clear app icon error that might be displaying
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

                $scope.shouldShowSubmitForReviewButton = false;
                angular.forEach($scope.appOverviewData.submittablePlatforms,function(platform){
                    if (platform === $scope.versionInfo.platform) {
                        $scope.shouldShowSubmitForReviewButton = true;
                    }
                });

                //setup display app icon url
                if ($scope.versionInfo.largeAppIcon.value && $scope.versionInfo.largeAppIcon.value.assetToken) {
                    //$scope.tempPageContent.appIconDisplayUrl = $scope.versionInfo.largeAppIcon.value.url; // old way
                    var appIconConfig = {
                        token: $scope.versionInfo.largeAppIcon.value.assetToken,
                        width: THUMBNAIL_ICON_SIZE,
                        height: THUMBNAIL_ICON_SIZE
                    };
                    $scope.tempPageContent.appIconDisplayUrl = $scope.img_url_gen.generateUrlForToken(appIconConfig);
                }
                else {
                    $scope.tempPageContent.appIconDisplayUrl = null;
                }

                //setup display watch app icon url
                if ($scope.versionInfo.watchAppIcon) {
                    if ($scope.versionInfo.watchAppIcon.value && $scope.versionInfo.watchAppIcon.value.assetToken) {
                        //$scope.tempPageContent.watchAppIconDisplayUrl = $scope.versionInfo.watchAppIcon.value.url; // old way
                        var watchIconConfig = {
                            token: $scope.versionInfo.watchAppIcon.value.assetToken,
                            width: THUMBNAIL_WATCH_ICON_SIZE,
                            height: THUMBNAIL_WATCH_ICON_SIZE
                        };
                        $scope.tempPageContent.watchAppIconDisplayUrl = $scope.img_url_gen.generateUrlForToken(watchIconConfig);
                    } else {
                        $scope.tempPageContent.watchAppIconDisplayUrl = null;
                    }
                }

                /******* REFERENCE DATA FORMATTING ********/
                $scope.$watch('referenceData',function() {
                    if($scope.referenceData != undefined) {
                        $scope.countryList = $scope.referenceData.contactCountries;
                        $scope.countryList.sort();

                        $scope.addressCountryList = $scope.referenceData.addressCountries;
                        $scope.addressCountryList.sort();

                        //which list of genres do we need ios or macos
                        if ($scope.tempPageContent.isMac) {
                            $scope.categoryList = $scope.referenceData.macOSGenres;
                            $scope.updateEntitlementsList();
                        } else { //if ($scope.tempPageContent.isIOS) {
                            $scope.categoryList = $scope.referenceData.iosgenres;
                        }
                        $scope.updateDevices();
                        $scope.determinePreviewUploadAndPlayPermissions();
                        $scope.setNumVideos();
                    }
                });


                // Screenshots: sort and make consecutive before we start listening to versionInfo changes.
                $scope.makeScreenshotSortOrderConsecutive();

                //if no release date set - set to manual by default.
                if ($scope.versionInfo.releaseOnApproval.value === null) {
                    $scope.versionInfo.releaseOnApproval.value = "true";
                }

                // set up release date calendar vars
                $scope.setupReleaseDateCalendarVars();

                $scope.showAdditionalInfo = false;
                if (Object.getOwnPropertyNames($scope.versionInfo.appVersionPageLinks).length > 0) {
                    $scope.showAdditionalInfo = true;
                }

                $scope.orignalVersionInfo = angular.copy($scope.versionInfo);
                $scope.setupGameCenter();
                $scope.checkAddOns();
                $scope.checkRatingsErrors();
                $scope.initRatings();
                $scope.updateBrazilRating();
                $scope.errorCheckingLocalizations();
                $scope.shouldSaveEnabled();
                //$scope.enableSaveButton = false; //should not enable save upon dataload...
                $scope.versionloaded = true;
                $scope.setisReady();
                $scope.setIsSaving(false);
                $scope.saveInProgress = false;
                $scope.submitForReviewInProgress = false;
                //log("Version info: ", $scope.versionInfo);
        }

        // Sets up release date date picker variables
        $scope.setupReleaseDateCalendarVars = function() {
                $scope.tempPageContent.releaseDateInfo = {};
                $scope.tempPageContent.releaseDateInfo.releaseDateInterval = "d";
                $scope.tempPageContent.releaseDateInfo.releaseOnApproval = null;
                $scope.tempPageContent.releaseDateInfo.dateSel = $scope.getTodayMoment(); // moment();

                $scope.tempPageContent.releaseDateInfo.showing = true;
                $scope.tempPageContent.releaseDateInfo.displaySelectedDate = true;

                $scope.tempPageContent.releaseDateInfo.localizedText = {};
                $scope.tempPageContent.releaseDateInfo.localizedText.month = $scope.l10n.interpolate('ITC.timeUnits.month.singular');
                $scope.tempPageContent.releaseDateInfo.localizedText.day = $scope.l10n.interpolate('ITC.timeUnits.day.singular');

                $scope.tempPageContent.releaseDateInfo.userClicked = false;
                $scope.tempPageContent.releaseDateInfo.restrictDateStart = moment().subtract(1, "days");
                $scope.tempPageContent.releaseDateInfo.restrictDateEnd = null;

                $scope.tempPageContent.releaseDateInfo.timeSel = 0; // milliseconds since midnight

                /*
                For the auto-with-date option checked - autoReleaseDate should not be null and releaseOnApproval should be false
                For manual option to be checked - autoReleaseDate should be null and releaseOnApproval should be false
                For auto option - autoReleaseDate should be null and releaseOnApproval should be true
                */
                if ($scope.versionInfo.releaseOnApproval.value === "false") { // could be manual OR auto-with date
                    if ($scope.versionInfo.autoReleaseDate.value === null) {
                        $scope.tempPageContent.releaseDateInfo.releaseOnApproval = RELEASE_MANUAL;
                    }
                    else { // auto-with-date
                        $scope.tempPageContent.releaseDateInfo.releaseOnApproval = RELEASE_AUTO_AFTER_DATE;
                        $scope.tempPageContent.releaseDateInfo.displaySelectedDate = true;

                        // split $scope.versionInfo.autoReleaseDate.value into day and time
                        var dayPlusTime = moment($scope.versionInfo.autoReleaseDate.value);
                        var day = dayPlusTime.format("YYYY-MM-DD");
                        var dayMoment = moment(day);
                        var dayMomentMs = dayMoment.valueOf();
                        var hourMs = $scope.versionInfo.autoReleaseDate.value - dayMomentMs;


                        $scope.tempPageContent.releaseDateInfo.dateSel = moment(dayMomentMs);
                        $scope.tempPageContent.releaseDateInfo.timeSel = hourMs;

                    }
                }
                else if ($scope.versionInfo.releaseOnApproval.value === "true") { // auto
                    $scope.tempPageContent.releaseDateInfo.releaseOnApproval = RELEASE_AUTO;
                }
        }

        // Gets TODAY at midnight.
        $scope.getTodayMoment = function() {
            var year = moment().get('year');
            var month = moment().get('month') + 1;
            var date = moment().get('date');
            return moment(year+"-"+month+"-"+date, "YYYY-MM-DD");
        }

        /*
        For the auto-with-date option checked - autoReleaseDate should not be null and releaseOnApproval should be false
        For manual option to be checked - autoReleaseDate should be null and releaseOnApproval should be false
        For auto option - autoReleaseDate should be null and releaseOnApproval should be true
        */
        $scope.$watch('tempPageContent.releaseDateInfo.releaseOnApproval', function(newVal, oldVal) {
            if (newVal !== undefined && oldVal !== undefined) {
                if (newVal === RELEASE_MANUAL) {
                    $scope.versionInfo.releaseOnApproval.value = "false";
                    $scope.versionInfo.autoReleaseDate.value = null;
                }
                else if (newVal === RELEASE_AUTO) {
                    $scope.versionInfo.releaseOnApproval.value = "true";
                    $scope.versionInfo.autoReleaseDate.value = null;
                }
                else if (newVal === RELEASE_AUTO_AFTER_DATE ) {
                    $scope.versionInfo.releaseOnApproval.value = "false";
                    $scope.setAutoReleaseDateValue();
                }
            }
        });

        $scope.releaseTimePickerDisabled = function() {
            if ($scope.tempPageContent.releaseDateInfo === undefined) {
                return true;
            }
            return ($scope.tempPageContent.releaseDateInfo.releaseOnApproval !== RELEASE_AUTO_AFTER_DATE);
        }

        $scope.$watch('tempPageContent.releaseDateInfo.dateSel', function(newVal, oldVal) {
            if (newVal) {
                $scope.setAutoReleaseDateValue();
            }
        });

        $scope.$watch('versionInfo.autoReleaseDate.value', function(newVal, oldVal) {
            if ($scope.tempPageContent.releaseDateInfo &&
                $scope.tempPageContent.releaseDateInfo.displaySelectedDate !== undefined) {
                $scope.tempPageContent.releaseDateInfo.displaySelectedDate = true; // otherwise it reverts to false, and 'MM DD, YYYY' displays
            }
        });

        // timeSel will be populated by the releaseDate time from the timepicker in milliseconds since midnight
        $scope.$watch('tempPageContent.releaseDateInfo.timeSel', function(newVal, oldVal) {
            if (newVal !== undefined) {
                $scope.setAutoReleaseDateValue();
            }
        });

        // Sets $scope.versionInfo.autoReleaseDate.value
        $scope.setAutoReleaseDateValue = function() {
            var isAMomentObj = $scope.tempPageContent.releaseDateInfo.dateSel._isAMomentObject;

            // date is now always selected
            //var dateSelected = ($scope.versionInfo.autoReleaseDate.value || $scope.tempPageContent.releaseDateInfo.userClicked);

            if ($scope.tempPageContent.releaseDateInfo.releaseOnApproval === RELEASE_AUTO_AFTER_DATE) {
                var oldVal = $scope.versionInfo.autoReleaseDate.value;
                var m;
                if (isAMomentObj) {
                    m = $scope.tempPageContent.releaseDateInfo.dateSel;
                }
                else {
                    m = moment($scope.tempPageContent.releaseDateInfo.dateSel, "YYYYMMDD");
                }
                var long = m.valueOf();
                var hourMs = $scope.tempPageContent.releaseDateInfo.timeSel;
                if (hourMs !== undefined) {
                    $scope.versionInfo.autoReleaseDate.value = long + hourMs;
                }
                else {
                    $scope.versionInfo.autoReleaseDate.value = long;
                }
            }
        }

        $scope.shouldShowGMTTime = function() {
            if (!$scope.tempPageContent || !$scope.tempPageContent.releaseDateInfo) {
                return false;
            }

            if (($scope.tempPageContent.releaseDateInfo.releaseOnApproval === RELEASE_AUTO_AFTER_DATE)
                    && $scope.versionInfo.autoReleaseDate.value) {
                return true;
            }
            else {
                return false;
            }
        }

        $scope.gmtTime = function() {
            if ($scope.versionInfo) {
                var mmt = moment($scope.versionInfo.autoReleaseDate.value).utc();
                return mmt.format("MMM D, YYYY h:mm A [(GMT)]");
                //return ITC.time.showUTCDateAtTime(moment($scope.versionInfo.autoReleaseDate.value));
            }
            else {
                return "";
            }
        }

        $scope.getDevicesFromScreenshotsJSON = function(loc) {
            var devices;
            if ($scope.hasProviderFeature('SSENABLED')) {
                var screenshotsGroupsAtLoc = $scope.versionInfo.details.value[loc].displayFamilies.value;
                devices = _.map(screenshotsGroupsAtLoc, function(group) {
                    return group.name;
                });
            }
            else {
                var screenshotsAtLoc = $scope.versionInfo.details.value[loc].screenshots.value;
                devices = Object.keys(screenshotsAtLoc);
            }
            return devices;
        }

        $scope.getDevicesFromScreenshotsJSONWithLocaleCode = function(localeCode) {
            var screenshots, details;
            detailsAtLoc = _.find($scope.versionInfo.details.value, function(langGroup) {
                return langGroup.language.toLowerCase() === localeCode.toLowerCase();
            });

            if ($scope.hasProviderFeature('SSENABLED')) {
                var screenshotsGroupsAtLoc = detailsAtLoc.displayFamilies.value;
                devices = _.map(screenshotsGroupsAtLoc, function(group) {
                    return group.name;
                });
            }
            else {
                var screenshotsAtLoc = detailsAtLoc.screenshots.value;
                devices = Object.keys(screenshotsAtLoc);
            }
            return devices;
        }

        $scope.getScreenshotsArr = function(loc, device) {
            var screenshots = $scope.getScreenshots(loc, device);
            if (screenshots) {
                return screenshots.value;
            }
            else {
                return null;
            }
        }

        $scope.getMsgsScreenshotsArr = function(loc, device) {
            var screenshots = $scope.getMsgsScreenshots(loc, device);
            if (screenshots) {
                return screenshots.value;
            }
            else {
                return null;
            }
        }

        $scope.getScreenshotsArrWithLocaleCode = function(localeCode, device) {
            return $scope.getScreenshotsWithLocaleCode(localeCode, device).value;
        }

        $scope.getMsgsScreenshotsArrWithLocaleCode = function(localeCode, device) {
            return $scope.getMsgsScreenshotsWithLocaleCode(localeCode, device).value;
        }

        // To get the resulting array of screenshots, get .value of what this method returns
        $scope.getScreenshots = function(loc, device, updatedVersionInfo) {
            var screenshots, details;
            if (updatedVersionInfo) {
                details = updatedVersionInfo.details.value[loc];
            }
            else {
                details = $scope.versionInfo.details.value[loc];
            }
            if ($scope.hasProviderFeature('SSENABLED')) {
                var groups = details.displayFamilies.value;
                var groupForDevice = _.find(groups, function(group) {
                    return (group.name === device);
                });
                if (groupForDevice) {
                    screenshots = groupForDevice.screenshots;
                }
            }
            else {
                screenshots = details.screenshots.value[device];
            }
            return screenshots;
        }

        $scope.getMsgsScreenshots = function(loc, device, updatedVersionInfo) {
            var screenshots, details;
            if (updatedVersionInfo) {
                details = updatedVersionInfo.details.value[loc];
            }
            else {
                details = $scope.versionInfo.details.value[loc];
            }
            if ($scope.hasProviderFeature('SSENABLED')) {
                var groups = details.displayFamilies.value;
                var groupForDevice = _.find(groups, function(group) {
                    return (group.name === device);
                });
                if (groupForDevice) {
                    screenshots = groupForDevice.messagesScreenshots;
                }
            }
            else {
                // no messages screenshots with SS being enabled.
            }
            return screenshots;
        }

        $scope.getAppTrailerFromJSON = function(loc, device, updatedVersionInfo) {
            var trailer, details;
            if (updatedVersionInfo) {
                details = updatedVersionInfo.details.value[loc];
            }
            else {
                if (!$scope.versionInfo) {
                    return null;
                }
                details = $scope.versionInfo.details.value[loc];
            }
            if ($scope.hasProviderFeature('SSENABLED')) {
                if (device && device !== "") {
                    var groups = details.displayFamilies.value;
                    var groupForDevice = _.find(groups, function(group) {
                        return (group.name === device);
                    });
                    if (groupForDevice) {
                        trailer = groupForDevice.trailer;
                    }
                }
            }
            else {
                trailer = details.appTrailers.value[device];
            }
            return trailer;
        }

        // To get the resulting array of screenshots, get .value of what this method returns
        $scope.getScreenshotsWithLocaleCode = function(localeCode, device, updatedVersionInfo) {
            var screenshots, details;
            if (updatedVersionInfo) {
                details = _.find(updatedVersionInfo.details.value, function(langGroup) {
                    return langGroup.language.toLowerCase() === localeCode.toLowerCase();
                });
            }
            else {
                details = _.find($scope.versionInfo.details.value, function(langGroup) {
                    return langGroup.language.toLowerCase() === localeCode.toLowerCase();
                });
            }
            if ($scope.hasProviderFeature('SSENABLED')) {
                var groups = details.displayFamilies.value;
                var groupForDevice = _.find(groups, function(group) {
                    return (group.name === device);
                });
                screenshots = groupForDevice.screenshots;
            }
            else {
                screenshots = details.screenshots.value[device];
            }
            return screenshots;
        }

        // To get the resulting array of screenshots, get .value of what this method returns
        $scope.getMsgsScreenshotsWithLocaleCode = function(localeCode, device, updatedVersionInfo) {
            var screenshots, details;
            if (updatedVersionInfo) {
                details = _.find(updatedVersionInfo.details.value, function(langGroup) {
                    return langGroup.language.toLowerCase() === localeCode.toLowerCase();
                });
            }
            else {
                details = _.find($scope.versionInfo.details.value, function(langGroup) {
                    return langGroup.language.toLowerCase() === localeCode.toLowerCase();
                });
            }
            if ($scope.hasProviderFeature('SSENABLED')) {
                var groups = details.displayFamilies.value;
                var groupForDevice = _.find(groups, function(group) {
                    return (group.name === device);
                });
                screenshots = groupForDevice.messagesScreenshots;
            }
            else {
                // no msgs screenshots if SS not enabled
            }
            return screenshots;
        }

        // Makes screenshot sort order consecutive for all loc/device combos.
        $scope.makeScreenshotSortOrderConsecutive = function() {
            var screenshotsAtLoc, devices;
            for (var loc = 0; loc < $scope.versionInfo.details.value.length; loc++) {
                devices = $scope.getDevicesFromScreenshotsJSON(loc);
                for (var i=0; i<devices.length; i++) {
                    $scope.makeScreenshotSortOrderConsecutiveByLocDevice(loc, devices[i]);
                }
            }
        }

        // Makes screenshot sort order consecutive for the given loc/device.
        $scope.makeScreenshotSortOrderConsecutiveByLocDevice = function(loc, device) {
            var snapshots = $scope.getScreenshots(loc, device);
            var snapshotsArr = snapshots.value;

            if (snapshotsArr.length > 0) {
                // Sort
                var sortedSnapshotsArr = _.sortBy(snapshotsArr,function(snapshot) {
                                            return snapshot.value.sortOrder;
                                        });

                // Set a new sortOrder that starts at 1
                var sortedSnapshot;
                for (var i=0; i<sortedSnapshotsArr.length; i++) {
                    sortedSnapshot = sortedSnapshotsArr[i];
                    sortedSnapshot.value.sortOrder = i+1;
                }

                // Set the newly sorted in versionInfo
                snapshots.value = sortedSnapshotsArr;
            }
        }

        $scope.sendVersionLive = function() {
            $scope.setIsSaving(true);
            $scope.tempPageContent.sendingVersionLiveInProgress = true;
            saveVersionService.releaseVerToStore($scope.adamId,$scope.uniqueId).then(function(data) {
                $scope.setIsSaving(false);
                if (data.status == "500") {
                    console.log("We've got a server error... 500")
                    $scope.setIsSaving(false);
                    $scope.tempPageContent.showAdditionalError = true;
                    //$scope.tempPageContent.messageDisplaying = true;
                    $scope.tempPageContent.additionalError = $scope.l10n.interpolate('ITC.AppVersion.PageLevelErrors.ErrorOnReleaseToStore');
                    $scope.tempPageContent.scrollnow = true;
                    $scope.tempPageContent.contentReceivedUpdate = false;
                    $scope.tempPageContent.sendingVersionLiveInProgress = false;
                } else {
                    console.log("tried to make app available");
                    console.log(data);
                    $scope.tempPageContent.sendingVersionLiveInProgress = false;
                    $scope.tempPageContent.contentReceivedUpdate = true;
                    //section error key check done in setupPageData...
                    /*$scope.setupPageData(data.data);
                    $scope.tempPageContent.contentReceivedUpdate = true;
                    $scope.tempPageContent.sendingVersionLiveInProgress = false;*/
                    $state.reload()
                }
            });
        }

        $scope.init = function() {

            $scope.apploaded = false;
            $scope.versionloaded = false;

            $scope.AppOverviewLoaded = false;

            $scope.isLiveVersion = false;
            $scope.isInFlightVersion = false;

            $scope.canAddNewVersion = false;

            $rootScope.currentclass = "ManageApps"; //class to highlight the correct box...
            //$rootScope.wrapperclass = ""; //reset wrapper class until page is loaded (so header doesn't scroll during loading overlay)

            $scope.saveInProgress = false;
            $scope.submitForReviewInProgress = false;
            $scope.createAppVersionSaving = false;

            $scope.modalsDisplay = {}; //holder for modal show/hide states
            $scope.modalsDisplay.ratingModal = false;
            //$scope.modalsDisplay.eulaModal = false;
            $scope.modalsDisplay.iapModal = false;
            $scope.modalsDisplay.buildsModal = false;
            $scope.modalsDisplay.newVersion = false;
            $scope.modalsDisplay.leaderboardSetsModal = false;
            $scope.modalsDisplay.leaderboardsModal = false;
            $scope.modalsDisplay.leaderboardsWithSetsModal = false;
            $scope.modalsDisplay.achievementsModal = false;

            $scope.modalsDisplay.submitForReviewModal = {};
            $scope.modalsDisplay.submitForReviewModal.newLocales = false;
            $scope.modalsDisplay.submitForReviewModal.show = false;


            $scope.tempPageContent = {}; //storage of additional objects needed for page content display
            $scope.tempPageContent.showVidModal = {};

            $scope.tempPageContent.appIconDisplayUrl = null;
            $scope.tempPageContent.watchAppIconDisplayUrl = null;

            $scope.tempPageContent.contentSaved = false;
            $scope.tempPageContent.contentReceivedUpdate = false;
            //$scope.tempPageContent.showSaveError = false;
            $scope.tempPageContent.showAdditionalError = false;
            $scope.tempPageContent.additionalError = "";
            $scope.tempPageContent.sendingVersionLiveInProgress = false;

            $scope.tempPageContent.userReadyToSave = false;
            $scope.tempPageContent.scrollnow = false;

            $scope.tempPageContent.confirmLeave = {}; //storage of error messaging for user leaving page.
            $scope.tempPageContent.confirmLeave.needToConfirm = false;
            $scope.tempPageContent.confirmLeave.msg = "";

            $scope.tempPageContent.confirmLeaveWithModalShowing = {};
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModalSml = false;

            $scope.tempPageContent.confirmLeaveOverloaded = {};
            $scope.tempPageContent.confirmLeaveOverloaded.needToConfirm = false;
            $scope.tempPageContent.confirmLeaveOverloaded.msg = "";

            $scope.tempPageContent.clearValidationNewVersionModal = false;

            $scope.tempPageContent.submittingForReview = false;

            $scope.tempPageContent.showLangInfoModal = false;

            /* ???????????? */
            $scope.tempPageContent.showSaveVerError = false;

            $scope.tempPageContent.showConfirmRemoveLoc = false;
            $scope.tempPageContent.confirmRemoveLocFor = "";
            $scope.tempPageContent.confirmRemoveLocHeader = "";

            $scope.tempPageContent.formErrors = {}; //object to pass to form error handling
            $scope.showRatingsErrorIcon = false;
            //$scope.tempPageContent.additionalErrors = [];
            //$scope.tempPageContent.formErrors.count will > 0 if there are ng-invalid or invalid errors on the page


            /*$scope.tempPageContent.loctextblink = {};
            $scope.tempPageContent.loctextblink.currentLoc = "";
            $scope.tempPageContent.loctextblink.primaryLanguage = "";*/
            $scope.tempPageContent.IAPmodal = {};
            $scope.tempPageContent.IAPmodal.doneButtonDisabled = true;

            $scope.tempPageContent.ratingDialog = {
                "showInfoMessage":false,
                "showWarningMessage":false,
                "showErrorMessage":false,
                "madeForKidsChecked":false,
                "ageBandRatings": []
            };
            $scope.tempRatings = {};
            $scope.tempPageContent.showAdditionalRatings = true;

            $scope.categoryList = [];
            $scope.subCategoryList = [];

            //$scope.territoryEulaList = [];

            //$scope.tempPageContent.eulaModal = {};

            $scope.tempPageContent.addOns = {};
            $scope.tempPageContent.addOns.submitNextVersion = [];
            $scope.tempPageContent.addOns.modal = [];

            $scope.tempPageContent.leaderboardSets = {};
            $scope.tempPageContent.leaderboardSets.modal = [];

            $scope.tempPageContent.leaderboards = {};
            $scope.tempPageContent.leaderboards.modal = [];

            $scope.tempPageContent.leaderboardsWithSets = {};
            $scope.tempPageContent.leaderboardsWithSets.modal = [];
            $scope.associatedLeaderboardSets = [];

            $scope.tempPageContent.achievements = {};
            $scope.tempPageContent.achievements.modal = [];

            $scope.tempPageContent.entitlements = {};

            $scope.tempPageContent.appLocScrollTop = false;

            $scope.tempPageContent.submitForReviewFieldsRequired = false;

            $scope.buildListLoaded = false;

            $scope.tempPageContent.buildModal = {
                'chosenBuild':""
            };

            $scope.loadAppVersionReferenceData();

            if ($stateParams.adamId) {
                //$scope.setisReady();
                $scope.adamId = $stateParams.adamId;
                $scope.initSnapshotDetails(); // this just initializes the vars, doesn't update from data in server yet.

                // TBD: might want to move this elsewhere.
                $scope.simpleDropErrors = {};
                $scope.simpleDropErrors.error = false;
                $scope.simpleFileDropErrors = {};
                $scope.simpleFileDropErrors.error = false;
                $scope.tempPageContent.transitAppFileInProgress = false;
                $scope.tempPageContent.appIconInProgress = false;
                //$scope.loadAppDetails();

                $scope.tempPageContent.encryptionUrl = global_itc_home_url + '/app/'+ $scope.adamId +'/encryption';

            }
            //$scope.loadAppVersionReferenceData(); // @ttn KAREN: same for this...? [karen] Hmm...

            $scope.tempPageContent.contentspacing = 30; //30px gutter

            //check/watch for other sections to be loaded
            var unbindwatch_AppOverview = $scope.$watch(function(){
                return univPurchaseService.appOverviewInfoDataSource.data;
            },function(val){
                if (val !== null) {
                    $scope.appOverviewData = univPurchaseService.appOverviewInfoDataSource.data;

                    $scope.showPromoArt = _.indexOf($scope.appOverviewInfo.features,'PROMOART') >= 0 ? true: false;

                    $scope.loadVersionDetails();
                    unbindwatch_AppOverview();
                    $scope.AppOverviewLoaded = true;
                    $scope.setisReady();
                }
            });
            var unbindwatch_parentScope = $scope.$watch(function(){
                return $scope.parentScopeLoaded;
            },function(val){
                if (val !== null && val) {
                    unbindwatch_parentScope();
                    $scope.updateDevices();
                    $scope.setisReady();
                }
            });
        }

        $scope.init();


        /***** App Version Helper Functions *****/
        $scope.hideIfNullAndNotEditable = function(field) {
            if (field !== undefined && field !== null) {
                if (field.isEditable === false && field.value === null) {
                    return true;
                } else {
                    return false;
                }
            }
        }


        /****** App Trailer functions ******/

        $scope.$on('menuPillClicked', function(event, data) {
            if (data.id === "deviceMenuItem") {
                if ($scope.readyForDrop(false)) {
                    $scope.deviceChanged(data.value);
                }
            }
            // else - some other menu pill click (if we add menu pills anywhere else in the page)
        });

        // Return true if app preview has not loaded yet. Ie if there's a loader in the drop zone because of app preview.
        $scope.appPreviewNotLoaded = function() {
            return $scope.tempPageContent.appPreviewDropped && !$scope.tempPageContent.appPreviewSnapshotShowing;
        };

        $scope.imagesNotLoaded = function() {
            return $scope.numImagesNotReady !== 0;
        };

        $scope.imagesOrAppPreviewNotLoaded = function() {
            return $scope.appPreviewNotLoaded() || $scope.imagesNotLoaded();
        };

        $scope.deviceChanged = function(device) {
            $scope.currentDevice = device;
            $scope.setNumVideos();

            // update snapshot pics!
            $scope.updateSnapshotDetails(true);
        };

        $scope.hasUploader = function(index) {
            return $scope.upload[index] != null;
        };
        $scope.abort = function(index) {
            $scope.upload[index].abort();
            $scope.upload[index] = null;
        };

        /* There are a few reasons why we might not want to allow playback of a video:
            1. !$scope.previewPlayAllowed ==> This happens if the browser(s)/os(s) set in the property file (properties: com.apple.jingle.label.appPreview.playAllowedOsAndVersions
                and com.apple.jingle.label.appPreview.playAllowedBrowsersAndVersions) isn't the current browser/os.
            2. The video is processing
            3. The video format doesn't work on the current browser (previewVideos[0].cantPlayVideo will be set to true by the video snapshot directive)
        */
        $scope.cantPlayVideoForOneReasonOrAnother = function() {
            return ($scope.tempPageContent.previewVideos.length>0 && $scope.tempPageContent.previewVideos[0].cantPlayVideo) || !$scope.previewPlayAllowed;
        };

        $scope.cantPlayVideoForOneReasonOrAnotherDevLoc = function(device, loc) {
            var vids = $scope.tempPageContent.allVideos.getGroup("ALL LANGUAGES", device);
            return (vids && vids.length>0 && vids[0].cantPlayVideo) || !$scope.previewPlayAllowed;
        };

        // Looks at the browser and version and sets $scope.previewUploadAllowed and $scope.previewPlayAllowed to true/false.
        $scope.determinePreviewUploadAndPlayPermissions = function() {

            $scope.previewUploadAllowed = false;
            $scope.previewPlayAllowed = false;

            // userAgent differentces between safari and chrome
            // Note to self: it's pretty yucky getting data out of here.
            // on chrome:   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36"
            // on safari 7: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/537.75.14"

            var allowedUploadBrowserAndVersion, allowedUploadOsAndVersion, allowedPlayBrowserAndVersion, allowedPlayOsAndVersion;

            var allowedUploadBrowser,allowedUploadVersion,allowedUploadOS,allowedUploadOSVersion;
            var allowedPlayBrowser,allowedPlayVersion,allowedPlayOS,allowedPlayOSVersion;

            var ua = navigator.userAgent.toLowerCase();
            var partsBetweenSlashes = ua.split("/");
            var browserVersion, browser, osVersion;

            var previewUploadAllowed = false;
            var previewPlayAllowed = false;

            if (ua.indexOf('safari') != -1) {
                if (ua.indexOf('chrome') > -1) { // CHROME
                    browser = "chrome";
                } else { // SAFARI
                    browser = "safari";
                }
                browserVersion = partsBetweenSlashes[3];
                var index = browserVersion.indexOf(" safari");
                browserVersion = browserVersion.substring(0, index);

                // UPLOAD
                for (var i = 0; i < $scope.referenceData.appPreviewUploadAllowedBrowsersAndVersions.length; i++) { // loop thru browsers
                    allowedUploadBrowserAndVersion = $scope.referenceData.appPreviewUploadAllowedBrowsersAndVersions[i].split(':');

                    allowedUploadBrowser = allowedUploadBrowserAndVersion[0];
                    allowedUploadVersion = allowedUploadBrowserAndVersion[1];

                    for (var j = 0; j < $scope.referenceData.appPreviewUploadAllowedOsAndVersions.length; j++) { // loop thru os's

                        allowedUploadOsAndVersion = $scope.referenceData.appPreviewUploadAllowedOsAndVersions[j].split(':');

                        allowedUploadOS = allowedUploadOsAndVersion[0].toLowerCase();
                        allowedUploadOSVersion = allowedUploadOsAndVersion[1];
                        var uploadOSindex = ua.indexOf(allowedUploadOS);

                        // upload
                        if (browser === allowedUploadBrowser && uploadOSindex != -1) {
                            osVersion = ua.substring(uploadOSindex + allowedUploadOS.length + 1, ua.indexOf(')'));
                            if (!$scope.previewUploadAllowed) { // never switch from allowed to not allowed. once you're allowed, you're allowed.
                                $scope.previewUploadAllowed = $scope.version1IsGreaterThanVersion2(browserVersion, allowedUploadVersion, '.') &&
                                                          $scope.version1IsGreaterThanVersion2(osVersion, allowedUploadOSVersion, '_');
                            }
                        }

                    } // end inner for
                } // end outer for

                // PLAY
                for (var i = 0; i < $scope.referenceData.appPreviewPlayAllowedBrowsersAndVersions.length; i++) { // loop thru browsers
                    allowedPlayBrowserAndVersion = $scope.referenceData.appPreviewPlayAllowedBrowsersAndVersions[i].split(':');

                    allowedPlayBrowser = allowedPlayBrowserAndVersion[0];
                    allowedPlayVersion = allowedPlayBrowserAndVersion[1];

                    for (var j = 0; j < $scope.referenceData.appPreviewPlayAllowedOsAndVersions.length; j++) { // loop thru os's

                        allowedPlayOsAndVersion = $scope.referenceData.appPreviewPlayAllowedOsAndVersions[j].split(':');

                        allowedPlayOS = allowedPlayOsAndVersion[0].toLowerCase();
                        allowedPlayOSVersion = allowedPlayOsAndVersion[1];
                        var playOSindex = ua.indexOf(allowedPlayOS);

                        if (browser === allowedPlayBrowser && playOSindex != -1) {
                            osVersion = ua.substring(playOSindex + allowedUploadOS.length + 1, ua.indexOf(')'));
                            if (!$scope.previewPlayAllowed) { // never switch from allowed to not allowed. once you're allowed, you're allowed.
                                $scope.previewPlayAllowed = $scope.version1IsGreaterThanVersion2(browserVersion, allowedPlayVersion, '.') &&
                                                          $scope.version1IsGreaterThanVersion2(osVersion, allowedPlayOSVersion, '_');
                            }
                        }

                    } // end inner for
                } // end outer for

                // console.log("upload allowed: " + $scope.previewUploadAllowed);
                // console.log("play allowed: " + $scope.previewPlayAllowed);
            }
        };

        /* Takes two versions, like 35.0.1916.153 and 35.0.1917, and returns true if the first (version1) is greater than OR equal to the second (version2)
           Some more examples: (if separator were a '.')
            greaterThan = $scope.version1IsGreaterThanVersion2("1.2.3.4.5", "1.2");         --> true
            greaterThan = $scope.version1IsGreaterThanVersion2("1", "1.2.3");               --> false
            greaterThan = $scope.version1IsGreaterThanVersion2("1.2.3", "1");               --> true
            greaterThan = $scope.version1IsGreaterThanVersion2("2", "1.2.3");               --> true
            greaterThan = $scope.version1IsGreaterThanVersion2("1.2.3.4.5", "1.2.3.4.6");   --> false
            greaterThan = $scope.version1IsGreaterThanVersion2("1.2.3.4.5", "1.2.3.4.4");   --> true
            greaterThan = $scope.version1IsGreaterThanVersion2("1.2.3.4.5", "2.8.9");       --> false
        */
        $scope.version1IsGreaterThanVersion2 = function(version1, version2, separator) {

            var parts1 = version1.split(separator);
            var parts2 = version2.split(separator);
            if (parts1.length > 0 && parts2.length > 0) {

                var greaterThan = parseInt(parts1[0]) > parseInt(parts2[0]);
                var equal = parseInt(parts1[0]) === parseInt(parts2[0]);
                if (greaterThan) {
                    return true;
                }
                else if (equal) {
                    var i1, i2, nextPart1, nextPart2;
                    i1 = version1.indexOf(separator);
                    i2 = version2.indexOf(separator);

                    if (i1 == -1 || i2 == -1) { // if this is the last of one or the other
                        if (i1 == -1 && i2 == -1) { // if it's the last of both
                            return true;
                        }
                        else if (i1 == -1) { // if it's the last of the first one
                            return false;
                        }
                        else { // if it's the last of the 2nd
                            return true;
                        }
                    }
                    else {
                        nextPart1 = version1.substring(i1+1, version1.length);
                        nextPart2 = version2.substring(i2+1, version2.length);
                        // recurse
                        return $scope.version1IsGreaterThanVersion2(nextPart1, nextPart2, separator);
                    }
                }
                else {
                    return false;
                }
            }
            // not sure we ever get here but i'll leave it in just in case
            else if (parts1.length > 0) { // parts 2 is empty
                return true;
            }
            else { // part 1 is empty
                return false;
            }
        }

        $scope.$watch('snapshotInfo.cantPlayVideo', function(newVal, oldVal) {
            if (newVal) { // if video snapshot grab directive set cantPlayVideo to true, set previewVideos[0].cantPlayVideo to true.
                if ($scope.tempPageContent.previewVideos.length>0) {
                    $scope.tempPageContent.previewVideos[0].cantPlayVideo = true;
                }
            }
        });

        $scope.$on('imageLoaded', function(event, data) {
            var watchTray = false;
            var existingImages;
            if (data.isWatchScreenshot) {
                watchTray = true;
                existingImages = $scope.watchImages;
            }
            else {
                existingImages = $scope.previewImages;
            }

            if (data.imgIndex !== undefined) {
                if (!data.isVideo) {
                    existingImages[data.imgIndex].imgWidth = data.imgWidth; // save the image width
                    existingImages[data.imgIndex].imgHeight = data.imgHeight;
                    existingImages[data.imgIndex].actualImgHeight = data.actualImgHeight;
                    existingImages[data.imgIndex].actualImgWidth = data.actualImgWidth;
                }
                else if (!watchTray && $scope.tempPageContent.previewVideos[0]) { // video
                    $scope.tempPageContent.previewVideos[data.imgIndex].imgWidth = data.imgWidth; // save the image width
                    $scope.tempPageContent.previewVideos[data.imgIndex].imgHeight = data.imgHeight;
                    $scope.tempPageContent.previewVideos[data.imgIndex].actualImgHeight = data.actualImgHeight;
                    $scope.tempPageContent.previewVideos[data.imgIndex].actualImgWidth = data.actualImgWidth;
                }
            }

            $scope.updatePreviewWidth(watchTray);
        });

        $scope.getTotalPreviewImagesWidth = function(watchTray) {
            var totalWidth = 0;
            var imgWidth;

            var existingImages;
            if (watchTray) {
                existingImages = $scope.watchImages;
            }
            else {
                existingImages = $scope.previewImages;
            }

            for (var i = 0; i < existingImages.length; i++) {
                imgWidth = existingImages[i].imgWidth;
                if (imgWidth !== undefined) { // if dropping a few at a time, some will be undefined initially.
                    totalWidth += imgWidth;
                }
            }
            if (!watchTray) {
                for (var i = 0; i < $scope.tempPageContent.previewVideos.length; i++) {
                    imgWidth = $scope.tempPageContent.previewVideos[i].imgWidth;
                    if (imgWidth !== undefined) {
                        totalWidth += imgWidth;
                    }
                }
            }
            return totalWidth;
        },

        // Sets $scope.snapshotInfo.maxHeight to the height of the highest (tallest) image. The drop zone
        // watches that variable and sets its height accordingly
        $scope.setMaxImageHeight = function() {
            var maxHeight = 0;
            var imgHeight;
            for (var i = 0; i < $scope.previewImages.length; i++) {
                imgHeight = $scope.previewImages[i].imgHeight;
                if (imgHeight !== undefined) { // if dropping a few at a time, some will be undefined initially.
                    maxHeight = Math.max(imgHeight, maxHeight);
                }
            }
            for (var i = 0; i < $scope.tempPageContent.previewVideos.length; i++) {
                imgHeight = $scope.tempPageContent.previewVideos[i].imgHeight;
                if (imgHeight !== undefined) { // if dropping a few at a time, some will be undefined initially.
                    maxHeight = Math.max(imgHeight, maxHeight);
                }
            }

            $timeout(function() {
                $scope.snapshotInfo.maxHeight = maxHeight;
                $scope.$apply();
            });
        },

        $scope.moveImage = function(from, to, watchTray) {
            var startSortOrderIndex;
            if (watchTray) {
                var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex("watch", $scope.currentLoc);
                $scope.changeScreenshotSortOrderInMainJson(from+startSortOrderIndex, to+startSortOrderIndex, "watch", $scope.currentLoc);
            } else {
                var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex($scope.currentDevice, $scope.currentLoc);
                $scope.changeScreenshotSortOrderInMainJson(from+startSortOrderIndex, to+startSortOrderIndex, $scope.currentDevice, $scope.currentLoc);
            }
        };

        $scope.moveImageDev = function(from, to, device, isMsgsMedia) {
            var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex(device, $scope.currentLoc, isMsgsMedia);
            $scope.changeScreenshotSortOrderInMainJson(from+startSortOrderIndex, to+startSortOrderIndex, device, $scope.currentLoc, isMsgsMedia);
        };

        $scope.$on('dragoverZone1', function(event, data) {
            $scope.$broadcast('dragoverZone2', data);
        });

        $scope.$on('dragleaveZone1', function(event, data) {
            $scope.$broadcast('dragleaveZone2', data);
        });

        $scope.$on('cancelFileUpload', function(event, data) {
            $scope.tempPageContent.showModal = false; // just hide the modal dialog
        });

        $scope.$on('deletePreview', function(event, data) {
            var device;
            if (data.isWatchScreenshot) {
                $scope.snapshotInfo.watchError = false; // clear any previous error
                device = "watch";
            }
            else {
                $scope.snapshotInfo.error = false; // clear any previous error
                device = $scope.currentDevice;
            }

            var language = $scope.getLanguageString($scope.currentLoc);
            $scope.allImages.clearGeneralErrors(language, device);

            $scope.snapshotInfo.dontAnimate = false; // do animate.
            $scope.deletePreview(data.isVideo, data.index, data.isWatchScreenshot);
        });

        $scope.deleteTransitionEnded = function(data) {
            $scope.updatePreviewWidth(data.watchTray);
            $scope.$broadcast('zoneDeleteTransitionEnded', data); // makes the following zones slide left
        };

        $scope.deleteAllMedia = function(e, watchTray) {
            if ($(e.target).hasClass("disabled")) {
                return;
            }
            var device;
            if (watchTray) {
                $scope.snapshotInfo.watchError = false; // clear any previous error
                device = "watch";
            }
            else {
                $scope.snapshotInfo.error = false; // clear any previous error
                device = $scope.currentDevice;
            }

            var language = $scope.getLanguageString($scope.currentLoc);
            $scope.allImages.clearGeneralErrors(language, device);

            $scope.snapshotInfo.dontAnimate = false; // do animate.
            // delete ALL
            if (!watchTray) {
                $scope.deleteAppPreview();
            }
            $scope.deleteAllScreenshots(watchTray);
            $scope.updateDropTrayText(watchTray);

        };

        $scope.deleteAppPreview = function() {
            if ($scope.tempPageContent.previewVideos.length === 1) {
                $scope.tempPageContent.allVideos.getGroup("ALL LANGUAGES", $scope.currentDevice).splice(0, 1);
                $scope.deleteAppTrailerDataFromMainJson($scope.currentDevice);
                if ($scope.upload) {
                    $scope.upload.abort();
                }
                // broadcast an event to video_snapshot_grab_directive
                $scope.$broadcast('videoPreviewDeleted');

                /*
                $scope.snapshotInfo.deletedMediaItem = true;
                $scope.$apply(); // If drop zone was not visible (dropZoneAlreadyShowing was false), this $apply will cause the drop zone to show, and
                                // THAT will trigger an $scope.updatePreviewWidth(), unless deletedMediaItem is true.
                $scope.snapshotInfo.deletedMediaItem = false;  */
            }
        };

        $scope.deleteAllScreenshots = function(isWatchScreenshot) {

            // remove the element at index data!
            if (isWatchScreenshot) {
                $scope.watchImages.length = 0;
                $scope.deleteAllScreenshotDataFromMainJson("watch", $scope.currentLoc);
            }
            else {
                $scope.previewImages.length = 0;
                $scope.deleteAllScreenshotDataFromMainJson($scope.currentDevice, $scope.currentLoc);
            }
        /*
            $scope.snapshotInfo.deletedMediaItem = true;
            $scope.$apply(); // If drop zone was not visible (dropZoneAlreadyShowing was false), this $apply will cause the drop zone to show, and
                            // THAT will trigger an $scope.updatePreviewWidth(), unless deletedMediaItem is true.
            $scope.snapshotInfo.deletedMediaItem = false;       */
        };

        /* New Delete Image */
        $scope.$on('deletePreview2', function(event, data) {
            var language = $scope.getLanguageString($scope.currentLoc);
            var msgsMedia = data.isMsgsMedia;
            if (msgsMedia) {
                $scope.allMsgsImages.clearGeneralErrors(language, data.device);
            }
            else {
                $scope.allImages.clearGeneralErrors(language, data.device);
            }

            $scope.deletePreview2(data.isVideo, data.index, data.device, data.parentArray, msgsMedia);
        });

        $scope.deletePreview2 = function(isVideo, index, device, parentArray, msgsMedia) {
            if (isVideo) {
                parentArray.splice(index, 1);
                $scope.deleteAppTrailerDataFromMainJson(device);
                if ($scope.upload) {
                    $scope.upload.abort();
                }
            }
            else { // this is an image
                // remove the element at index data!
                parentArray.splice(index, 1); // delete the image from the array on the scope
                var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex(device, $scope.currentLoc, msgsMedia);
                $scope.deleteScreenshotDataFromMainJson(index + startSortOrderIndex, device, $scope.currentLoc, msgsMedia);
            }

            $scope.$apply();
        };
        /* End New Delete Image */

        $scope.isPrimaryLoc = function(loc) {
            var localeCode = $scope.getLanguageString(loc);
            var isPrimary = $scope.isCurrentPrimaryLanguage(localeCode);
            return isPrimary;
        }

        /* New deleteAllMedia */
        $scope.deleteAllMedia2 = function(e, device, loc, msgsMedia) {

            if (e && $(e.target).hasClass("disabled")) {
                return;
            }

            var allImgs, allVids;
            if (msgsMedia) {
                allImgs = $scope.allMsgsImages;
                allVids = $scope.tempPageContent.allMsgsVideos;
            }
            else {
                allImgs = $scope.allImages;
                allVids = $scope.tempPageContent.allVideos;
            }

            var language = $scope.getLanguageString(loc);
            allImgs.clearGeneralErrors(language, device);
            $scope.setMediaDataValue(loc, device, msgsMedia, "errorInPopup", false);
            //$scope.tempPageContent.mediaData.setDataValue(loc, device, "errorInPopup", false);

            var imgs = allImgs.getGroup(language, device);
            var vids = allVids.getGroup("ALL LANGUAGES", device);

            var isPrimaryLoc = $scope.isPrimaryLoc(loc); // only delete the video if on primary loc.
            if (isPrimaryLoc && vids && vids.length>0 && !msgsMedia) { // ignoring iMessages video for now
                vids.splice(0, 1);
                $scope.deleteAppTrailerDataFromMainJson(device);
                if ($scope.upload) {
                    $scope.upload.abort();
                }
            }
            if (imgs && imgs.length>0) {
                imgs.length = 0;
                $scope.deleteAllScreenshotDataFromMainJson(device, loc, msgsMedia);
            }
        };

        $scope.dropwellDeleteAllEnabled = function(device, loc) {
            if (!$scope.versionInfo) {
                return false;
            }
            var language = $scope.getLanguageString(loc);
            var imgs = $scope.allImages.getGroup(language, device);
            var vids = $scope.tempPageContent.allVideos.getGroup("ALL LANGUAGES", device);

            return ((vids && vids.length > 0) || (imgs && imgs.length > 0)) && $scope.readyForDrop2(device, loc);
        }

        $scope.deletePreview = function(isVideo, index, isWatchScreenshot) {
            if (!isWatchScreenshot && isVideo) {
                //$scope.tempPageContent.previewVideos.splice(index, 1);
                $scope.tempPageContent.allVideos.getGroup("ALL LANGUAGES", $scope.currentDevice).splice(index, 1);
                $scope.deleteAppTrailerDataFromMainJson($scope.currentDevice);
                if ($scope.upload) {
                    $scope.upload.abort();
                }
                // broadcast an event to video_snapshot_grab_directive
                $scope.$broadcast('videoPreviewDeleted');
            }
            else { // this is an image
                // remove the element at index data!
                if (isWatchScreenshot) {
                    $scope.watchImages.splice(index, 1); // delete the image from the array on the scope
                    var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex("watch", $scope.currentLoc);
                    $scope.deleteScreenshotDataFromMainJson(index + startSortOrderIndex, "watch", $scope.currentLoc);
                }
                else {
                    $scope.previewImages.splice(index, 1); // delete the image from the array on the scope
                    var startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex($scope.currentDevice, $scope.currentLoc);
                    $scope.deleteScreenshotDataFromMainJson(index + startSortOrderIndex, $scope.currentDevice, $scope.currentLoc);
                }
            }

            $scope.snapshotInfo.deletedMediaItem = true;
            $scope.$apply(); // If drop zone was not visible (dropZoneAlreadyShowing was false), this $apply will cause the drop zone to show, and
                            // THAT will trigger an $scope.updatePreviewWidth(), unless deletedMediaItem is true.
            $scope.snapshotInfo.deletedMediaItem = false;
        };

        $scope.$on('appPreviewSnapshotIsShowing', function(event, data) {
            $scope.tempPageContent.appPreviewSnapshotShowing = true;
            $scope.tempPageContent.appPreviewDropped = false; // reset $scope.tempPageContent.appPreviewDropped here.
        });

        $scope.$on('snapshotIsShowing', function(event, data) {

            if (data.watchImage) {
                $scope.tempPageContent.watchImagesNotYetLoaded--;
            }
            else {
                $scope.tempPageContent.imagesNotYetLoaded--;
            }

        });

        $scope.copyPreview = function(dataWithFile, isNewVideo) {
            $scope.tempPageContent.showModal = false; // will hide the modal dialog

            var data = dataWithFile.data;
            var videoFile = dataWithFile.file;

            var dataPlusImageInfo = {};
            dataPlusImageInfo.data = data; // image jpg data
            dataPlusImageInfo.thumbnailData = data; // image jpg data
            dataPlusImageInfo.videoType = true;
            dataPlusImageInfo.videoFile = videoFile;
            dataPlusImageInfo.previewTimestamp = dataWithFile.previewTimestamp;
            dataPlusImageInfo.processingVideo = dataWithFile.processingVideo;
            dataPlusImageInfo.videoError = dataWithFile.videoError;
            dataPlusImageInfo.cantPlayVideo = dataWithFile.cantPlayVideo;
            dataPlusImageInfo.videoUrlFromServer = dataWithFile.videoUrlFromServer;

            // if there's already a video, we're just grabbing another snapshot from that video
            if ($scope.tempPageContent.previewVideos.length === $scope.numVideos) {
                var d = $scope.tempPageContent.previewVideos[$scope.numVideos-1];
                d.data = data; // image jpg data
                d.thumbnailData = data;
                d.videoType = true;
                d.previewTimestamp = dataWithFile.previewTimestamp;

                $scope.tempPageContent.appPreviewSnapshotShowing = true;
                $scope.$apply(); // important

                // Note: doing the below (replacing one array element with another) does bad things to the animations.
                // Do it the above way instead.
                //$scope.tempPageContent.previewVideos[$scope.numVideos-1] = dataPlusImageInfo;

                $scope.$broadcast('setVideoPreview', $scope.tempPageContent.previewVideos.length-1);
            }

            // if not, we're adding a video to previewVideos.
            else {

                // Doing totalPreviewWidthChanged broadcast ahead of time because this is what triggers
                // the drop zone to shrink. Want it to shrink FIRST, to make room for the video snapshot
                // that's about to appear in 500 ms.
                var totalWidth = $scope.getTotalPreviewImagesWidth(false);
                var data = {};
                data.total = totalWidth + 436; // TBD: remove hardcoding!
                data.fakeNoDropZone = ($scope.previewImages.length===$scope.numImages); // force drop zone to shrink away if it needs to (ie. if all images are filled)
                $scope.$broadcast('totalPreviewWidthChanged', data);
                $scope.updateDropTrayMinWidth(data, false);
                $timeout(function() {
                     $scope.tempPageContent.previewVideos.push(dataPlusImageInfo);
                     $scope.$apply(); // important
                     $scope.$broadcast('setVideoPreview', $scope.tempPageContent.previewVideos.length-1);
                }, 500); // 500 - just enough time for the drop zone to shrink and make way for this snapshot.
            }

            if (dataWithFile.upload) {
                var imageFile = $scope.createPreviewImageFile(dataWithFile.data);

                if(isNewVideo) {
                    $scope.videoUploadFile(videoFile, imageFile, dataWithFile.previewTimestamp, dataWithFile.isPortrait); // call uploadVideoPreviewImageFile from there
                }
                else {
                    // upload video preview image
                    var url = URL.createObjectURL(imageFile);
                    $scope.uploadVideoPreviewImageFile(imageFile, url, $scope.currentDevice, $scope.currentLoc, dataWithFile.previewTimestamp, dataWithFile.isPortrait); // not sure that sort order matters
                }
            }
            else {
                // if we don't set videoLoaded to true here, loader will show on video preview
                var language = $scope.getLanguageString($scope.currentLoc);
                var device = $scope.currentDevice;
                var loaded = $scope.tempPageContent.mediaErrors.getErrorValue(language, device, "videoLoaded");
                if (loaded === undefined || loaded === null) { // if it equals FALSE, don't set it to true.
                    $scope.tempPageContent.mediaErrors.setErrorValue(language, device, "videoLoaded", true); // otherwise loader will show on video preview
                }
            }
        };

        $scope.initializeMediaDataHolder = function() {
            // A generic object to hold data for language/device combinations.
            var dataHolder = function() {

                // gets the group
                this.getDataValue = function(language, device, key) {
                    if (this[language] && this[language][device]) {
                        return this[language][device][key];
                    }
                    else {
                        return null;
                    }
                };

                this.setDataValue = function(language, device, key, value) {
                    if (!this[language]) {
                        this[language] = {};
                    }
                    if (!this[language][device]) {
                        this[language][device] = {};
                    }

                    this[language][device][key] = value;
                };
            };

            // One object to hold some media data
            $scope.tempPageContent.mediaData = new dataHolder();

            if ($scope.hasProviderFeature('VOYAGER')) {
                // iMessages screenshots
                $scope.tempPageContent.msgsMediaData = new dataHolder();
            }
        };

        // So far, just for video load errors, since they need to be saved by language/device.
        $scope.initializeMediaErrorHolder = function() {
            // A generic object to hold errors for language/device combinations.
            var errorHolder = function() {

                // gets the group
                this.getErrorValue = function(language, device, key) {
                    if (this[language] && this[language][device]) {
                        return this[language][device][key];
                    }
                    else {
                        return null;
                    }
                };

                this.setErrorValue = function(language, device, key, value) {
                    if (!this[language]) {
                        this[language] = {};
                    }
                    if (!this[language][device]) {
                        this[language][device] = {};
                    }

                    this[language][device][key] = value;
                };
            };

            // One object to hold all media errors
            $scope.tempPageContent.mediaErrors = new errorHolder();
        };

        // This is how we pass the preview image data along from the videoSnapshotDirective to the videoPreviewDirective.
        $scope.$on('copyPreview', function(event, dataWithFile, isNewVideo) {
            $scope.copyPreview(dataWithFile, isNewVideo);
        });

        $scope.createPreviewImageFile = function(data) {
            var blobBin = atob(data.split(',')[1]);
            var array = [];
            for(var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
            file.name = "preview_image.jpg";
            return file;
        };

        // do the actual video upload
        $scope.videoUploadFile = function(videoFile, imageFile, timestamp, isPortrait) {

            // get the current loc and device and use them through-out the upcoming ajax call,
            // because the loc and device can change before the progress/success/error callbacks!
            var currentLoc = $scope.currentLoc;
            var currentDevice = $scope.currentDevice;

            var details = $scope.versionInfo.details.value[currentLoc];
            var editable = false;
            var currentDevData = details.appTrailers.value[currentDevice];
            if (currentDevData) {
                editable = currentDevData.isEditable;
            }

            if (editable) {
                var langstr = $scope.getLanguageString(currentLoc);
                $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoaded", false);
                $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoadingError", false);

                var vidType = videoFile.type;

                $scope.imageUploadsInProgress++;

                $scope.upload = $upload.upload({
                    url: $scope.referenceData.directUploaderUrls.videoUrl,
                    method: 'POST',
                    headers: {'Content-Type': vidType,
                              'X-Apple-Upload-Referrer': window.location.href,
                              'X-Apple-Upload-AppleId': $scope.adamId,
                              'X-Apple-Request-UUID': _.guid(),
                              'X-Apple-Upload-itctoken': $scope.appVersionReferenceData.ssoTokenForVideo,
                              'X-Apple-Upload-ContentProviderId': $scope.user.contentProviderId,
                              'X-Original-Filename': $scope.convertToUnicodeStr(videoFile.name)
                             },
                    // withCredentials: true,
                    //data: {myObj: scope.myModelObj},
                    file: videoFile
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    //console.log("Success uploading video to DU: status - " + status);
                    //console.log(data);

                    $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoaded", true);

                    $scope.addAppTrailerDataToMainJson(data, videoFile.type, currentDevice, currentLoc);

                    var url = URL.createObjectURL(imageFile);
                    $scope.uploadVideoPreviewImageFile(imageFile, url, currentDevice, currentLoc, timestamp, isPortrait);
                    $scope.imageUploadsInProgress--;

                }).error(function(data, status, headers, config) {
                    console.log("DU ERROR: status: " + status);
                    console.info("DU ERROR: data: ", data);

                    var genericMessage = $scope.l10n.interpolate('ITC.AppVersion.DUGeneralErrors.FileNotLoaded');
                    if (data && data.suggestionCode) {
                        var locErrorKey = "ITC.apps.validation."+ data.suggestionCode.toLowerCase();
                        var unRenderedHtml = $scope.l10n.interpolate(locErrorKey);
                        var vidError = $scope.renderHtml(unRenderedHtml);
                        if (unRenderedHtml === locErrorKey) {
                            $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoadingError", genericMessage);
                        }
                        else {
                            $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoadingError", vidError);
                        }
                    } else {
                        $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoadingError", genericMessage);
                    }

                    // fake out save
                    $scope.setIsSaving(false);
                    $scope.saveInProgress = false;
                    $scope.imageUploadsInProgress--;

                });
            } else {
                console.log("App Previews for " + $scope.currentDevice + " in " + $scope.getLanguageString($scope.currentLoc) + " are not editable.");
            }
        };

        $scope.setGenericVideoLoadingError = function() {

            var currentLoc = $scope.currentLoc;
            var currentDevice = $scope.currentDevice;
            var langstr = $scope.getLanguageString(currentLoc);

            var genericMessage = $scope.l10n.interpolate('ITC.AppVersion.Media.GenericVideoErrorDetail');
            $scope.tempPageContent.mediaErrors.setErrorValue(langstr, currentDevice, "videoLoadingError", genericMessage);
        };

        // Returns true if there is a video loading error at the current loc and device.
        $scope.isVideoLoaded = function() {
            if ($scope.currentLoc === undefined) {
                return false;
            }
            var language = $scope.getLanguageString($scope.currentLoc);
            var device = $scope.currentDevice;

            var loaded = $scope.tempPageContent.mediaErrors.getErrorValue(language, device, "videoLoaded");
            return loaded;
        };

        // Returns true if there is a video loading error at the current loc and device.
        $scope.isVideoLoadedDevLoc = function(device, loc) {
            var language;
            if (loc === "ALL LANGUAGES") {
                language = loc;
            }
            else {
                language = $scope.getLanguageString(loc);
            }

            var loaded = $scope.tempPageContent.mediaErrors.getErrorValue(language, device, "videoLoaded");
            return loaded;
        };

        $scope.doesVideoHaveDuError = function() {
            var language = $scope.getLanguageString($scope.currentLoc);
            var device = $scope.currentDevice;

            var error = $scope.tempPageContent.mediaErrors.getErrorValue(language, device, "videoLoadingError");
            return error;
        };

        $scope.doesVideoHaveDuErrorDevLoc = function(device, loc) {
            var language = $scope.getLanguageString(loc);

            var error = $scope.tempPageContent.mediaErrors.getErrorValue(language, device, "videoLoadingError");
            return error;
        };

        // Converts the given string to it's unicode equivalent.
        // For example: 晓高.png gets converted to &#26195;&#39640;.png
        // Does nothing to ascii English ascii chars.
        $scope.convertToUnicodeStr = function(str) {
            var ustr = '';
            for (var i=0; i<str.length; i++) {
                if (str.charCodeAt(i) > 127) {
                    ustr += '&#' + str.charCodeAt(i) + ';';
                }
                else {
                    ustr += str.charAt(i);
                }
            }
            return ustr;
        }

        // This function is now specific to snapshots (trailer preview images now have their own function: uploadVideoPreviewImageFile)
        $scope.imageUploadFile = function(file, url, sortOrder, device, language) {

            $scope.imageUploadsInProgress++;

            if (device === "watch") {
                $scope.numWatchImagesNotReady++;
            } else {
                $scope.numImagesNotReady++;
            }

            var pictureType = $scope.referenceData.imageSpecs[device].pictureType;

            $scope.upload = $upload.upload({
                url: $scope.referenceData.directUploaderUrls.imageUrl,
                method: 'POST',
                headers: {'Content-Type': file.type,
                          'X-Apple-Upload-Referrer': window.location.href,
                          'X-Apple-Upload-AppleId': $scope.adamId,
                          'X-Apple-Request-UUID': _.guid(),
                          'X-Apple-Upload-itctoken': $scope.appVersionReferenceData.ssoTokenForImage,
                          'X-Apple-Upload-ContentProviderId': $scope.user.contentProviderId,
                          // Reason to convert the string: otherwise if the filename contains characters with
                          // extended ASCII Codes (>127) we get the following error:
                          // Error: Failed to execute 'setRequestHeader' on 'XMLHttpRequest': '<filename>' is not a valid HTTP header field value.
                          'X-Original-Filename': $scope.convertToUnicodeStr(file.name),
                          'X-Apple-Upload-Validation-RuleSets': pictureType
                         },
                file: file
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                //console.log("Success uploading image to DU");

                $scope.addScreenshotDataToMainJson(data, sortOrder, device, language, file.name);
                var dataPlusImageInfo = {};
                dataPlusImageInfo.data = url;
                dataPlusImageInfo.thumbnailData = url;
                dataPlusImageInfo.videoType = false;

                $timeout(function() { // timeout because of $apply(), because we're already in a digest loop.

                    if (device === "watch") {
                        $scope.watchImages.splice(0, 0, dataPlusImageInfo); // inserts at front
                        //$scope.previewImages.push(dataPlusImageInfo); // inserts at end
                        $scope.$apply(); // important
                        $scope.tempPageContent.watchImagesNotYetLoaded++;
                        $scope.$broadcast('setWatchImage', 0);
                    } else {
                        //console.info("about to insert an image into: ", $scope.previewImages);
                        $scope.previewImages.splice(0, 0, dataPlusImageInfo); // inserts at front
                        //$scope.previewImages.push(dataPlusImageInfo); // inserts at end
                        $scope.$apply(); // important
                        $scope.tempPageContent.imagesNotYetLoaded++;
                        $scope.$broadcast('setImagePreview', 0);
                    }

                    $scope.imageUploadsInProgress--;
                    if (device === "watch") {
                        $scope.numWatchImagesNotReady--;
                    } else {
                        $scope.numImagesNotReady--;
                    }
                });

            }).error(function(data, status, headers, config) {
                console.info("ERROR uploading image to DU: ", data);
                // This commented out code is just to fake things out if DU isn't working.
                /*$scope.addScreenshotDataToMainJson(data, sortOrder, device, language);
                var dataPlusImageInfo = {};
                dataPlusImageInfo.data = url;
                dataPlusImageInfo.videoType = false;

                $timeout(function() { // timeout because of $apply(), because we're already in a digest loop.
                    //console.info("about to insert an image into: ", $scope.previewImages);
                    $scope.previewImages.splice(0, 0, dataPlusImageInfo); // inserts at front
                    //$scope.previewImages.push(dataPlusImageInfo); // inserts at end
                    $scope.$apply(); // important
                    $scope.$broadcast('setImagePreview', 0);
                });

                $scope.imageUploadsInProgress--;
                $scope.numImagesNotReady--;
                */

                // If DU isn't working - comment out the rest here (and uncomment the above)
                var error;
                if (data) {
                    var locErrorKey = "ITC.apps.validation."+ data.suggestionCode.toLowerCase();
                    error = $scope.renderHtml($scope.l10n.interpolate(locErrorKey));
                    if ($scope.l10n.interpolate(locErrorKey) === locErrorKey) {
                        error = $scope.l10n.interpolate('ITC.AppVersion.DUGeneralErrors.FileNotLoaded');
                    }
                } else {
                    error = $scope.l10n.interpolate('ITC.AppVersion.DUGeneralErrors.FileNotLoaded');
                }

                $scope.setIsSaving(false);
                $scope.saveInProgress = false;
                $scope.imageUploadsInProgress--;
                if (device === "watch") {
                    if (error) {
                        $scope.snapshotInfo.watchError = error;
                    }
                    $scope.numWatchImagesNotReady--;
                } else {
                    if (error) {
                        $scope.snapshotInfo.error = error;
                    }
                    $scope.numImagesNotReady--;
                }

            });
        };

        // a function to upload the preview image
        $scope.uploadVideoPreviewImageFile = function(file, url, device, language, timestamp, isPortrait) {
            $scope.imageUploadsInProgress++;
            $scope.upload = $upload.upload({
                url: $scope.referenceData.directUploaderUrls.screenshotImageUrl,
                method: 'POST',
                headers: {'Content-Type': file.type,
                          'X-Apple-Upload-Referrer': window.location.href,
                          'X-Apple-Upload-AppleId': $scope.adamId,
                          'X-Apple-Request-UUID': _.guid(),
                          'X-Apple-Upload-itctoken': $scope.appVersionReferenceData.ssoTokenForImage,
                          'X-Apple-Upload-ContentProviderId': $scope.user.contentProviderId,
                          'X-Original-Filename': $scope.convertToUnicodeStr(file.name)
                         },
                file: file
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                //console.log("Success uploading preview image to DU!");

                $scope.addAppTrailerPreviewImageDataToMainJson(data, timestamp, isPortrait, device, language);
                $scope.imageUploadsInProgress--;

            }).error(function(data, status, headers, config) {
                console.info("ERROR uploading preview image to DU: ", data);

                $scope.setIsSaving(false);
                $scope.saveInProgress = false;
                $scope.imageUploadsInProgress--;
            });
        };

        $scope.geoJsonUpload = function() {
            if ($scope.tempPageContent.transitAppLoadingFile !== undefined && $scope.tempPageContent.transitAppLoadingFile !== null) {
                //console.log("We're uploading the geojson");
                $scope.tempPageContent.transitAppFileInProgress = true;
                $scope.imageUploadsInProgress++;
                //console.log("$scope.tempPageContent.transitAppLoadingFile.type "+ $scope.tempPageContent.transitAppLoadingFile.type)
                $scope.geojsonUploading = $upload.upload({
                    url: $scope.referenceData.directUploaderUrls.geoJsonFileUrl,
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',// hardcoding type $scope.tempPageContent.transitAppLoadingFile.type,
                              'X-Apple-Upload-Referrer': window.location.href,
                              'X-Apple-Upload-AppleId': $scope.adamId,
                              'X-Apple-Request-UUID': _.guid(),
                              'X-Apple-Upload-itctoken': $scope.appVersionReferenceData.ssoTokenForImage,
                              'X-Apple-Upload-ContentProviderId': $scope.user.contentProviderId,
                              'X-Original-Filename': $scope.convertToUnicodeStr($scope.tempPageContent.transitAppLoadingFile.name)
                             },
                    file: $scope.tempPageContent.transitAppLoadingFile
                }).progress(function(evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log("Success uploading geojson to DU");
                    $scope.addGeoJosnDataToMainJson(data)
                    $scope.imageUploadsInProgress--;
                    $scope.tempPageContent.transitAppFileInProgress = false;

                }).error(function(data, status, headers, config) {
                    console.log("GEOJSON ERROR: Status - " + status);
                    if (data) {
                       var locErrorKey = "ITC.apps.validation."+ data.suggestionCode.toLowerCase();
                        var errorToShow = $scope.l10n.interpolate(locErrorKey);
                        if ($scope.l10n.interpolate(locErrorKey) === locErrorKey) {
                            errorToShow = $scope.l10n.interpolate('ITC.AppVersion.GeneralInfoSection.TransitApp.FileNotLoaded');
                        }
                    } else {
                        var errorToShow = $scope.l10n.interpolate('ITC.AppVersion.DUGeneralErrors.FileNotLoaded');
                    }
                    $scope.tempPageContent.transitAppFileInProgress = false;
                    $scope.simpleFileDropErrors.error = errorToShow;
                    $scope.tempPageContent.userReadyToSave = false; //if we are in mid-save - stop
                    /*$scope.versionloaded = true;
                    $scope.setisReady();*/
                    $scope.setIsSaving(false);
                    $scope.saveInProgress = false;
                    $scope.imageUploadsInProgress--;
                });
            }
        }
        $scope.addGeoJosnDataToMainJson = function(data) {
            $scope.versionInfo.transitAppFile.value = {};
            $scope.versionInfo.transitAppFile.value.assetToken = data.token;
            $scope.versionInfo.transitAppFile.value.url = null;
            $scope.versionInfo.transitAppFile.value.size = data.length;
            $scope.versionInfo.transitAppFile.value.width = data.width;
            $scope.versionInfo.transitAppFile.value.height = data.height;
            $scope.versionInfo.transitAppFile.value.checksum = data.md5;
            $scope.versionInfo.transitAppFile.value.name = $scope.tempPageContent.transitAppLoadingFile.name;
        }

        $scope.imageDropped = function(data, watchFile) {
            var startSortOrderIndex;
            if (watchFile) {
                startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex("watch", $scope.currentLoc);
                $scope.imageUploadFile(data.file, data.url, startSortOrderIndex, "watch", $scope.currentLoc);  // sortOrder starts at startSortOrderIndex.
            }
            else {
                startSortOrderIndex = $scope.getScreenshotSortOrderStartIndex($scope.currentDevice, $scope.currentLoc);
                $scope.imageUploadFile(data.file, data.url, startSortOrderIndex, $scope.currentDevice, $scope.currentLoc);  // sortOrder starts at startSortOrderIndex.
            }
        };

        $scope.videoDropped = function(data) {
            //console.log("videoDropped: " + data.url);
            if ($scope.tempPageContent.previewVideos.length < $scope.numVideos) {
                $scope.tempPageContent.appPreviewSnapshotShowing = false;
                $scope.tempPageContent.appPreviewDropped = true;
                $scope.$apply(); // so loader appears NOW.
                data.upload = true; // do upload
                $scope.$broadcast('setVideoURL', data);
                // upload video to direct uploader
                //$scope.videoUploadFile(data.file); // MOVING THIS TO COPYPREVIEW
            }
            else {
                $scope.snapshotInfo.error = $scope.l10n.interpolate('ITC.AppVersion.Media.ErrorMessages.AppPreviewAlreadySelected');
            }
        };

        $scope.$on('showVideoModal', function(event, data) {
            //console.log("showVideoModal: " + data);

            $scope.tempPageContent.showModal = data; // will show or hide the modal dialog
            $scope.$apply();
        });

        $scope.areImagesEditable = function(watchImages) {
            if (!$scope.referenceData || !$scope.versionInfo || $scope.currentLoc === undefined) {
                return false;
            }
            var device;
            if (watchImages) {
                if (!$scope.watchDataExists()) {
                    return false;
                }
                device = "watch";
            }
            else {
                device = $scope.currentDevice;
            }

            if ($scope.currentLoc !== undefined) { // Check for undefined because it can be 0.
                if (device) {
                    return $scope.versionInfo.details.value[$scope.currentLoc].screenshots.value[device].isEditable;
                }
                else {
                    return $scope.versionInfo.details.value[$scope.currentLoc].screenshots.isEditable;
                }
            }
            else {
                return $scope.versionInfo.details.isEditable;
            }
        }

        /*
            Video is only editable (uploadable) if
            1. $scope.previewUploadAllowed (which is determined by the browser(s)/os(s) set in the property file
            (com.apple.jingle.label.appPreview.uploadAllowedOsAndVersions && com.apple.jingle.label.appPreview.uploadAllowedBrowsersAndVersions)
            and
            2. versionInfo.details.value[currentLoc].appTrailers.isEditable === true
        */
        $scope.isVideoEditable = function() {

            if (!$scope.referenceData || !$scope.versionInfo || $scope.currentLoc === undefined ||
                !$scope.versionInfo.details.value[$scope.currentLoc].appTrailers) {
                return false;
            }

            return $scope.referenceData.appPreviewEnabled  &&
                    $scope.versionInfo.details.value[$scope.currentLoc].appTrailers.isEditable;// &&
                    //$scope.previewUploadAllowed;
        }

        $scope.isVideoEditableAndUploadable = function() {
            if (!$scope.referenceData || !$scope.versionInfo || $scope.currentLoc === undefined ||
                !$scope.versionInfo.details.value[$scope.currentLoc].appTrailers) {
                return false;
            }

            return $scope.referenceData.appPreviewEnabled  &&
                    $scope.versionInfo.details.value[$scope.currentLoc].appTrailers.isEditable &&
                    $scope.previewUploadAllowed;
        }

        // Returns true if there are the max number of images and videos.
        $scope.areImagesMaxedOut = function() {
            if ($scope.previewImages && $scope.tempPageContent.previewVideos) {
                return $scope.previewImages.length===$scope.numImages && $scope.tempPageContent.previewVideos.length===$scope.numVideos;
            }
        };

        $scope.$watch('imageUploadsInProgress',function(){
            if($scope.tempPageContent !== undefined) {
                //console.log("imageUploadsInProgress: " + $scope.imageUploadsInProgress);
                //console.log("Ready to save?? " + $scope.tempPageContent.userReadyToSave);
                $scope.shouldSaveEnabled();
                //watch for changes in image upload progress and check if we need to save page
                //userReadyToSave will be set to true once user clicks on "save" button.
                if ($scope.tempPageContent.userReadyToSave && $scope.imageUploadsInProgress === 0) {
                    $scope.saveVersionDetails();
                }
            }
        });

        $scope.hasErrorsInGroup = function(device, loc) {
            // Note: add other error checks that should prevent save here:

            // Jenn requested I remove the check for no screenshots. Leaving this commented out as I think
            // we might change our minds later
            //var noSnapshots = $scope.hasNoScreenshot(device, loc);

            /*if (loc === undefined) {
                return false;
            }*/
            var language = $scope.getLanguageString(loc);
            var hasSaveErrors = $scope.allImages.hasErrorsInGroup(language, device);
            var hasDeviceSpecificError = $scope.allImages.hasLanguageDeviceSpecificError(language, device) ||
                                         $scope.tempPageContent.allVideos.hasLanguageDeviceSpecificError(language, device);

            //return noSnapshots || hasSaveErrors || hasDeviceSpecificError;
            return hasSaveErrors || hasDeviceSpecificError;
        }

        //function to check localization for screenshot issues...
        var hasMediaErrorsInLoc = function(loc) {
            var dev;
            var locStr = $scope.getLanguageString(loc);
            if ($scope.allImages.hasLanguageSpecificError(locStr) || $scope.tempPageContent.allVideos.hasLanguageSpecificError(locStr)) {
                return true;
            }
            if ($scope.deviceNames) {
                for (var i = 0; i < $scope.deviceNames.length; i++) {
                    dev = $scope.deviceNames[i];
                    if ($scope.hasErrorsInGroup(dev, loc)) {
                        return true;
                    }
                }
            }
            return false;
        }

        $scope.getStrFromLoc = function(key) {
            if ($scope.l10n && $scope.l10n[key]) {
                return $scope.l10n.interpolate(key);
            }
            else {
                return key;
            }
        };

        $scope.getSectionInfoMessage = function(key) {
            //var msg = $scope.l10n[key];
            //var status = $scope.getCurrentAppStatus();


            //msg = msg.replace('@@CurrentStatus@@', status);
            //return msg;
            return $scope.l10n.interpolate(key,{'CurrentStatus':$scope.getCurrentAppStatus()});
        }

        $scope.getCurrentAppStatus = function() {
            if ($scope.versionInfo) {
                var state = $scope.versionInfo.status;
                var key = $scope.referenceData.statusLevels[state];
                return $scope.getStrFromLoc(key.locKey);
            }
            else {
                return "";
            }
        }

        $scope.getCurrentAppState = function() {
            if ($scope.versionInfo) {
                var state = $scope.versionInfo.status;
                return state;
            }
            else {
                return "";
            }
        }

        $scope.getDevRejectHeader = function() {
            var state = $scope.getCurrentAppState();
            var locKey = 'ITC.apps.devReject.message.confirmation.header.' + state;
            var headerStr = $scope.getStrFromLoc(locKey);
            if (headerStr === locKey) {
                headerStr = $scope.getStrFromLoc('ITC.apps.devReject.message.confirmation.header');
            }
            if ($scope.versionInfo) {
                headerStr = headerStr.replace('@@versionNumber@@', $scope.versionInfo.version.value);
            }
            return headerStr;
        }

        $scope.getDevRejectMessage = function() {
            var state = $scope.getCurrentAppState();
            var locKey = 'ITC.apps.devReject.message.confirmation.message.' + state;
            var msg = $scope.getStrFromLoc(locKey);
            if (msg === locKey) {
                msg = $scope.getStrFromLoc('ITC.apps.devReject.message.confirmation.message');
            }
            return msg;
        }

        $scope.getDevRejectOkButtonText = function() {
            var state = $scope.getCurrentAppState();
            var locKey = 'ITC.apps.devReject.message.confirmation.okButtonText.' + state;
            var msg = $scope.getStrFromLoc(locKey);
            if (msg === locKey) {
                msg = $scope.getStrFromLoc('ITC.apps.devReject.message.confirmation.okButtonText');
            }
            return msg;
        }

        $scope.getDevRejectCancelButtonText = function() {
            var state = $scope.getCurrentAppState();
            var locKey = 'ITC.apps.devReject.message.confirmation.cancelButtonText.' + state;
            var msg = $scope.getStrFromLoc(locKey);
            if (msg === locKey) {
                msg = $scope.getStrFromLoc('ITC.apps.devReject.message.confirmation.cancelButtonText');
            }
            return msg;
        }

        $scope.getGeneralErrorsInGroup = function() {
            return $scope.getErrorsInGroup($scope.currentLoc, $scope.currentDevice);
        }

        $scope.getErrorsInGroup = function(locID, device, msgsImages) {
            var errorStr = "";
            if ($scope.versionInfo) {

                var imgs, vids;
                if (msgsImages) {
                    imgs = $scope.allMsgsImages;
                    vids = $scope.tempPageContent.allMsgsVideos;
                }
                else {
                    imgs = $scope.allImages;
                    vids = $scope.tempPageContent.allVideos;
                }
                var language = $scope.getLanguageString(locID);
                //var device = $scope.currentDevice;
                if (imgs) {
                    if (imgs.hasLanguageDeviceSpecificError(language, device)) {
                        errorStr = imgs.getLanguageDeviceSpecificError(language, device);
                    }
                    if (imgs.hasLanguageSpecificError(language)) {
                        errorStr += " " + imgs.getLanguageSpecificError(language);
                    }
                }

                if (vids) {
                    if (vids.hasLanguageDeviceSpecificError(language, device)) {
                        errorStr += vids.getLanguageDeviceSpecificError(language, device);
                    }
                    if (vids.hasLanguageSpecificError(language)) {
                        errorStr += " " + vids.getLanguageSpecificError(language);
                    }
                }
            }

            if (errorStr === "") {
                errorStr = false;
            }
            return errorStr;
        }

        // Returns true if there are no screenshots at device/language
        $scope.hasNoScreenshot = function(device, language) {
            var screenshotsArr = $scope.getScreenshotsArr(language, device);
            return screenshotsArr.length === 0;
        }

        $scope.addAppTrailerDataToMainJson = function(data, contentType, currentDevice, currentLoc) {
            var currentDevData = $scope.getAppTrailerFromJSON(currentLoc, currentDevice);

            var appTrailerData = currentDevData.value; // preview image may have been saved by user while video was uploading
            if (!appTrailerData) {
                // video may still be uploading, but we want to allow saving of preview image data
                appTrailerData = {};
            }

            appTrailerData["videoAssetToken"] = data.responses[0].token; // testing error handling
            appTrailerData["descriptionXML"] =  data.responses[0].descriptionDoc;
            appTrailerData["contentType"] = contentType;

            currentDevData.value = appTrailerData;
        };

        $scope.deleteAppTrailerDataFromMainJson = function(device) {
            if ($scope.referenceData.appPreviewEnabled) {
                // should only need to delete from current loc.. but instead, chong tells me i need to delete from all locs
                var details; // = $scope.versionInfo.details.value[$scope.currentLoc]; // this is how it should be
                var currentDevData;
                for (var loc=0; loc<$scope.versionInfo.details.value.length; loc++) {
                    currentDevData = $scope.getAppTrailerFromJSON(loc, device);
                    currentDevData.value = null;
                }
            }
        };

        $scope.addAppTrailerPreviewImageDataToMainJson = function(data, timestamp, isPortrait, device, loc) {
            if ($scope.referenceData.appPreviewEnabled) {
                var currentDevData = $scope.getAppTrailerFromJSON(loc, device);

                var appTrailerData = currentDevData.value;
                if (!appTrailerData) {
                    // video may still be uploading, but we want to allow saving of preview image data
                    appTrailerData = {};
                }

                appTrailerData["pictureAssetToken"] = data.token;
                appTrailerData["size"] = data.length;
                appTrailerData["width"] = data.width;
                appTrailerData["height"] = data.height;
                appTrailerData["checksum"] = data.md5;
                appTrailerData["previewFrameTimeCode"] = timestamp; //"00:00:10:00";
                appTrailerData["isPortrait"] = isPortrait;

                currentDevData.value = appTrailerData;
            }
        };

        $scope.addScreenshotDataToMainJson = function(data, sortOrder, device, language, originalFilename) {
            var screenshotData = {};
            screenshotData['value'] = {};
            screenshotData['value']['assetToken'] = data.token;
            screenshotData['value']['sortOrder'] = sortOrder;
            screenshotData['value']['originalFileName'] = originalFilename;

            var screenshotsArr = $scope.getScreenshotsArr(language, device);

            // increment sortOrder of screenshots with greater or equal sortOrders
            var screenshot, currentSortOrder;
            for (var i = 0; i < screenshotsArr.length; i++) {
                screenshot = screenshotsArr[i].value;
                currentSortOrder = screenshot['sortOrder'];
                if (currentSortOrder >= sortOrder) {
                    screenshot['sortOrder'] = currentSortOrder + 1;
                }
            }
            // push the new screenshot
            screenshotsArr.push(screenshotData);

            //console.info("set snapshots in json: ", screenshotsArr);
        }

        $scope.deleteScreenshotDataFromMainJson = function(sortOrder, device, language, msgsMedia) {
            var screenshotsArr;
            if (msgsMedia) {
                screenshotsArr = $scope.getMsgsScreenshotsArr(language, device);
            }
            else {
                screenshotsArr = $scope.getScreenshotsArr(language, device);
            }
            var screenshot, removeIndex, currentSortOrder;
            for (var i = 0; i < screenshotsArr.length; i++) {
                screenshot = screenshotsArr[i].value;
                currentSortOrder = screenshot['sortOrder'];
                if (currentSortOrder === sortOrder) {
                    removeIndex = i;
                }
                else if (currentSortOrder > sortOrder) { // decrement sortOrder of screenshots with greater sortOrders
                    screenshot['sortOrder'] = currentSortOrder - 1;
                }
            }

            screenshotsArr.splice(removeIndex, 1);
        }

        $scope.deleteAllScreenshotDataFromMainJson = function(device, language, msgsScreenshots) {
            var screenshotsArr;
            if (msgsScreenshots) {
                screenshotsArr = $scope.getMsgsScreenshotsArr(language, device);
            }
            else {
                screenshotsArr = $scope.getScreenshotsArr(language, device);
            }
            screenshotsArr.length = 0;
        }

        // Returns 0 or 1 depending on what the first screenshot's sortOrder is. Need this to correct sort order start index to 0.
        $scope.getScreenshotSortOrderStartIndex = function(device, language, isMsgsMedia) {
            var screenshotsArr;
            if (isMsgsMedia) {
                screenshotsArr = $scope.getMsgsScreenshotsArr(language, device);
            } else {
                screenshotsArr = $scope.getScreenshotsArr(language, device);
            }

            /*
            var screenshotsValue = $scope.versionInfo.details.value[language].screenshots.value[device];
            var screenshotsArr;
            if (screenshotsValue) {
                screenshotsArr = screenshotsValue.value;
            }
            else {
                screenshotsArr = new Array(); // which will cause 1 to get returned
            }*/

            var screenshot, currentSortOrder;
            var lowestSortOrder = 999999; // start big
            for (var i = 0; i < screenshotsArr.length; i++) {
                screenshot = screenshotsArr[i].value;
                currentSortOrder = screenshot['sortOrder'];
                if (currentSortOrder < lowestSortOrder) {
                    lowestSortOrder = currentSortOrder;
                }
            }
            if (screenshotsArr.length === 0) {
                lowestSortOrder = 1;
            }
            return lowestSortOrder;
        }

        // Little workaround to change the indices of the sort orders to start at 0 if they don't.
        /*$scope.decrementScreenshotSortOrderStartIndices = function(device, language) {
            var decrementAmount = $scope.getScreenshotSortOrderStartIndex(device, language);
            if (decrementAmount === 0) {
                return; // nothing needs to change
            }

            var screenshotsArr = $scope.versionInfo.details.value[language].screenshots.value[device].value;
            var screenshot, currentSortOrder;
            for (var i = 0; i < screenshotsArr.length; i++) {
                screenshot = screenshotsArr[i].value;
                screenshot['sortOrder'] = screenshot['sortOrder'] - decrementAmount;
            }
        }*/

        // Called when moving an image from index "from" to index "to". Just modifies the sortOrder of the screenshots in the json.
        $scope.changeScreenshotSortOrderInMainJson = function(from, to, device, language, isMsgsMedia) {
            var screenshotsArr;
            if (isMsgsMedia) {
                screenshotsArr = $scope.getMsgsScreenshotsArr(language, device);
            } else {
                screenshotsArr = $scope.getScreenshotsArr(language, device);
            }

            var screenshot, fromScreenshot, currentSortOrder;
            if (from > to) {
                for (var i = 0; i < screenshotsArr.length; i++) {
                    screenshot = screenshotsArr[i].value;
                    currentSortOrder = screenshot['sortOrder'];
                    if (currentSortOrder === from) {
                        fromScreenshot = screenshot; // save for the end of this method
                    }
                    else if (currentSortOrder >= to && currentSortOrder < from) { // increment sortOrder of screenshots between to and from.
                        screenshot['sortOrder'] = currentSortOrder + 1;
                    }
                }

                fromScreenshot['sortOrder'] = to;

            }
            else if (to > from) {
                 for (var i = 0; i < screenshotsArr.length; i++) {
                    screenshot = screenshotsArr[i].value;
                    currentSortOrder = screenshot['sortOrder'];
                    if (currentSortOrder === from) {
                        fromScreenshot = screenshot; // save for the end of this method
                    }
                    else if (currentSortOrder > from && currentSortOrder <= to) { // decrement sortOrder of screenshots between to and from.
                        screenshot['sortOrder'] = currentSortOrder - 1;
                    }
                }

                fromScreenshot['sortOrder'] = to;
            }
        }

        // BEING GAME CENTER

        $scope.enableDoneButton = function(obj1, obj2, whichModal) {
            if (_.isEqual(angular.toJson(obj1), angular.toJson(obj2))) {
                $scope.tempPageContent[whichModal].modal.doneButtonEnabled = false;
            }
            else {
                // console.log(' ??? obj1: ', obj1);
                // console.log(' ??? obj2: ', obj2);
                $scope.tempPageContent[whichModal].modal.doneButtonEnabled = true;
            }
        }

        // BEGIN Leaderboard Sets specific functions

        $scope.showLeaderboardSetsModal = function() {
            $scope.modalsDisplay.leaderboardSetsModal = true;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;

            $scope.tempPageContent.leaderboardSets.modal.tempLeaderboardSetList = angular.copy($scope.versionInfo.gameCenterSummary.displaySets.value);
            $scope.tempPageContent.leaderboardSets.modal.tempLeaderboardList = angular.copy($scope.versionInfo.gameCenterSummary.leaderboards.value);

            $scope.$watch('tempPageContent.leaderboardSets.modal.tempLeaderboardSetList', function(){
                $scope.enableDoneButton($scope.tempPageContent.leaderboardSets.modal.tempLeaderboardSetList,
                                        $scope.versionInfo.gameCenterSummary.displaySets.value,
                                        'leaderboardSets');
            }, true);
        }

        // $scope.updateLeaderboardAttachments = function() {
        //     var attachedLeaderboardSets = _.where($scope.tempPageContent.leaderboardSets.modal.tempLeaderboardSetList, {isAttached: true});
        //     var attachedLeaderboardIds = [];
        //     for (var i = 0; i < attachedLeaderboardSets.length; i++) {

        //         for (var x = 0; x < attachedLeaderboardSets[i].leaderboards.length; x++) {
        //             if (attachedLeaderboardSets[i].leaderboards[x].isAttached === true) {
        //                 attachedLeaderboardIds.push(attachedLeaderboardSets[i].leaderboards[x].id);
        //             }
        //         }
        //     }
        //     for (var y = 0; y < $scope.versionInfo.gameCenterSummary.leaderboards.value.length; y++) {
        //         if (_.contains(attachedLeaderboardIds, $scope.versionInfo.gameCenterSummary.leaderboards.value[y].id)) {
        //             $scope.versionInfo.gameCenterSummary.leaderboards.value[y].isAttached = true;
        //         }
        //     }
        // }

        $scope.lbToggleEvent = function(selectedLeaderboard) {
            // console.log('??? selectedLeaderboard: ', selectedLeaderboard);

            _.each($scope.tempPageContent.leaderboardSets.modal.tempLeaderboardList, function(currLeaderboard, index){
                if (currLeaderboard.id == selectedLeaderboard.id) currLeaderboard.isAttached = !currLeaderboard.isAttached;
            });
        }

        var combineLeaderboardsWithinSetsObj = function(leaderboardSetList) {
            var newLearboardList = [];

            _.each(leaderboardSetList, function(currSet){
                newLearboardList = newLearboardList.concat(currSet.leaderboards);
            });

            return newLearboardList;
        }

        $scope.closeLeaderboardSetsModal = function(value) {
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            if (value) {
                $scope.versionInfo.gameCenterSummary.displaySets.value = angular.copy($scope.tempPageContent.leaderboardSets.modal.tempLeaderboardSetList);
                $scope.versionInfo.gameCenterSummary.leaderboards.value = combineLeaderboardsWithinSetsObj(angular.copy($scope.tempPageContent.leaderboardSets.modal.tempLeaderboardSetList));
                $scope.setupGameCenter();
            } else {
                $scope.tempPageContent.leaderboardSets.modal.tempLeaderboardSetList = [];
            }

            $scope.modalsDisplay.leaderboardSetsModal = false;

            $scope.selectedLeaderboardSet = {};
        }

        $scope.showLeaderboards = function(leaderboardSet) {
            $scope.selectedLeaderboardSet = leaderboardSet;
        }

        $scope.getRemainingLBSetsAndLBsString = function() {

            //var locString = $scope.l10n['ITC.AppVersion.LeaderboardSetsModal.Remaining'];
            var maxLBSets = $scope.versionInfo.gameCenterSummary.maxLeaderboardSets;
            var maxLBs = $scope.versionInfo.gameCenterSummary.maxLeaderboards;
            var usedLBSets = $scope.versionInfo.gameCenterSummary.usedLeaderboardSets;
            var usedLBs = $scope.versionInfo.gameCenterSummary.usedLeaderboards;


            /*locString = locString.replace('@@MaxLBSets@@', maxLBSets);
            locString = locString.replace('@@MaxLBs@@', maxLBs);
            locString = locString.replace('@@UsedLBSets@@', usedLBSets);
            locString = locString.replace('@@UsedLBs@@', usedLBs);*/

            return $scope.l10n.interpolate('ITC.AppVersion.LeaderboardSetsModal.Remaining',{'MaxLBSets':maxLBSets,'MaxLBs':maxLBs,'UsedLBSets':usedLBSets,'UsedLBs':usedLBs});

            //return locString;
        }

        $scope.calcUsedLeaderboards = function() {
            var attachedLeaderboards = $scope.filterObject($scope.tempPageContent.leaderboards.modal.tempLeaderboardList, {isAttached: true});

            var used = 0;

            _.each(attachedLeaderboards, function(leaderboard){
                if (leaderboard.isAttached) used++;
            });

            return used;
        }

        $scope.getRemainingLBsString = function() {

            //var locString = $scope.l10n['ITC.AppVersion.LeaderboardModal.RemainingCount'];
            var used = $scope.versionInfo.gameCenterSummary.usedLeaderboards;
            var total = $scope.versionInfo.gameCenterSummary.maxLeaderboards;

            var remaining = total - (used + $scope.calcUsedLeaderboards());

            /*locString = locString.replace('@@Used@@', remaining);
            locString = locString.replace('@@Total@@', total);*/

            var locString = $scope.l10n.interpolate('ITC.AppVersion.LeaderboardModal.RemainingCount',{'Used':remaining,'Total':total});

            $scope.remainingLBsString = locString;

            return locString;
        }

        $scope.lbSetDetachedEvent = function() {
            $scope.selectedLeaderboardSet = {};
        }

        // END Leaderboard Sets specific functions

        // BEGIN Leaderboard With Sets/Alt specific functions

        $scope.showLeaderboardsWithSetsModal = function() {
            $scope.modalsDisplay.leaderboardsWithSetsModal = true;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;

            $scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardList = angular.copy($scope.versionInfo.gameCenterSummary.leaderboards.value);
            $scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList = angular.copy($scope.versionInfo.gameCenterSummary.displaySets.value);

            $scope.$watch('tempPageContent.leaderboardsWithSets.modal.tempLeaderboardList', function(){
                $scope.enableDoneButton($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardList,
                                        $scope.versionInfo.gameCenterSummary.leaderboards.value,
                                        'leaderboardsWithSets');
            }, true);

            $scope.$watch('tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList', function(){
                $scope.enableDoneButton($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList,
                                        $scope.versionInfo.gameCenterSummary.displaySets.value,
                                        'leaderboardsWithSets');
            }, true);
        }

        // $scope.updateAssociatedLeaderboardSets = function() {
        //     $scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList;
        // }

        $scope.closeLeaderboardWithSetsModal = function(value) {
            if (value) {
                $scope.versionInfo.gameCenterSummary.leaderboards.value = angular.copy($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardList);
                $scope.versionInfo.gameCenterSummary.displaySets.value = angular.copy($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList);
                $scope.setupGameCenter();
            } else {
                $scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardList = [];
                $scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList = [];
            }

            $scope.associatedLeaderboardSets = [];
            $scope.modalsDisplay.leaderboardsWithSetsModal = false;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
        }

        $scope.showLeaderboardSet = function(leaderboard) {
            $scope.selectedLeaderboard = leaderboard;

            var matchingLeaderboardSets = [];

            for (var x = 0; x < $scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList.length; x++) {

                var matchCheck = _.find($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList[x].leaderboards, function(currLeaderboard){
                    return currLeaderboard.id == leaderboard.id;
                });

                if (matchCheck) matchingLeaderboardSets.push($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList[x]);
            }

            $scope.associatedLeaderboardSets = matchingLeaderboardSets;
        }

        // $scope.lbSetAttachmentEvent = function(leaderboardSet) {
        //     _.each($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList, function(lbSet, index){
        //         if (lbSet.id == leaderboardSet.id) {
        //             lbSet.isAttached = !lbSet.isAttached;
        //             return;
        //         }
        //     });
        // }

        $scope.setNestedLeaderboardProperty = function(selectedLeaderboard, property, value) {
            _.each($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList, function(lbSet, index){
                _.each(lbSet.leaderboards, function(currLeaderboard, index) {
                    if (currLeaderboard.id == selectedLeaderboard.id) currLeaderboard[property] = value;
                });
            });
        }

        $scope.getLeaderboardSetsIdsAssociatedWithLeaderboardId = function(leaderboardId) {
            var leaderboardSetsIds = [];
            _.each($scope.versionInfo.gameCenterSummary.displaySets.value, function(lbSet, index){
                if (_.findWhere(lbSet.leaderboards, {id: leaderboardId})) leaderboardSetsIds.push(lbSet.id);
            });
            return leaderboardSetsIds;
        }

        $scope.getLiveLeaderboards = function(){
            var liveLeaderboards = [];
            _.each($scope.tempPageContent.leaderboardsWithSets.modal.tempLeaderboardSetList, function(lbSet){
                liveLeaderboards = liveLeaderboards.concat(_.where(lbSet.leaderboards, {isLive: true}));
            });
            return liveLeaderboards;
        }

        $scope.lbAttachedEvent = function(selectedLeaderboard) {
            $scope.setNestedLeaderboardProperty(selectedLeaderboard, 'isAttached', true);

            $scope.showLeaderboardSet(selectedLeaderboard);
        }

        $scope.lbDetachedEvent = function(selectedLeaderboard) {
            $scope.setNestedLeaderboardProperty(selectedLeaderboard, 'isAttached', false);

            $scope.associatedLeaderboardSets = {};
        }

        // END Leaderboard With Sets/Alt specific functions

        // BEGIN Leaderboard specific functions

        $scope.showLeaderboardModal = function() {
            $scope.modalsDisplay.leaderboardsModal = true;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;

            $scope.tempPageContent.leaderboards.modal.tempLeaderboardList = angular.copy($scope.versionInfo.gameCenterSummary.leaderboards.value);

            var hasNonMandatory = false;
            for (var i=$scope.tempPageContent.leaderboards.modal.tempLeaderboardList.length-1; i >= 0 && !hasNonMandatory; --i) {
                hasNonMandatory = !$scope.tempPageContent.leaderboards.modal.tempLeaderboardList[i].isMandatory;
            }
            $scope.tempPageContent.leaderboards.modal.tempLeaderboardList.instructionKey =
                (hasNonMandatory)
                    ? "ITC.AppVersion.LeaderboardModal.InstructionsText"
                    : "ITC.AppVersion.LeaderboardModal.AllMandatory";

            // $scope.nonLiveLBs = _.filter($scope.tempPageContent.leaderboards.modal.tempLeaderboardList, function(leaderboard){
            //     if (leaderboard.isLive)
            // });

            $scope.$watch('tempPageContent.leaderboards.modal.tempLeaderboardList', function(){
                $scope.enableDoneButton($scope.tempPageContent.leaderboards.modal.tempLeaderboardList,
                                        $scope.versionInfo.gameCenterSummary.leaderboards.value,
                                        'leaderboards');
            }, true);
        }

        $scope.closeLeaderboardModal = function(value) {
            if (value) {
                $scope.versionInfo.gameCenterSummary.leaderboards.value = angular.copy($scope.tempPageContent.leaderboards.modal.tempLeaderboardList);
                $scope.setupGameCenter();
            }

            $scope.tempPageContent.leaderboards.modal.tempLeaderboardList = [];

            $scope.modalsDisplay.leaderboardsModal = false;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
        }

        // END Leaderboard specific functions

        // BEGIN Achievements specific functions

        $scope.showAchievementsModal = function() {
            $scope.modalsDisplay.achievementsModal = true;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;

            $scope.tempPageContent.achievements.modal.tempAchievementsList = angular.copy($scope.versionInfo.gameCenterSummary.achievements.value);

            $scope.$watch('tempPageContent.achievements.modal.tempAchievementsList', function(){
                if ($scope.getRemainingAchievementPoints() < 0) {
                    $scope.tempPageContent['achievements'].modal.doneButtonEnabled = false;
                }
                else {
                    $scope.enableDoneButton($scope.tempPageContent.achievements.modal.tempAchievementsList,
                                            $scope.versionInfo.gameCenterSummary.achievements.value,
                                            'achievements');
                }
            }, true);
        }

        $scope.calcUsedAchievementPoints = function() {
            var attachedAchievements = $scope.filterObject($scope.tempPageContent.achievements.modal.tempAchievementsList, {isAttached: true});

            var pointsUsed = 0;

            _.each(attachedAchievements, function(achievement){
                pointsUsed += achievement.points;
            })

            return pointsUsed;
        }

        $scope.getRemainingAchievementPoints = function() {
            var maxAchievementPoints = $scope.versionInfo.gameCenterSummary.maxAchievementPoints;
            var usedAchievementPoints = $scope.versionInfo.gameCenterSummary.usedAchievementPoints;
            var newPointsUsed = $scope.calcUsedAchievementPoints();
            var remainingPoints = maxAchievementPoints - (usedAchievementPoints + newPointsUsed);
            return remainingPoints;
        }

        $scope.getRemainingAchievementPointsString = function() {
            var maxAchievementPoints = $scope.versionInfo.gameCenterSummary.maxAchievementPoints;
            var remainingPoints = $scope.getRemainingAchievementPoints();
//            var locString = $scope.l10n['ITC.AppVersion.AchievementsModal.RemainingCount'];
//            locString = locString.replace('@@Total@@', maxAchievementPoints);
//            locString = locString.replace('@@Used@@', remainingPoints);

            var locString = $scope.l10n.interpolate('ITC.AppVersion.AchievementsModal.RemainingCount',{'Total':maxAchievementPoints,'Used':remainingPoints});
            $scope.remainingAchievementPointsString = locString;

            return locString;
        }

        $scope.closeAchievementsModal = function(value) {
            if (value) {
                $scope.versionInfo.gameCenterSummary.achievements.value = angular.copy($scope.tempPageContent.achievements.modal.tempAchievementsList);
                $scope.setupGameCenter();
            }

            $scope.tempPageContent.achievements.modal.tempAchievementsList = [];
            $scope.modalsDisplay.achievementsModal = false;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
        }

        // END Achievements specific functions

        $scope.getCandidateImage = function(app) {
            var config = {
                token: app.iconAssetToken,
                height:30,
            };
            return $scope.img_url_gen.generateUrlForToken(config);
        }

        $scope.loadMultiplayerCompatibilityCandidates = function() {
            if ($scope.multiplayerCompatibilityCandidates) return;

            $scope.multiplayerCompatibilityCandidates = {};

            gameCenterService.getMultiplayerCompatibilityList($scope.adamId).then(function(data){
                $scope.multiplayerCompatibilityCandidates = data.data;

                $scope.appsAvailableToAddToMultiplayer = $scope.getAppsAvailableToAddToMultiplayer();
            });
        }

        $scope.setGameCenterVersionCompatibility = function() {
            var tempMultiplayerCompatibilityList = angular.copy($scope.multiplayerCompatibilityList)

            _.each(tempMultiplayerCompatibilityList, function(app){
                _.each(app.platforms, function(platform){
                    delete platform.earliestCompatibleVersion;
                });
            });

            $scope.versionInfo.gameCenterSummary.versionCompatibility.value = tempMultiplayerCompatibilityList;
        }

        $scope.getMultiplayerCompatibilityList = function() {
            if ($scope.multiplayerCompatibilityList) return;

            var compatibleApps = angular.copy($scope.versionInfo.gameCenterSummary.versionCompatibility.value);

            compatibleApps = $scope.setEarliestCompatibleVersion(compatibleApps);

            $scope.multiplayerCompatibilityList = compatibleApps;
        }

        $scope.getAppPlatforms = function(app) {
            var localizedPlatforms = '';

            _.each(app.platforms, function(platform, index){
                if (index > 0) localizedPlatforms += ", ";
                localizedPlatforms += $scope.l10n.interpolate('ITC.AppStoreSideBar.NewVersion.'+platform.platformString);
            });

            return localizedPlatforms;
        }

        $scope.getAppIconUrl = function(assetToken) {
            var config = {
                token: assetToken,
            };

            return $scope.img_url_gen.generateUrlForToken(config);
        }

        $scope.getAppsAvailableToAddToMultiplayer = function() {
            var appsAlreadyInMultiplayer = {};

            _.each($scope.multiplayerCompatibilityList, function(app) {
                appsAlreadyInMultiplayer[app.adamId] = true;
            });

            var remainingApps = _.filter($scope.multiplayerCompatibilityCandidates, function(app){
                if (!appsAlreadyInMultiplayer[app.adamId]) return true;
            });

            return remainingApps;
        }

        /**
         * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
         *
         * This function was born in http://stackoverflow.com/a/6832721.
         *
         * @param {string} v1 The first version to be compared.
         * @param {string} v2 The second version to be compared.
         * @param {object} [options] Optional flags that affect comparison behavior:
         * <ul>
         *     <li>
         *         <tt>lexicographical: true</tt> compares each part of the version strings lexicographically instead of
         *         naturally; this allows suffixes such as "b" or "dev" but will cause "1.10" to be considered smaller than
         *         "1.2".
         *     </li>
         *     <li>
         *         <tt>zeroExtend: true</tt> changes the result if one version string has less parts than the other. In
         *         this case the shorter string will be padded with "zero" parts instead of being considered smaller.
         *     </li>
         * </ul>
         * @returns {number|NaN}
         * <ul>
         *    <li>0 if the versions are equal</li>
         *    <li>a negative integer iff v1 < v2</li>
         *    <li>a positive integer iff v1 > v2</li>
         *    <li>NaN if either version string is in the wrong format</li>
         * </ul>
         *
         * @copyright by Jon Papaioannou (["john", "papaioannou"].join(".") + "@gmail.com")
         * @license This function is in the public domain. Do what you want with it, no strings attached.
         */
        $scope.versionCompare = function(v1, v2, options) {
            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) v1parts.push("0");
                while (v2parts.length < v1parts.length) v2parts.push("0");
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length == i) {
                    return 1;
                }

                if (v1parts[i] == v2parts[i]) {
                    continue;
                }
                else if (v1parts[i] > v2parts[i]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            if (v1parts.length != v2parts.length) {
                return -1;
            }

            return 0;
        }

        $scope.updateEarliestCompatibleVersion = function(platformString) {
            var currentApp = this.app;

            var platformToUpdate = _.filter(currentApp.platforms, function(platform){
                if (platform.platformString === platformString) return true;
            });

            for (var i = 0; i < currentApp.platforms.length; i++) {
                if (currentApp.platforms[i].platformString === platformString) break;
            }

            var earliestCompatibleVersion = currentApp.platforms[i].earliestCompatibleVersion;

            if (!earliestCompatibleVersion) {
                _.each(currentApp.platforms[i].compatibleVersions, function(value, key){
                    currentApp.platforms[i].compatibleVersions[key] = false;
                });
            }
            else {
                _.each(currentApp.platforms[i].compatibleVersions, function(value, key){
                    var versionCompareResult = $scope.versionCompare(key, earliestCompatibleVersion);

                    if (versionCompareResult === 0 || versionCompareResult >= 1) {
                        currentApp.platforms[i].compatibleVersions[key] = true;
                    }
                    else {
                        currentApp.platforms[i].compatibleVersions[key] = false;
                    }
                });
            }

            // delete currentApp.platforms[i].earliestCompatibleVersion; // rdar://problem/28656339

            $scope.setGameCenterVersionCompatibility();
        }

        $scope.setEarliestCompatibleVersion = function(compatibleApps) {
            _.each(compatibleApps, function(app){
                _.each(app.platforms, function(platform){
                    _.find(platform.compatibleVersions, function(value, key){
                        if (value === true) {
                          platform.earliestCompatibleVersion = key;
                          return true;
                        }
                    });
                });
            });

            return compatibleApps;
        }

        $scope.addAppToMultiplayer = function(selectedApp) {
            var appToAdd = angular.copy(selectedApp);

            _.each(appToAdd.platforms, function(platform){
                var compatibleVersions = {};
                _.each(platform.versions, function(version, index) {
                    compatibleVersions[version] = true;
                });
                platform.compatibleVersions = compatibleVersions;
                delete platform.versions;
            });

            $scope.multiplayerCompatibilityList.push(appToAdd);

            $scope.setGameCenterVersionCompatibility();

            $scope.appsAvailableToAddToMultiplayer = $scope.getAppsAvailableToAddToMultiplayer();
        }

        $scope.removeAppFromMultiplayer = function(app) {

            var index = $scope.multiplayerCompatibilityList.indexOf(app);

            if (index > -1) $scope.multiplayerCompatibilityList.splice(index, 1);

            $scope.setGameCenterVersionCompatibility();

            $scope.appsAvailableToAddToMultiplayer = $scope.getAppsAvailableToAddToMultiplayer();
        }

        $scope.hasUnapprovedGCDataCheck = function(availableItems, unapprovedItems) {
            if (unapprovedItems.length && availableItems.length) {
                var hasUnapprovedItems = _.find(unapprovedItems, function(unapprovedItem) {
                    var hasUnapprovedItem = _.find(availableItems, function(availableItem){
                        if (availableItem.id == unapprovedItem) return true;
                    });
                    if (hasUnapprovedItem) return true;
                });

                if (hasUnapprovedItems) return true;
                else return false;
            }
            else if (unapprovedItems.length && !availableItems.length) {
                return false;
            }
            else return false;
        }

        $scope.hasUnapprovedGCData = function() {
            if (!$scope.hasUnapprovedGCDataCheck($scope.availableLeaderboardSets, $scope.versionInfo.gameCenterSummary.unapprovedLeaderboardSets) &&
                !$scope.hasUnapprovedGCDataCheck($scope.availableLeaderboards, $scope.versionInfo.gameCenterSummary.unapprovedLeaderboards) &&
                !$scope.hasUnapprovedGCDataCheck($scope.availableAchievements, $scope.versionInfo.gameCenterSummary.unapprovedAchievements)) return false;
            else return true;
        }

        $scope.shouldGameCenterBeEditable = function() {
            if ($scope.versionInfo.gameCenterSummary.isEditable && !$scope.hasUnapprovedGCData()) return true;
            else return false;
        }

        $scope.validateGCVersionInfo = function() {
            gameCenterService.validateVersionInfo($scope.adamId, $scope.versionInfo).then(function(data){
                if (data.data.data.messages.length > 0) {
                    $scope.tempPageContent.showAdditionalError = true;
                    $scope.tempPageContent.additionalError = $scope.tempPageContent.additionalError.concat(data.data.data.messages);
                }
            });
        }

        $scope.setupGameCenter = function() {
            $scope.getRemainingAchievementPointsString();
            $scope.getRemainingLBsString();
            $scope.remainingLBSetsAndLBsString = $scope.getRemainingLBSetsAndLBsString();

            $scope.totalLiveLeaberboardSets = $scope.filterObject($scope.versionInfo.gameCenterSummary.displaySets.value, {isLive: true}).length;
            $scope.totalAttachedLeaderboardSets = $scope.filterObject($scope.versionInfo.gameCenterSummary.displaySets.value, {isAttached: true}).length;
            $scope.totalMandatoryLeaderboardSets = $scope.filterObject($scope.versionInfo.gameCenterSummary.displaySets.value, {isMandatory: true}).length;

            $scope.totalAttachedLeaderboards = $scope.filterObject($scope.versionInfo.gameCenterSummary.leaderboards.value, {isAttached: true}).length;
            $scope.totalLiveLeaderboards = $scope.filterObject($scope.versionInfo.gameCenterSummary.leaderboards.value, {isLive: true}).length;
            $scope.totalMandatoryLeaderboards = $scope.filterObject($scope.versionInfo.gameCenterSummary.leaderboards.value, {isMandatory: true}).length;

            $scope.totalAttachedAchievements = $scope.filterObject($scope.versionInfo.gameCenterSummary.achievements.value, {isAttached: true}).length;
            $scope.totalLiveAchievements = $scope.filterObject($scope.versionInfo.gameCenterSummary.achievements.value, {isLive: true}).length;
            $scope.totalMandatoryAchievements = $scope.filterObject($scope.versionInfo.gameCenterSummary.achievements.value, {isMandatory: true}).length;

            $scope.availableLeaderboardSets = $scope.listItemsToInclude($scope.versionInfo.gameCenterSummary.displaySets.value);
            $scope.availableLeaderboards = $scope.listItemsToInclude($scope.versionInfo.gameCenterSummary.leaderboards.value);
            $scope.availableAchievements = $scope.listItemsToInclude($scope.versionInfo.gameCenterSummary.achievements.value);

            // $scope.checkForRemovedGCData($scope.availableLeaderboards, $scope.versionInfo.gameCenterSummary.unapprovedLeaderboards); // TESTING

            // $scope.appsAvailableToAddToMultiplayer = $scope.getAppsAvailableToAddToMultiplayer();

            $scope.getMultiplayerCompatibilityList();

            $scope.validateGCVersionInfo();
        }

        $scope.listItemsToInclude = function(list) {
            return _.filter(list, function(listItem) {
                if (listItem.isAttached === true || listItem.isLive === true || listItem.isMandatory === true) return true;
            });
        }

        $scope.filterObject = function(object, expression) {
            var result = {};
            if (_.isObject(expression)) result = _.where(object, expression);
            return result;
        }

        $scope.setObjectProperty = function(object, property, value, callback) {
            if (callback) callback(object);
            return object[property] = value;
        }

        $scope.returnObjectWithValues = function(obj1, obj2) {
            if (obj1.length && !obj2.length) return obj1;
            else if (!obj1.length && obj2.length) return obj2;
            else if ((obj1.length && obj2.length) || (!obj1.length && !obj2.length)) return null;
        }

        $scope.appendObjects = function() {
            var newObj;
            for (var i = 0; i < arguments.length; i++) {
                newObj.push(arguments[i]);
            }

            return newObj;
        }

        /**** Some utility methods ****/

        // utitility method for moving an array elent from old_index to new_index
        Array.prototype.move = function (old_index, new_index) {
            if (new_index >= this.length) {
                var k = new_index - this.length;
                while ((k--) + 1) {
                    this.push(undefined);
                }
            }
            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
            return this; // for testing purposes
        };

        /* **************************************************
        SUBMIT FOR REVIEW FUNCTIONS
        ************************************************** */
        $scope.$on('cancellingSubmitForReview',function(){
            $scope.submitForReviewInProgress = false;
            $scope.tempPageContent.scrollnow = true;
            $scope.tempPageContent.submittingForReview = false;
        });

        //always watch for changes to submit summary and update nav accordingly
        $scope.$watch(function(){
            return univPurchaseService.submitSummaryDataSource.data
        },function(val){
            if (val !== null) {

                // this is where we update submitSummaryData!
                $scope.submitSummaryData = univPurchaseService.submitSummaryDataSource.data;

                if ($scope.startedSubmission) {
                    $scope.submitForReviewStartHelper();
                    $scope.startedSubmission = false;
                }
            }
        });

        var iOSGamesWatchUnbind = $scope.$watch(function(){
            if ($scope.submitSummaryData !== undefined && $scope.appOverviewData !== undefined) {
                return true;
            } else {
                return false;
            }
        },function(val){
            if (val) {
                // Primary or Secondary Category is Games
                var iosPlatform = _.findWhere($scope.appOverviewInfo.platforms,{'platformString':'ios'});
                var isIOSGameAppCategory,
                    isIOSGameFirstVersion,
                    iOSGamesSAPPRFT,
                    iOSGamesCountryCN;

                if (($scope.submitSummaryData.submission.primaryCategory !== undefined && $scope.submitSummaryData.submission.primaryCategory.value == 'MZGenre.Games') || ($scope.submitSummaryData.submission.secondaryCategory !== undefined && $scope.submitSummaryData.submission.secondaryCategory.value == 'MZGenre.Games')) {
                    isIOSGameAppCategory = true;
                } else {
                   isIOSGameAppCategory = false;
                }

                //Is firstiOS version
                if (iosPlatform !== undefined && iosPlatform.deliverableVersion == null && iosPlatform.inFlightVersion != null) {
                    isIOSGameFirstVersion = true;
                } else {
                    isIOSGameFirstVersion = false;
                }

                //SAPPRFT Feature Flag
                if ($scope.hasProviderFeature('SAPPRFT')) {
                    iOSGamesSAPPRFT = true;
                } else {
                    iOSGamesSAPPRFT = false;
                }

                //Country of origin CN
                if ($scope.user.countryOfOrigin == "CN") {
                    iOSGamesCountryCN = true;
                } else {
                    iOSGamesCountryCN = false;
                }

                //All checks for primary/secondary categories, first version, and SAPPRFT Flag
                if (isIOSGameAppCategory == true && isIOSGameFirstVersion == true && iOSGamesSAPPRFT == true && iOSGamesCountryCN == true) {
                   $scope.isIOSGameApp = true;
                }

                iOSGamesWatchUnbind();
            }
        });

        $scope.submitForReviewStart = function() {
            $scope.submitForReviewInProgress = true;
            $scope.startedSubmission = true;
            $scope.$emit('refreshSubmitSummary'); // causes $scope.submitSummaryData to refresh and submitForReviewStartHelper() to get called.
        }

/*      Doing this in the watch on univPurchaseService.submitSummaryDataSource.data instead
        $scope.$on('submitSummaryLoaded',function(){
            if ($scope.startedSubmission) {
                $scope.submitForReviewStartHelper();
                $scope.startedSubmission = false;
            }
        });
*/

        $scope.submitForReviewStartHelper = function() {
            var appInfoComp = $scope.isAppInfoComplete();
            var pricingInfoComp = $scope.isPricingInfoComplete();
            if (appInfoComp && pricingInfoComp) {
                $scope.submitForReview();
            } else if (!appInfoComp) {
                $scope.$emit('appInfoErrorState',true);
                $scope.tempPageContent.additionalError = $scope.l10n.interpolate('ITC.apps.validation.cannot_submit_for_review.appDetailErrors',{'appDetailsUrl':global_itc_home_url + '/app/'+ $scope.adamId +'?submitErrors=true'});
                $scope.tempPageContent.scrollnow = true;
                $scope.tempPageContent.showAdditionalError = true;
                $scope.submitForReviewInProgress = false;
            } else if (!pricingInfoComp) {
                $scope.tempPageContent.additionalError = $scope.l10n.interpolate('ITC.apps.validation.cannot_submit_for_review.pricingError',{'pricingUrl':global_itc_home_url + '/app/'+ $scope.adamId +'/pricing'});
                $scope.tempPageContent.scrollnow = true;
                $scope.tempPageContent.showAdditionalError = true;
                $scope.submitForReviewInProgress = false;
            }
        }

        $scope.submitForReview = function() {
            $scope.setIsSaving(true);
            //$scope.submitForReviewInProgress = true;
            $scope.submitForReviewAnswers = null; //reset
            univPurchaseService.submitForReviewStepOne($scope.adamId,$scope.uniqueId).then(function(data) {
                    $scope.submitForReviewInProgress = false;
                    $scope.setIsSaving(false);
                    if (data.status == "500") {
                        $scope.setIsSaving(false);
                        $scope.submitForReviewInProgress = false;
                        $scope.tempPageContent.showAdditionalError = true;
                        //$scope.tempPageContent.messageDisplaying = true;
                        $scope.tempPageContent.additionalError = $scope.l10n.interpolate('ITC.AppVersion.PageLevelErrors.ProblemDuringSave');
                        $scope.tempPageContent.scrollnow = true;
                    } else {
                        //clear status errors...
                        //check what type of JSON we got back..
                        if (data.data.versionInfo.sectionErrorKeys.length === 0) {
                            //submit for review validations went through without errors - show submit for review questions...
                            $scope.submitForReviewAnswers = data.data;

                            // get a sorted list of xc docs = this is not the place to do this.
                            var sortedByDate = _.sortBy($scope.submitForReviewAnswers.availableExportCompliances, function(xc){ return -xc.uploadDate; });
                            $scope.availableExportCompliances = _.sortBy(sortedByDate, 'status');

                            $scope.checkForAppInfoChanges();
                        } else {
                            //submit for review validations came in with errors - reload data with error keys...
                            $scope.setupPageData(data.data.versionInfo);
                            if ($scope.versionInfo.sectionErrorKeys !== undefined && $scope.versionInfo.sectionErrorKeys !== null && $scope.versionInfo.sectionErrorKeys.length > 0) {
                                //THIS SHOULD ALWAYS BE COMING IN WITH ERROR KEYS AT THIS POINT>>>>
                                //$scope.tempPageContent.messageDisplaying = true;
                                $scope.tempPageContent.contentSaved = false;
                                //$scope.tempPageContent.showSaveError = true;
                                $scope.tempPageContent.scrollnow = true;

                            }
                        }
                    }
            });
        }
        $scope.showSubmitForReviewPage = function() {
            $scope.tempPageContent.submittingForReview = true;
            $scope.modalsDisplay.submitForReviewModal.show = false;
            $scope.createAppDataSaving = false;
            $scope.tempPageContent.scrollnow = true;
            //$scope.submitForReviewAnswers = data;
            $scope.$broadcast('submittedForReview');
        }
        $scope.checkForAppInfoChanges = function() {
            $scope.changesListArray = [];
            if ($scope.submitSummaryData.deliverableDetails !== null && $scope.submitSummaryData.deliverableDetails.names !== null) {
                angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localMeta){
                    //filter out name locale from deliv. details - if it doesn't exist - this is a new locale
                    var nameset = _.filter($scope.submitSummaryData.deliverableDetails.names,function(nameset,keyset){
                        if (keyset === localMeta.localeCode) {
                            return true;
                        }
                    })
                    if (nameset.length === 0) { //could not find localization in existing localizations
                        $scope.modalsDisplay.submitForReviewModal.newLocales = true;
                        $scope.changesListArray.push($scope.l10n.interpolate('ITC.AppVersion.SubmitForReview.changedAppInfoModal.appNameChanged',{'localization':$scope.l10n.interpolate('ITC.locale.'+localMeta.localeCode.toLowerCase())}));
                    } else {
                        //found the localization - are names the same?
                        if (localMeta.name.value !== $scope.submitSummaryData.deliverableDetails.names[localMeta.localeCode]) {
                            $scope.changesListArray.push($scope.l10n.interpolate('ITC.AppVersion.SubmitForReview.changedAppInfoModal.appNameChanged',{'localization':$scope.l10n.interpolate('ITC.locale.'+localMeta.localeCode.toLowerCase())}));
                        }
                    }
                });
                //check categories...
                if ($scope.submitSummaryData.deliverableDetails.primaryCategory !== $scope.submitSummaryData.submission.primaryCategory.value || $scope.submitSummaryData.deliverableDetails.primaryFirstSubCategory !== $scope.submitSummaryData.submission.primaryFirstSubCategory.value || $scope.submitSummaryData.deliverableDetails.primarySecondSubCategory !== $scope.submitSummaryData.submission.primarySecondSubCategory.value || $scope.submitSummaryData.deliverableDetails.secondaryCategory !== $scope.submitSummaryData.submission.secondaryCategory.value || $scope.submitSummaryData.deliverableDetails.secondaryFirstSubCategory !== $scope.submitSummaryData.submission.secondaryFirstSubCategory.value || $scope.submitSummaryData.deliverableDetails.secondarySecondSubCategory !== $scope.submitSummaryData.submission.secondarySecondSubCategory.value) {
                    $scope.changesListArray.push($scope.l10n.interpolate('ITC.AppVersion.SubmitForReview.changedAppInfoModal.categoryChanged'));
                }
                if ($scope.changesListArray.length > 0) {
                    $scope.modalsDisplay.submitForReviewModal.show = true;
                } else {
                    //no changes proceed...
                    $scope.showSubmitForReviewPage();
                }
            } else {
                //ok to proceed with submit for review - app has no current deliverable details
                $scope.showSubmitForReviewPage();
            }
        }
        $scope.isAppInfoComplete = function() {
            if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData.submission.sectionErrorKeys !== null && $scope.submitSummaryData.submission.sectionErrorKeys.length > 0) {
                return false;
            } else {
                return true;
            }
        }

        $scope.isPricingInfoComplete = function() {
            if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData.hasProducts) { // all ok
                return true;
            }
            else { // all not ok
                return false;
            }
        }

        /***************************************************
        Additional Info Marketing Opt In Link
        ************************************************** */
        $scope.marketingOptInLink = function(e) {
            var link = e.target;
            if (link.id === "iapListPage") {
                $state.go('app_overview.features.addons');
            }
        };

        /***************************************************
        Validate Screened words on blur
        ************************************************** */
        $scope.checkScreenedWords = function (event, field, fieldName) {
            if (fieldName == undefined || fieldName == null) fieldName = field;
            var text = event.target.value;
            validateScreenedWordsService.validate(text, fieldName, $scope.adamId).then(function(data){
                if (!$scope.infoKeys[field]) {
                    $scope.infoKeys[field] = {};
                }
                $scope.infoKeys[field][$scope.currentLoc] = data;
            });
        }

        //copied from elswhere - not used here delete when done......
        $scope.setUpSummaryData = function(data) {
            //are there unapproved changes in app info? (submitSummary)
            //loop through localizations / name
            $scope.hasUnapprovedChanges = false;
            $scope.hasMissingData = false;
            if (data.deliverableDetails !== null && data.deliverableDetails.names !== null) {
                angular.forEach(data.deliverableDetails.names,function(value,key){
                    angular.forEach(data.submission.localizedMetadata.value,function(localMeta){
                        if (localMeta.localeCode === key && localMeta.name.value !== value) {
                            $scope.hasUnapprovedChanges = true;
                        }
                    });
                });
            }
            //check category values
            if (data.deliverableDetails !== null && (data.deliverableDetails.primaryCategory !== data.submission.primaryCategory.value || data.deliverableDetails.primaryFirstSubCategory !== data.submission.primaryFirstSubCategory.value || data.deliverableDetails.primarySecondSubCategory !== data.submission.primarySecondSubCategory.value || data.deliverableDetails.secondaryCategory !== data.submission.secondaryCategory.value || data.deliverableDetails.secondaryFirstSubCategory !== data.submission.secondaryFirstSubCategory.value || data.deliverableDetails.secondarySecondSubCategory !== data.submission.secondarySecondSubCategory.value)) {
                $scope.hasUnapprovedChanges = true;
            }
            if (data.submission.sectionErrorKeys !== null && data.submission.sectionErrorKeys.length > 0) {
                $scope.hasMissingData = true;
            }
        }

        $scope.go = function (path, param) {
            if (param) path += param;
            $location.path(path);
        };

    }

    itcApp.register.controller('appVersionInfoController', ['$scope','$location','$timeout','$rootScope','$stateParams', 'ai', 'appDetailsService','univPurchaseService','appVersionReferenceDataService','saveVersionDetailsService','saveVersionService', 'sharedProperties','linkManager','$sce', '$upload','filterFilter', '$filter','createAppVersionService', 'devRejectAppService', '$state', 'ITC', 'validateScreenedWordsService', 'gameCenterService', appVersionInfoController]);

});
