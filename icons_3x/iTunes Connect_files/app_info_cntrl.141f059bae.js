'use strict';
define(['sbl!app'], function (itcApp) {

    var appInfoController = function ($scope, $location, $timeout, $rootScope,$stateParams, $http, validateScreenedWordsService, univPurchaseService, sharedProperties,linkManager,$sce, $upload,filterFilter, $filter, createAppVersionService, devRejectAppService, $state, appDetailsService, deleteAppService) {


        /** utility... **/
        $scope.getParameterByName = function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        /***************************************************
          Validate Screened words on blur
        ************************************************** */
        $scope.checkScreenedWords = function ($event, field, fieldName) {
            if (fieldName == undefined || fieldName == null) fieldName = field;
            var text = event.target.value; 
            validateScreenedWordsService.validate(text, fieldName, $scope.adamId).then(function(data){
                if (!$scope.infoKeys[field]) {
                    $scope.infoKeys[field] = {};
                }
                $scope.infoKeys[field][$scope.currentLoc] = data;
            });
        }

        /* **************************************************
        BUNDLE ID FUNCTIONS
        ************************************************** */
        $scope.getReadOnlyBundleId = function() {
            //console.log("$scope.appInfoDetails.bundleIdSuffix "+ $scope.appInfoDetails.bundleIdSuffix)
            if ($scope.appInfoDetails !== undefined && $scope.appInfoDetails.bundleId.value !== undefined && $scope.appInfoDetails.bundleId.value !== null && $scope.appInfoDetails.bundleIdSuffix !== undefined && $scope.appInfoDetails.bundleIdSuffix !== null && $scope.appInfoDetails.bundleIdSuffix !== "" && $scope.appInfoDetails.bundleId.value.match(/.*\*/)) {
                //combined bundle id value
                return  $scope.appInfoDetails.bundleId.value.replace("*","") + $scope.appInfoDetails.bundleIdSuffix.value;
            } else if ($scope.appInfoDetails !== undefined && $scope.appInfoDetails.bundleId.value !== undefined && $scope.appInfoDetails.bundleId.value !== null && !$scope.appInfoDetails.bundleId.value.match(/.*\*/)) {
                //non wildcard bundleid returned...
                return  $scope.appInfoDetails.bundleId.value;
            } else {
                //return nothing - important values may be null
                return "";
            }
        }
        $scope.checkBundleType = function() {
            if ($scope.appInfoDetails.bundleId.value !== undefined && $scope.appInfoDetails.bundleId.value !== null && $scope.appInfoDetails.bundleId.value !== "") {
                if ($scope.appInfoDetails.bundleId.value.match(/.*\*/)) {
                    $scope.bundleIsWildcard = true;
                    //$scope.appInfoDetails.bundleIdSuffix = "";
                    $scope.bundleIdComposite = "";
                } else {
                    $scope.bundleIsWildcard = false;
                    $scope.appInfoDetails.bundleIdSuffix.value = "";
                    $scope.bundleIdComposite = $scope.appInfoDetails.bundleId.value;
                }
            } else {
                $scope.bundleIsWildcard = false;
            }
        }
        $scope.$watch('appInfoDetails.bundleIdSuffix.value',function(val){
            if ($scope.appInfoDetails !== undefined && $scope.appInfoDetails.bundleId.value !== undefined && $scope.appInfoDetails.bundleId.value !== null && $scope.appInfoDetails.bundleIdSuffix !== null && $scope.appInfoDetails.bundleIdSuffix.value !== null) {
                $scope.bundleIdComposite = $scope.appInfoDetails.bundleId.value.replace("*","") + $scope.appInfoDetails.bundleIdSuffix.value;
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
                    var origLoc = _.findWhere(origField,{"localeCode":loc.localeCode});
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
        /*//check specific fields in localization for content and server errors...
        $scope.errorCheckingLocalizations = function() {
            if ($scope.tempPageContent !== undefined) {
                $scope.tempPageContent.errorTracker = [];
                if ($scope.appInfoDetails !== undefined && $scope.appInfoDetails.localizedMetadata !== undefined && $scope.orignalVersionInfo !== undefined && $scope.appInfoDetails.localizedMetadata.value !== undefined && $scope.orignalVersionInfo.details.value !== undefined) {
                    angular.forEach($scope.appInfoDetails.localizedMetadata.value,function(loc,key){
                        var thisLocsHasErrors = false;
                        if (checkLocField(loc,"description",$scope.orignalVersionInfo.details.value,$scope.referenceData.appMetaDataReference.maxAppDescriptionChars)) {
                            thisLocsHasErrors = true;
                        }
                        //if (checkLocField(loc,"watchDescription",$scope.orignalVersionInfo.details.value,$scope.referenceData.appMetaDataReference.maxAppDescriptionChars)) {
                        //    thisLocsHasErrors = true;
                        //}
                        if (checkLocField(loc,"privacyPolicyUrl",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"privacyPolicy",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        if (checkLocField(loc,"name",$scope.orignalVersionInfo.details.value)) {
                            thisLocsHasErrors = true;
                        }
                        / *if (checkLocField(loc,"privacyPolicy",$scope.orignalVersionInfo.details.value,$scope.referenceData.appMetaDataReference.maxAppReleaseNotesChars)) {
                            thisLocsHasErrors = true;
                        }* /
                        if (thisLocsHasErrors) {
                            $scope.tempPageContent.errorTracker.push(key);
                        }
                    });
                }
            }
        }*/
        $scope.doesLocHaveError = function(locKey) {
            if ($scope.appInfoDetails !== undefined) {
                switch (locKey) {
                    case "anyloc":
                        var returnval = false;
                        angular.forEach($scope.appInfoDetails.localizedMetadata.value,function(loc){
                            if (loc.name.errorKeys !== null && loc.name.errorKeys.length > 0) {
                                returnval = true;
                            }
                            if (loc.privacyPolicy.errorKeys !== null && loc.privacyPolicy.errorKeys.length > 0) {
                                returnval = true;
                            }
                            if (loc.privacyPolicyUrl.errorKeys !== null && loc.privacyPolicyUrl.errorKeys.length > 0) {
                                returnval = true;
                            }
                        });
                        return returnval;
                        break;
                    default: 
                        if ($scope.appInfoDetails.localizedMetadata.value[locKey].name.errorKeys !== null && $scope.appInfoDetails.localizedMetadata.value[locKey].name.errorKeys.length > 0) {
                            return true;
                        }
                        if ($scope.appInfoDetails.localizedMetadata.value[locKey].privacyPolicy.errorKeys !== null && $scope.appInfoDetails.localizedMetadata.value[locKey].privacyPolicy.errorKeys.length > 0) {
                            return true;
                        }
                        if ($scope.appInfoDetails.localizedMetadata.value[locKey].privacyPolicyUrl.errorKeys !== null && $scope.appInfoDetails.localizedMetadata.value[locKey].privacyPolicyUrl.errorKeys.length > 0) {
                            return true;
                        }
                        return false;
                        break;
                }
            }
        }
        //returns the "details" key of language supplied. (or false if not present)
        $scope.getLanguageKey = function(langstring) {
            var langkey = false;
            angular.forEach($scope.appInfoDetails.localizedMetadata.value, function(value, key) {
                if (value.localeCode === langstring) {
                    langkey = key;
                }   
            });
            return langkey;
        }
        $scope.getLocaleCode = function(langkey) {
            if ($scope.appInfoDetails !== undefined) {
                return $scope.appInfoDetails.localizedMetadata.value[langkey].localeCode;
            }
        }
        $scope.getLocaleLanguage = function(locale, inSentance) {
            if (locale !== undefined) {
                if (inSentance) var localString = 'ITC.locale.'+locale.toLowerCase() + '.inSentence';
                else var localString = 'ITC.locale.'+locale.toLowerCase();
                return $scope.l10n.interpolate(localString);
            }
        }
        $scope.isCurrentPrimaryLanguage = function(langstring) {
            if ($scope.appInfoDetails.primaryLocaleCode.value == langstring) {
                return true;
            } else {
                return false;
            }
        }

        // Clear error keys on primary loc if user changes primary loc
        $scope.$watch('appInfoDetails.primaryLocaleCode.value',function(newVal, oldVal){
            if (newVal !== undefined && oldVal !== undefined) {
                if ($scope.appInfoDetails.primaryLocaleCode.errorKeys && $scope.appInfoDetails.primaryLocaleCode.errorKeys.length > 0) {
                    $scope.appInfoDetails.primaryLocaleCode.errorKeys = null;
                }
            }   
        });

        $scope.appHasLocalization = function(langstring) {
            var langexists = _.findWhere($scope.appInfoDetails.localizedMetadata.value, {localeCode: langstring});
            if (langexists !== undefined) {
                return true;
            } else {
                return false;
            }
        }
        $scope.updateNonLocalizedList = function() { //remove existing/added localizations from the available list of localization that can be addded
            $scope.nonLocalizedList = angular.copy($scope.referenceData.detailLocales);
            angular.forEach($scope.referenceData.detailLocales,function(refvalue,refkey){
                angular.forEach($scope.appInfoDetails.localizedMetadata.value,function(detailvalue,detailkey){
                    if (detailvalue && refvalue === detailvalue.localeCode) {
                        var index = $scope.nonLocalizedList.indexOf(refvalue)
                        $scope.nonLocalizedList.splice(index,1);
                    }
                });
            });
            $scope.nonLocalizedList = _.sortBy($scope.nonLocalizedList,function(lang) { 
                return $scope.getLocaleLanguage(lang);
            });
            //return $scope.nonLocalizedList;
        }
        $scope.changeLocView = function(key) {
            $scope.$emit('closepopups',true);
            $scope.currentLoc = key;
            $scope.currentLocCode = $scope.getLocaleCode(key);
        }
        $scope.addPageLanguageValues = function(versionDetailsObject) {
            angular.forEach(versionDetailsObject,function(detailvalue,key){
                versionDetailsObject[key].pageLanguageValue = $scope.referenceData.detailLocales[detailvalue.localeCode];
            });
            return versionDetailsObject;
        }
        $scope.sortDetailsByLocalization = function(versionDetailsObject) {//$scope.appInfoDetails.localizedMetadata.value
            //get primary language detail group
            var primaryLangDetail = _.findWhere(versionDetailsObject,{localeCode: $scope.appInfoDetails.primaryLocaleCode.value});
            //now (temporarily) remove this language from list before sorting
            var sortedLocalizations = _.reject(versionDetailsObject,function(item) {
                if (item.localeCode === $scope.appInfoDetails.primaryLocaleCode.value) {
                    return true;
                } else {
                    return false;
                }
            });

            sortedLocalizations = _.sortBy(sortedLocalizations,function(lang) { 
                return $scope.getLocaleLanguage(lang.localeCode);
            });
            //console.log('sortedLocalizations',sortedLocalizations)
            //add primary language to top of list
            sortedLocalizations.unshift(primaryLangDetail);
            return sortedLocalizations;
        }
        $scope.addLocalization = function(langstring) {
            var primaryLang = $scope.appInfoDetails.primaryLocaleCode.value;
            var primaryLangCopyDetail = angular.copy(_.findWhere($scope.appInfoDetails.localizedMetadata.value,{localeCode: primaryLang}));
            
            primaryLangCopyDetail.localeCode = langstring;
            primaryLangCopyDetail.canDeleteLocale = true;

            //add to versioninfo
            $scope.appInfoDetails.localizedMetadata.value.unshift(primaryLangCopyDetail);
            $scope.appInfoDetails.localizedMetadata.value = $scope.addPageLanguageValues($scope.appInfoDetails.localizedMetadata.value);
            $scope.appInfoDetails.localizedMetadata.value = $scope.sortDetailsByLocalization($scope.appInfoDetails.localizedMetadata.value);
            $scope.updateNonLocalizedList();
            $scope.changeLocView($scope.getLanguageKey(langstring));
            $scope.tempPageContent.appLocScrollTop = true;
        }

        $scope.removeLoc = function(key) {
            var tempcurlang = $scope.appInfoDetails.localizedMetadata.value[$scope.currentLoc].localeCode;
            $scope.appInfoDetails.localizedMetadata.value.splice(key,1);
            if(key == $scope.currentLoc) {
                $scope.currentLoc = $scope.getLanguageKey($scope.appInfoDetails.primaryLocaleCode.value);
                $scope.currentLocCode = $scope.appInfoDetails.primaryLocaleCode.value;
            } else {
                $scope.currentLoc = $scope.getLanguageKey(tempcurlang);
                $scope.currentLocCode = tempcurlang;
            }
            $scope.updateNonLocalizedList();
            //remove if in availablePrimaryLocaleCodes
            var index = $scope.appInfoDetails.availablePrimaryLocaleCodes.indexOf(tempcurlang);
            if (index >= 0) {
                $scope.appInfoDetails.availablePrimaryLocaleCodes.splice(index,1);
            }
            $scope.tempPageContent.appLocScrollTop = true;
            $scope.tempPageContent.showConfirmRemoveLoc = false;
        }
        $scope.confirmRemoveLoc = function(key) {
            var language = $scope.getLocaleLanguage($scope.getLocaleCode(key), true);

            $scope.tempPageContent.confirmRemoveLocFor = key;
            $scope.tempPageContent.confirmRemoveLocHeader = $scope.l10n.interpolate('ITC.AppInformation.ConfirmLocRemoval.Header',{'localization':language}, true);
            $scope.tempPageContent.confirmRemoveLocText = $scope.l10n.interpolate('ITC.AppInformation.ConfirmLocRemoval.Text',{'localization':language});
            $scope.tempPageContent.showConfirmRemoveLoc = true;
        }

        /* **************************************************
        Rating Functions
        ************************************************** */
        
        $scope.updateBrazilRating = function() {
            if ($scope.appInfoDetails.countryRatings !== null && $scope.appInfoDetails.countryRatings !== undefined) {
                $scope.brazilClass = $filter('brazilRatingClass')($scope.appInfoDetails.countryRatings.BR);
            }
        }

        /* **************************************************
        Change Highlighting
        ************************************************** */
        $scope.shouldShowHighlight = function(loc,field) { //currentLoc,'name'
            if ($scope.appInfoDetails !== undefined && $scope.submitSummaryData !== undefined && $scope.appInfoDetails !== null && $scope.submitSummaryData !== null) {
                switch(field) {
                    case 'name':
                        if (loc !== undefined) {
                            if ($scope.submitSummaryData.deliverableDetails !== null && $scope.appInfoDetails.localizedMetadata.value[loc].name.value !== $scope.submitSummaryData.deliverableDetails.names[$scope.getLocaleCode(loc)]) {
                                $scope.previousNameValue = $scope.submitSummaryData.deliverableDetails.names[$scope.getLocaleCode(loc)];
                                return true;
                            } else {
                                return false;
                            }
                        }
                        break;
                    case 'privacyURL':
                        if (loc !== undefined) {
                            if ($scope.originalValuesAppInfoDetails.localizedMetadata.value[loc] !== undefined && $scope.appInfoDetails.localizedMetadata.value[loc].privacyPolicyUrl.value !== $scope.originalValuesAppInfoDetails.localizedMetadata.value[loc].privacyPolicyUrl.value && $scope.hasLiveApp()) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        break;
       
                    case 'appletvprivacy':
                        if (loc !== undefined) {
                            if ($scope.originalValuesAppInfoDetails.localizedMetadata.value[loc] !== undefined && $scope.appInfoDetails.localizedMetadata.value[loc].privacyPolicy.value !== $scope.originalValuesAppInfoDetails.localizedMetadata.value[loc].privacyPolicy.value && $scope.hasLiveApp()) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        break;
                
                    case 'primaryLang':
                        if ($scope.appInfoDetails.primaryLocaleCode.value !== $scope.originalValuesAppInfoDetails.primaryLocaleCode.value && $scope.hasLiveApp()) {
                            return true;
                        } else {
                            return false;
                        }
                        break;
                    case 'category':
                    //$scope.appInfoDetails.primaryCategory.value !== $scope.originalValuesAppInfoDetails.primaryCategory.value || $scope.appInfoDetails.primaryFirstSubCategory.value !== $scope.originalValuesAppInfoDetails.primaryFirstSubCategory.value || $scope.appInfoDetails.primarySecondSubCategory.value !== $scope.originalValuesAppInfoDetails.primarySecondSubCategory.value || $scope.appInfoDetails.secondaryCategory.value !== $scope.originalValuesAppInfoDetails.secondaryCategory.value || $scope.appInfoDetails.secondaryFirstSubCategory.value !== $scope.originalValuesAppInfoDetails.secondaryFirstSubCategory.value || $scope.appInfoDetails.secondarySecondSubCategory.value !== $scope.originalValuesAppInfoDetails.secondarySecondSubCategory.value ||
                        if ($scope.submitSummaryData.deliverableDetails !== null && ($scope.appInfoDetails.primaryCategory.value !== $scope.submitSummaryData.deliverableDetails.primaryCategory || $scope.appInfoDetails.primaryFirstSubCategory.value !== $scope.submitSummaryData.deliverableDetails.primaryFirstSubCategory || $scope.appInfoDetails.primarySecondSubCategory.value !== $scope.submitSummaryData.deliverableDetails.primarySecondSubCategory || $scope.appInfoDetails.secondaryCategory.value !== $scope.submitSummaryData.deliverableDetails.secondaryCategory || $scope.appInfoDetails.secondaryFirstSubCategory.value !== $scope.submitSummaryData.deliverableDetails.secondaryFirstSubCategory || $scope.appInfoDetails.secondarySecondSubCategory.value !== $scope.submitSummaryData.deliverableDetails.secondarySecondSubCategory) && $scope.hasLiveApp()) {
                            return true;
                        } else {
                            return false;
                        }
                        break;
                    case 'eula':
                        if ($scope.appInfoDetails.license.EULAText !== $scope.origAppInfoDetails.license.EULAText && $scope.hasLiveApp()) {
                            return true;
                        } else {
                            return false;
                        }
                        break;
                    case 'rating':
                        return $scope.hasLiveApp() && $scope.appInfoDetails.rating !== $scope.submitSummaryData.deliverableDetails.rating;
                }
            }
        }
        $scope.hasLiveApp = function() {
            var hasLive = false;
            angular.forEach($scope.appOverviewInfo.platforms,function(platform){
                if(platform.deliverableVersion !== null) {
                    hasLive = true;
                }
            });
            return hasLive;
        }
        

        /* **************************************************
        Category / Sub Category Functions
        ************************************************** */
        $scope.determinePrivacyPolicyPlaceholder = function(currentLoc) {
             if ($scope.l10n !== undefined && $scope.appInfoDetails !== undefined && $scope.submitSummaryData !== undefined && currentLoc !== undefined && currentLoc !== null) {
                //get submit summary localizedmetadata for current loc
                var currentLocSummaryMetadata = _.findWhere($scope.submitSummaryData.submission.localizedMetadata.value, {'localeCode': $scope.appInfoDetails.localizedMetadata.value[currentLoc].localeCode});
                /*if (($scope.appInfoDetails.ageBandMinAge === undefined || $scope.appInfoDetails.ageBandMinAge === null) && $scope.appInfoDetails.localizedMetadata.value[currentLoc].privacyPolicyUrl.isRequired === false && $scope.hideIfNullAndNotEditable($scope.appInfoDetails.localizedMetadata.value[currentLoc].privacyPolicy)) {*/
                if (currentLocSummaryMetadata !== undefined && !currentLocSummaryMetadata.privacyPolicyUrl.isRequired) {
                    return $scope.l10n.interpolate('ITC.AppVersion.LocalizedSection.UrlPlaceholderOptional');
                } else {
                    return $scope.l10n.interpolate('ITC.AppVersion.LocalizedSection.UrlPlaceholder');
                }
            }
        }
        $scope.updateCategoryViews = function() {
            $scope.tempPageContent.showPrimarySubcats = false
            $scope.tempPageContent.showSecondarySubCats = false;
            $scope.secondaryCategoryList = [];

            $scope.primaryFirstSubCategoryList = [];
            $scope.primarySecondSubCategoryList = [];

            $scope.secondaryFirstSubCategoryList = [];
            $scope.secondarySecondSubCategoryList = [];
            

            if($scope.appInfoDetails.primaryCategory.value === $scope.appInfoDetails.secondaryCategory.value) {
                //if primary category matches secondary category - set secondary to null - they can not be the same. Primary takes precedence
                $scope.appInfoDetails.secondaryCategory.value = null;
            }

            if($scope.appInfoDetails.primaryCategory != null && $scope.appInfoDetails.primaryCategory.value != null) {
                //if we have a primary category value - remove it from the options for secondary catgeory
                $scope.secondaryCategoryList = _.without($scope.categoryList,$scope.appInfoDetails.primaryCategory.value);
            } else {
                //otherwise show the full list to both
                $scope.secondaryCategoryList = $scope.categoryList;
            }

            //check currently selected primary and secondary categories - determine if they have subcats
            if ($scope.appInfoDetails.primaryCategory != null && $scope.appInfoDetails.primaryCategory.value != null && $scope.referenceData.subGenreMap[$scope.appInfoDetails.primaryCategory.value].length > 0) {
                //if we have a primary category value and it has subcats - grab subcats - show primary subcats
                $scope.tempPageContent.showPrimarySubcats = true;
                $scope.primaryFirstSubCategoryList = $scope.referenceData.subGenreMap[$scope.appInfoDetails.primaryCategory.value];
            } else {
                //otherwise - no subcats for primary cat - hide primary subcats - and set values to null
                $scope.appInfoDetails.primaryFirstSubCategory.value = null;
                $scope.appInfoDetails.primarySecondSubCategory.value = null;
                $scope.tempPageContent.showPrimarySubcats = false;
            }

            //if (!$scope.appInfoDetails.newsstand.isEnabled) {
                //non-newsstand logic...
                if ($scope.appInfoDetails.secondaryCategory != null && $scope.appInfoDetails.secondaryCategory.value != null && $scope.referenceData.subGenreMap[$scope.appInfoDetails.secondaryCategory.value].length > 0) {
                    //if we have a value for secondary cat and it has sub cats - grab subcats - show secondary sub cats
                    $scope.tempPageContent.showSecondarySubCats = true;
                    $scope.secondaryFirstSubCategoryList = $scope.referenceData.subGenreMap[$scope.appInfoDetails.secondaryCategory.value];
                } else {
                    //otherwise - no subcats for secondary cat - hide primary subcats - and set values to null
                    $scope.appInfoDetails.secondaryFirstSubCategory.value = null;
                    $scope.appInfoDetails.secondarySecondSubCategory.value = null;
                    $scope.tempPageContent.showSecondarySubCats = false;
                }
            /*} else {
                $scope.secondaryFirstSubCategoryList = $scope.referenceData.subGenreMap['MZGenre.Apps.Newsstand'];
                if($scope.appInfoDetails.secondaryFirstSubCategory != null && $scope.appInfoDetails.secondaryFirstSubCategory.value != null) {
                    //if we have a primary category value - remove it from the options for secondary catgeory
                    $scope.secondarySecondSubCategoryList = _.without($scope.secondaryFirstSubCategoryList,$scope.appInfoDetails.secondaryFirstSubCategory.value);
                } else {
                    //otherwise show the full list to both
                    $scope.secondarySecondSubCategoryList = $scope.secondaryFirstSubCategoryList;
                }
            }*/

            // **** Subcategory lists (Primary)
            if($scope.appInfoDetails.primaryFirstSubCategory.value === $scope.appInfoDetails.primarySecondSubCategory.value) {
                //if primary first sub category matches primary second sub category - set second to null - they can not be the same. first takes precedence
                $scope.appInfoDetails.primarySecondSubCategory.value = null;
            }
            //check if primary first sub cat has a value - and if so remove it from the list for primary second sub cat list...
            if ($scope.appInfoDetails.primaryFirstSubCategory != null && $scope.appInfoDetails.primaryFirstSubCategory.value != null) {
                $scope.primarySecondSubCategoryList = _.without($scope.primaryFirstSubCategoryList,$scope.appInfoDetails.primaryFirstSubCategory.value);
            } else {
                //otherwise show the full list
                $scope.primarySecondSubCategoryList = $scope.primaryFirstSubCategoryList;
            }

            // **** Subcategory lists (Secondary)
            if($scope.appInfoDetails.secondaryFirstSubCategory.value === $scope.appInfoDetails.secondarySecondSubCategory.value) {
                //if secondary first sub category matches secondary second sub category - set second to null - they can not be the same. first takes precedence
                $scope.appInfoDetails.secondarySecondSubCategory.value = null;
            }
            //check if secondary first sub cat has a value - and if so remove it from the list for secondary second sub cat list...
            if ($scope.appInfoDetails.secondaryFirstSubCategory != null && $scope.appInfoDetails.secondaryFirstSubCategory.value != null) {
                $scope.secondarySecondSubCategoryList = _.without($scope.secondaryFirstSubCategoryList,$scope.appInfoDetails.secondaryFirstSubCategory.value);
            } else {
                //otherwise show the full list
                $scope.secondarySecondSubCategoryList = $scope.secondaryFirstSubCategoryList;
            }

            //alpha sort localized category lists

            $scope.categoryList = _.sortBy($scope.categoryList,function(cat) {
                if ($scope.l10n && $scope.l10n.interpolate) {
                    return $scope.l10n.interpolate(cat);
                }
            });
            if ($scope.primaryFirstSubCategoryList !== "" && $scope.primaryFirstSubCategoryList.length > 0) {
                $scope.primaryFirstSubCategoryList = _.sortBy($scope.primaryFirstSubCategoryList,function(cat) {
                    if ($scope.l10n && $scope.l10n.interpolate) {
                        return $scope.l10n.interpolate(cat);
                    }
                }); 
            }
            if ($scope.primarySecondSubCategoryList !== "" && $scope.primarySecondSubCategoryList.length > 0) {
                $scope.primarySecondSubCategoryList = _.sortBy($scope.primarySecondSubCategoryList,function(cat) {
                    if ($scope.l10n && $scope.l10n.interpolate) {
                        return $scope.l10n.interpolate(cat);
                    }
                }); 
            }
            $scope.secondaryCategoryList = _.sortBy($scope.secondaryCategoryList,function(cat) {
                if ($scope.l10n && $scope.l10n.interpolate) {
                    return $scope.l10n.interpolate(cat);
                }
            }); 
            if ($scope.secondaryFirstSubCategoryList !== "" && $scope.secondaryFirstSubCategoryList.length > 0) {
                $scope.secondaryFirstSubCategoryList = _.sortBy($scope.secondaryFirstSubCategoryList,function(cat) {
                    if ($scope.l10n && $scope.l10n.interpolate) {
                        return $scope.l10n.interpolate(cat);
                    }
                }); 
            }
            if ($scope.secondarySecondSubCategoryList !== "" && $scope.secondarySecondSubCategoryList.length > 0) {
                $scope.secondarySecondSubCategoryList = _.sortBy($scope.secondarySecondSubCategoryList,function(cat) {
                    if ($scope.l10n && $scope.l10n.interpolate) {
                        return $scope.l10n.interpolate(cat);
                    }
                }); 
            }
        }

        /* **************************************************
        EULA Functions
        ************************************************** */
        $scope.showEulaModal = function() {
            $scope.closingeulamodal = false;
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = true;
            $scope.tempEula = angular.copy($scope.appInfoDetails.license);
            $scope.tempPageContent.eulaModal.standardEula = $scope.tempPageContent.standardEula;
            $scope.tempEulaCopy = angular.copy($scope.tempEula);
            $scope.gatherTerritoriesList();
            $scope.getEulaTerritories();
            $scope.checkCanSaveEulaModal();
            $scope.modalsDisplay.eulaModal = true;
        }

        $scope.$watch('tempPageContent.eulaModal.customEula',function(newVal){
            if (newVal !== undefined) {
               $scope.changeModalHeight("eulaModal", true);
            }   
        });

        // Called when the Eula modal shows.
        $scope.onEulaShow = function() {
            $scope.changeModalHeightAsync("eulaModal");
        }

        // Changes the given modal's max-height by summing it's content's heights.
        $scope.changeModalHeightAsync = function(modalID) {
            $timeout(function() { // timeout because on first show, the hidden elements are not yet hidden
                $scope.changeModalHeight(modalID, false);
            });
        }   

        $scope.changeModalHeight = function(modalID, withTransition) {
            var el = $(document).find("#" + modalID); 
            if (el.is(':visible') || $scope.closingeulamodal) {
                var paddingTopBottom = parseInt(el.css( "paddingTop" )) + parseInt(el.css( "paddingBottom" ));
                var h = el.height();

                var c;
                var total = 0;
                for (var i=0; i<el.children().length; i++) {
                    c = el.children().eq(i);
                    if (c.hasClass("ng-hide")) {
                        continue;
                    }
                    total += c.outerHeight(true); // count the margin/padding/border
                }
                if (!withTransition) {
                    el.css("max-height", (total+paddingTopBottom) + "px");
                }
                else {
                    el.addClass("withTransition");
                    el.css("max-height", (total+paddingTopBottom) + "px");
                    $timeout(function(){
                        el.removeClass("withTransition");
                    }, 300); // remove the transition class after the transition has ended.
                } 
            }
        }

        $scope.closeEulaModal = function(shouldSave) {
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            if (shouldSave) {
                $scope.appInfoDetails.license = $scope.tempEula;

                if($scope.tempPageContent.eulaModal.standardEula === "true") {
                    $scope.appInfoDetails.license.EULAText = null;
                    $scope.appInfoDetails.license.countries = [];
                }
                $scope.updateEULAInfo();
            } else {
                $scope.tempEula = {};
            }
            $scope.updateEULAInfo();
            //reset data
            $scope.closingeulamodal = true;
            $scope.tempPageContent.eulaModal.standardEula = $scope.tempPageContent.standardEula;
            $scope.modalsDisplay.eulaModal = false;
        }
        $scope.updateEULAInfo = function() {
            //set if using standard or custom EULA
            $scope.tempPageContent.standardEula = "true"; //will convert to boolean when needed...
            if ($scope.appInfoDetails.license !== null && $scope.appInfoDetails.license.EULAText != null) {
                $scope.tempPageContent.standardEula = "false"; 
            }
            $scope.checkCanSaveEulaModal();
        }
        $scope.gatherTerritoriesList = function() {
            //create object list: {'territory':'U.S.','isEnabled':'true/false'}
            $scope.territoryEulaList = []; //start empty
            angular.forEach($scope.referenceData.contactCountries,function(value,key){
                //is this territory in versionInfo?
                var isEula = false;
                if (jQuery.inArray(value, $scope.appInfoDetails.license.countries) >= 0) {
                    isEula = true;
                }
               $scope.territoryEulaList.push({'territory':value,'isSelected':isEula}) 
            });
            $scope.tempPageContent.eulaModal.showSelected = false;
        }
        $scope.getEulaTerritories = function() {
            $scope.isSelectedList = _.where($scope.territoryEulaList, {"isSelected":true});
            if ($scope.isSelectedList !== undefined && $scope.isSelectedList.length > 0) {
                $scope.tempPageContent.showTerritoryList = true;
            } else {
                $scope.tempPageContent.showTerritoryList = false;
            }
        }
        $scope.$watch('isSelectedList',function(){
            if ($scope.isSelectedList != undefined) {
                $scope.tempEula.countries = [];
                angular.forEach($scope.isSelectedList,function(value,key){
                    $scope.tempEula.countries.push(value.territory);
                });
                $scope.getTerritoryCount();
                $scope.checkCanSaveEulaModal();
            }   
        });
        $scope.$watch('tempPageContent.eulaModal.standardEula',function(){
            if ($scope.tempPageContent !== undefined) {
                if ($scope.tempPageContent.eulaModal.standardEula === 'true') {
                    $scope.tempPageContent.eulaModal.customEula = false;
                } else {
                    $scope.tempPageContent.eulaModal.customEula = true;
                }
                $scope.checkCanSaveEulaModal();
            }
        });
        $scope.$watch('tempEula.EULAText',function(){
            $scope.checkCanSaveEulaModal();
        });
        $scope.getTerritoryCount = function() {
            if ($scope.tempEula.countries != undefined && $scope.referenceData.contactCountries != undefined && $scope.tempEula.countries.length > 0) {
                $scope.tempPageContent.eulaModal.territoryCount = $scope.l10n.interpolate('ITC.AppVersion.EULAModal.TerritoryLabel.TerritoryCount', {'selected':$scope.tempEula.countries.length,'total':$scope.referenceData.contactCountries.length});
            } else {
                $scope.tempPageContent.eulaModal.territoryCount = "";
            }
        }
        $scope.checkCanSaveEulaModal = function() { //$scope.tempPageContent.eulaModal.standardEula = $scope.tempPageContent.standardEula;
            if ($scope.tempPageContent !== undefined) {
                $scope.tempPageContent.canSaveEulaModal = false;
                if (angular.toJson($scope.tempEulaCopy) !== angular.toJson($scope.tempEula) || $scope.tempPageContent.standardEula !== $scope.tempPageContent.eulaModal.standardEula) {
                    if ($scope.tempPageContent.eulaModal.standardEula === "true") {
                        $scope.tempPageContent.canSaveEulaModal =  true;
                    } else if ($scope.tempEula != undefined && $scope.tempEula.EULAText != null && $scope.tempEula.EULAText != "" && $scope.tempEula.countries.length > 0) {
                        $scope.tempPageContent.canSaveEulaModal =  true;
                    }
                }
            }
        }

        $scope.runMessageManager = function() {
            $scope.showWarning = false;
            $scope.showError = false;
            $scope.showInfo = false;
            if ($scope.appInfoDetails !== undefined) {
            //show error
                if ($scope.tempPageContent.showAdditionalError || ($scope.appInfoDetails.sectionErrorKeys && $scope.appInfoDetails.sectionErrorKeys.length > 0)) {
                    $scope.showError = true;

                //show warning
                } else if (($scope.getParameterByName('submitErrors') === "true" || $state.current.name === 'app_overview.store.appinfo.errorstate') && $scope.submitSummaryData.submission.sectionErrorKeys.length > 0) {
                    $scope.showWarning = true;

                //show info    
                } else if ($scope.appInfoDetails.sectionInfoKeys && $scope.appInfoDetails.sectionInfoKeys.length > 0) {
                    $scope.showInfo = true;
                }
            }
        }

        /* **************************************************
        Button Watchers
        ************************************************** */
        $scope.$watch('appInfoDetails',function(){
            $scope.shouldSaveEnabled();
            $scope.runMessageManager();
        },true);
        $scope.shouldSaveEnabled = function() {
            if (angular.toJson($scope.appInfoDetails) !== angular.toJson($scope.origAppInfoDetails) || $scope.tempPageContent.saveAttemptFailed) {
                $scope.enableSaveButton = true;
                $scope.tempPageContent.showSaveConfirm = false;
                $scope.tempPageContent.confirmLeave.needToConfirm = true;
            } else {
                $scope.enableSaveButton = false;
                $scope.tempPageContent.confirmLeave.needToConfirm = false;
            }
        }

        /* **************************************************
        Helper Functions
        ************************************************** */
        $scope.hideIfNullAndNotEditable = function(field) {
            if (field !== undefined && field !== null) {
                if (field.isEditable === false && field.value === null) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        /* **************************************************
        Save Function
        ************************************************** */
        $scope.saveAppInfoDetails = function() {
            //$scope.tempPageContent.userReadyToSave = true;
            $scope.saveInProgress = true;
            $scope.setIsSaving(true);           
            univPurchaseService.updateAppInfo($scope.adamId,$scope.appInfoDetails).then(function(data) {
                //console.log("DATA RETURNED...", data)
                if (data.status == "500") {
                    $scope.setIsSaving(false);
                    $scope.saveInProgress = false;
                    $scope.tempPageContent.showAdditionalError = true;
                    $scope.tempPageContent.additionalError = $scope.l10n.interpolate('ITC.AppVersion.PageLevelErrors.ProblemDuringSave');
                    $scope.tempPageContent.scrollnow = true;
                } else {
                    //console.log("tried to save version details");
                    //console.log(data);
                    //check for errors...
                    $scope.tempPageContent.showAdditionalError = false;// reset
                     //but may not have gone through - sectionErrorKeys will indicate status
                    //section error key check done in setupPageData...

                    $scope.submitSummaryLoaded = false;
                    $scope.overviewLoaded = false;
                    $scope.$emit('refreshSubmitSummary');
                    $scope.$emit('reloadoverview');
                    
                    //mark as done saving from which event comes up last...
                    $scope.$on('submitSummaryLoaded',function(){
                        $scope.submitSummaryLoaded = true;
                        if ($scope.overviewLoaded === true) {
                            $scope.tempPageContent.contentSaved = true;
                            $scope.setupPageData(data.data);
                        }
                    });
                    $scope.$on('overviewLoaded',function(){
                        $scope.overviewLoaded = true;
                        if ($scope.submitSummaryLoaded === true) {
                            $scope.tempPageContent.contentSaved = true;
                            $scope.setupPageData(data.data);
                        }
                    });
                }
            });
        };

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
        $scope.confirmLeaveModalFunctions.stayOnPage = function() {
            $scope.tempPageContent.confirmLeave.userIsLeavingTO = "";
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = false;
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModalSml = false;
        }
        $scope.confirmLeaveModalFunctions.saveChanges = function() {
            $scope.tempPageContent.confirmLeave.showConfirmLeaveModal = false;
            $scope.saveAppInfoDetails();
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
        Main page load / init functions
        ************************************************** */
        $scope.setIsReady = function() {
            if ($scope.parentScopeLoaded && $scope.AppOverviewLoaded) { // && $scope.appInfoloaded) {
                $rootScope.isReady = true;
            } else {
                $rootScope.isReady = false;
            }
            if ($scope.appInfoloaded) {
                $scope.appInfoIsLoading = false;
            } else {
                $scope.appInfoIsLoading = true;
            }
        }
        $scope.loadAppInfoDetails = function() {
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
                            $scope.setupPageData(data.data);
                            unbindwatch_loadAppInfoDetails();
                        }
                    });
                }
            });
        }
        $scope.checkLockedState = function() {
            $scope.isLocked = false;
            $scope.lockedMessage = "";
            angular.forEach($scope.appOverviewData.platforms,function(platform){
                var apptype = $scope.l10n.interpolate("ITC.AppVersion.HeaderTitlePlatform."+platform.platformString);
                if (platform.deliverableVersion !== null && platform.deliverableVersion.state === 'inReview') {
                    $scope.isLocked = true;
                    $scope.lockedMessage = $scope.l10n.interpolate('ITC.AppInfo.LockedMessage.InReview',{'app_type': apptype, 'app_version': platform.deliverableVersion.version});
                }
                if (platform.inFlightVersion !== null && platform.inFlightVersion.state === 'inReview') {
                    $scope.isLocked = true;
                    $scope.lockedMessage = $scope.l10n.interpolate('ITC.AppInfo.LockedMessage.InReview',{'app_type': apptype, 'app_version': platform.inFlightVersion.version});
                }
            });
            var inflightExists = false;
            if (!$scope.isLocked) { //if not already locked
                angular.forEach($scope.appOverviewData.platforms,function(platform) {
                    if (platform.inFlightVersion !== null) {
                        inflightExists = true;
                    }
                });
                if (!inflightExists) {
                    $scope.isLocked = true;
                    $scope.lockedMessage = $scope.l10n.interpolate("ITC.AppInfo.LockedMessage.noInFlight");
                }
            }
            if ($scope.isLocked) $scope.lockedClass="locked";
        }
        $scope.checkFieldWarning = function(field,locale) {
            switch (field) {
                case "category":
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        if ($scope.submitSummaryData.submission.primaryCategory.errorKeys !== null && $scope.submitSummaryData.submission.primaryCategory.errorKeys.length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    break;
            
                case "privacyPolicy":
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null && locale !== undefined) {
                        var returnVal = false;
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.localeCode === locale && localeData.privacyPolicy.errorKeys.length > 0) {
                                returnVal = true;
                            }
                        })
                        return returnVal;
                    }
                    break;

                case "privacyPolicyUrl":
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null && locale !== undefined) {
                        var returnVal = false;
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.localeCode === locale && localeData.privacyPolicyUrl.errorKeys.length > 0) {
                                returnVal = true;
                            }
                        })
                        return returnVal;
                    }
                    break;
                case "checkAll": //check all fields withing a single locale
                    if ($scope.doesLocHaveError(locale)) {
                        return false; //show error if there are - and hide warning
                    }
                    var returnVal = false;
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        var returnVal = false;
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.localeCode === $scope.getLocaleCode(locale) && localeData.privacyPolicy.errorKeys.length > 0) {
                                returnVal = true;
                            }
                            if (localeData.localeCode === $scope.getLocaleCode(locale) && localeData.privacyPolicyUrl.errorKeys.length > 0) {
                                returnVal = true;
                            }
                        })
                    }
                    return returnVal;
                    break;
                case "anyLoc": //check all fields in all locales
                    if ($scope.doesLocHaveError("anyloc")) {
                        return false; //show error if there are - and hide warning
                    }
                    var returnVal = false;
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.privacyPolicy.errorKeys.length > 0) {
                                returnVal = true;
                            }
                        })
                    }
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.privacyPolicyUrl.errorKeys.length > 0) {
                                returnVal = true;
                            }
                        })
                    }
                    return returnVal;
                    break;
            }
        }
        $scope.getFieldWarning = function(field,locale) {
            switch (field) {
                case "category":
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        if ($scope.submitSummaryData.submission.primaryCategory.errorKeys !== null && $scope.submitSummaryData.submission.primaryCategory.errorKeys.length > 0) {
                            return $scope.submitSummaryData.submission.primaryCategory.errorKeys;
                        } else {
                            return false;
                        }
                    }
                    break;
                case "privacyPolicy":
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null && locale !== undefined) {
                        var returnVal = [];
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.localeCode === locale && localeData.privacyPolicy.errorKeys.length > 0) {
                                returnVal = returnVal.concat(localeData.privacyPolicy.errorKeys);
                            }
                        })
                        return returnVal;
                    }
                    break;
                case "privacyPolicyUrl":
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null && locale !== undefined) {
                        var returnVal = [];
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.localeCode === locale && localeData.privacyPolicyUrl.errorKeys.length > 0) {
                                returnVal = returnVal.concat(localeData.privacyPolicyUrl.errorKeys);
                            }
                        })
                        return returnVal;
                    }
                    break;
                case "checkAll": //check all fields withing a single locale
                    if ($scope.doesLocHaveError(locale)) {
                        return false; //show error if there are - and hide warning
                    }
                    var returnVal = [];
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.localeCode === $scope.getLocaleCode(locale) && localeData.privacyPolicy.errorKeys.length > 0) {
                                returnVal.push(localeData.privacyPolicy.errorKeys);
                            }
                            if (localeData.localeCode === $scope.getLocaleCode(locale) && localeData.privacyPolicyUrl.errorKeys.length > 0) {
                                returnVal.push(localeData.privacyPolicyUrl.errorKeys);
                            }
                        })
                    }
                    return returnVal;
                    break;
                case "anyLoc": //check all fields in all locales
                    if ($scope.doesLocHaveError("anyloc")) {
                        return false; //show error if there are - and hide warning
                    }
                    var returnVal = [];
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.privacyPolicy.errorKeys.length > 0) {
                                returnVal.push(localeData.privacyPolicy.errorKeys);
                            }
                        })
                    }
                    if ($scope.submitSummaryData !== undefined && $scope.submitSummaryData !== null) {
                        angular.forEach($scope.submitSummaryData.submission.localizedMetadata.value,function(localeData){
                            if (localeData.privacyPolicyUrl.errorKeys.length > 0) {
                                returnVal.push(localeData.privacyPolicyUrl.errorKeys);
                            }
                        })
                    }
                    return returnVal;
                    break;
            }
        }
        $scope.setupPageData = function(data) {

            //reset any error messaging in nav:
            $scope.$emit('appInfoErrorState',false);
            $scope.infoKeys = {}; //store for client side validation info keys
            $scope.appInfoDetails = data;
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
            $scope.checkBundleType();
            
            //which category set to use?
            $scope.tempPageContent.isIOS = false;
            $scope.tempPageContent.isMac = false;
            $scope.tempPageContent.isTVOSonly = true;
            angular.forEach($scope.appOverviewData.platforms,function(platform){
                if (platform.platformString === "osx") {
                    $scope.tempPageContent.isMac = true;
                    $scope.tempPageContent.isTVOSonly = false;
                }
                if (platform.platformString === "ios") {
                    $scope.tempPageContent.isTVOSonly = false;
                }
            });

            //Additional Info Content
            $scope.showAppTransfer = _.indexOf($scope.appOverviewData.features,'APPTRANSFER') >= 0 ? true: false;
            $scope.showDeleteApp = _.indexOf($scope.appOverviewData.features,'DELETE') >= 0 ? true: false;
            $scope.showBundleLink = _.indexOf($scope.appOverviewData.features,'APPBUNDLES') >= 0 ? true: false;
            if (!$scope.tempPageContent.isMac) {
                $scope.tempPageContent.isIOS = true;
            }
            
            if ($scope.tempPageContent.isIOS) {
                $scope.categoryList = $scope.referenceData.iosgenres;
            } else if ($scope.tempPageContent.isMac) {
                $scope.categoryList = $scope.referenceData.macOSGenres;
            } else { //default all else to ios genres
                $scope.categoryList = $scope.referenceData.iosgenres;
            }

            $scope.updateCategoryViews();

            $scope.updateEULAInfo();

            //remove used localizations from the list of localization that can be added
            $scope.updateNonLocalizedList();
            $scope.appInfoDetails.localizedMetadata.value = $scope.sortDetailsByLocalization($scope.appInfoDetails.localizedMetadata.value);

            if ($scope.currentLocCode === undefined) {
                $scope.currentLocCode = $scope.appInfoDetails.primaryLocaleCode.value;
                $scope.currentLoc = $scope.getLanguageKey($scope.appInfoDetails.primaryLocaleCode.value);
            } else {
                $scope.currentLoc = $scope.getLanguageKey($scope.currentLocCode);
            }

            //var previousLoc = $scope.currentLoc;
            $scope.primaryLangKey = $scope.getLanguageKey($scope.appInfoDetails.primaryLocaleCode.value);
            /*if ($scope.currentLoc === undefined) { // don't set the currentLoc unless it hasn't been set yet    
                $scope.currentLoc = $scope.primaryLangKey;
            }*/

            //alpha sort primary localization selector
            $scope.appInfoDetails.availablePrimaryLocaleCodes = _.sortBy($scope.appInfoDetails.availablePrimaryLocaleCodes,function(lang){
                return $scope.getLocaleLanguage(lang);
            });

            //alpha sort bundle id in dropdown
            $scope.appInfoDetails.availableBundleIds = _.sortBy($scope.appInfoDetails.availableBundleIds,function(bundleid){
                return bundleid.name;
            });

            //is app info in locked state - also set message
            $scope.checkLockedState();

            if ($scope.appInfoDetails.sectionErrorKeys.length === 0 || $scope.originalValuesAppInfoDetails === undefined) {
                $scope.originalValuesAppInfoDetails = angular.copy($scope.appInfoDetails);
                //only set this if there are no errors or we haven't already set it.
            }

            $scope.origAppInfoDetails = angular.copy($scope.appInfoDetails);
            $scope.updateBrazilRating();
            $scope.setIsSaving(false);
            $scope.saveInProgress = false;
            $scope.setIsReady();
        }
        /* **************************************************
        BUNDLE LIST MODAL
        ************************************************** */
        $scope.showAppInBundles = function() {
            $scope.$emit('closepopups',true);
            $scope.bundlesPageLoading = true;
            $scope.showAppInBundlesModal = true;
            appDetailsService.getBundlesForAppList($scope.adamId).then(function(data){
                $scope.bundlesPageLoading = false;
                $scope.appBundleList = data.data;
            });
        }
        $scope.closeAppInBundles = function() {
            $scope.showAppInBundlesModal = false;
        }
        /* **************************************************
        DELETE APP
        ************************************************** */
        $scope.closeDeleteModal = function() {
            $scope.showDeleteAppModal = false;
        }
        $scope.openDeleteModal = function() {
            $scope.showDeleteAppModal = true;
        }
        // Called when the user clicks "Delete" on the delete modal.
        $scope.deleteApp = function () {
            deleteAppService.delete(global_itc_path + '/ra/apps/'+$scope.adamId+'/delete').then(function(data){
                if (data.statusCode === "SUCCESS") {
                    $scope.showDeleteAppModal = false;
                    //$location.path('/app'); // redirect to MYA page
                    $state.go('my_apps');
                }
                else {
                    console.info("Failed to delete app: ", data);
                    data = data.data;
                    if (data.messages) {
                        $scope.deleteError = data.messages.error.join(" "); // because error is an array
                    }
                    else {
                        $scope.deleteError = $scope.l10n.interpolate('ITC.apps.deleteApp.generalError');   
                    }
                    $scope.showDeleteError = true; 
                }
            });
        }
        $scope.init = function() {
            $scope.AppOverviewLoaded = false;
            $scope.appInfoloaded = false;

            $scope.enableSaveButton = false;

            $scope.showPromoArt = false;
            $scope.promoArtRequestlink = global_itc_path + "/wa/LCAppPage/viewPromoArt?adamId="+$scope.adamId;

            $scope.isLocked = false;
            $scope.lockedMessage = "";
            $scope.lockedClass="";

            $scope.saveInProgress = false;

            $scope.tempPageContent = {};
            $scope.tempPageContent.standardEula = true;
            $scope.tempPageContent.eulaModal = {}
            $scope.tempPageContent.confirmLeaveWithModalShowing = {};
            $scope.tempPageContent.confirmLeaveWithModalShowing.needToConfirm = false;
            $scope.tempPageContent.contentspacing = 30; //30px gutter

            $scope.tempPageContent.showConfirmRemoveLoc = false;
            $scope.tempPageContent.confirmRemoveLocHeader = "";
            $scope.tempPageContent.confirmRemoveLocFor = "";
            $scope.tempPageContent.confirmRemoveLocText = "";
            $scope.modalsDisplay = {};
            $scope.modalsDisplay.eulaModal = false;
            $scope.previousNameValue = "";

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
                    $scope.showPromoArt = _.indexOf($scope.appOverviewData.features,'PROMOART') >= 0 ? true: false;
                    unbindwatch_AppOverview();
                    $scope.AppOverviewLoaded = true;
                    $scope.setIsReady(); 
                }
            });

            //always watch for updates to submit summary
            $scope.$watch(function(){
                return univPurchaseService.submitSummaryDataSource.data
            },function(val){
                if (val !== null) {
                    $scope.submitSummaryData = univPurchaseService.submitSummaryDataSource.data;
                    $scope.runMessageManager();
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

            /*$scope.showMissingAppInfoMessage = false;
            if ($scope.getParameterByName('submitErrors') === "true") {
                $scope.showMissingAppInfoMessage = true;
            }*/

            $scope.appInfoIsSaving = false;
            $scope.appInfoIsLoading = true;

            $scope.setIsReady();
            $scope.adamId = $stateParams.adamId;
            $scope.loadAppInfoDetails();
        }
        $scope.init();

        
    }

    itcApp.register.controller('appInfoController', ['$scope','$location','$timeout','$rootScope','$stateParams', '$http', 'validateScreenedWordsService', 'univPurchaseService', 'sharedProperties','linkManager','$sce', '$upload','filterFilter', '$filter','createAppVersionService', 'devRejectAppService', '$state', 'appDetailsService', 'deleteAppService', appInfoController ]);

});
