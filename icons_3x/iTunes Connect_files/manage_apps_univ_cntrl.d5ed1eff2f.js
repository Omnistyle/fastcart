'use strict';
define(['sbl!app'], function (itcApp) {

  // Place this outside of the controller declaration so that it knows whether it has been set or not
  var timingMarkerFirstLoad = true;
  var manageAppsControllerUniversal = function($scope, $rootScope, $filter, $http, $cookies, loadManageAppsDataService, $location, betaStateResolver, univPurchaseService, $state, iapServices, TimingMarker) {
    // This is loaded at the top of the controller
    TimingMarker.marker.start("controller.manageAppsControllerUniversal", {firstLoad: timingMarkerFirstLoad});
    timingMarkerFirstLoad = false;

    $rootScope.isReady = false; // Must set this in every controller until we come up with a better solution
    $scope.apps = {};
    $scope.pageSize = 60;
    $scope.filteredData = {name: 'test'};
    $scope.appsSortOrder = "lastModifiedDate";
    $scope.reverse = true;
    $scope.appsViewMode = "grid";
    $scope.selectedType = 'All Types';
    $scope.availableTypes = ['iOS', 'appletvos', 'appletvtemplate', 'osx', 'iOS App Bundle'];
    $scope.selectedStatus = 'all';
    $scope.availableStatuses = ['readyForSale', 'prepareForUpload', 'waitingForUpload', 'uploadReceived', 'waitingForExportCompliance', 'waitingForReview', 'pendingContract', 'parking', 'processing', 'inReview', 'pendingDeveloperRelease', 'rejected', 'metadataRejected', 'removedFromSale', 'devRejected', 'developerRemovedFromSale', 'invalidBinary', 'missingScreenshot', 'deleted'];
    $scope.errorString = "";
    $scope.searchFocus = false;
    $scope.modalcontent = {};
    $scope.shouldShowiOSCol = false;
    $scope.shouldShowMacOSCol = false;
    $scope.shouldShowtvOSCol = false;
    $scope.shouldShowtvTemplateCol = false;
    $scope.multipleAppTypes = false;

    $scope.tempPageContent = {};
    $scope.tempPageContent.sharedSecretModalLoading = true;


    // Variables we'll be getting back from the JSON, set to false to be safe
    $scope.canCreateAppBundles = false;
    $scope.canCreateIOSApps = false;
    $scope.canCreateMacApps = false;
    $scope.cloudStorageEnabled = false;
    $scope.macBundlesEnabled = false;
    $scope.showSharedSecret = false;
    $scope.contractAnnouncements = [];

    $scope.$on('parentScopeLoaded',function(event,data){
      if (!$scope.l10n) return;
      $rootScope.currentPage = $scope.headerText = $scope.l10n.interpolate('ITC.HomePage.ManagePurpleSoftwareLinkText');
      $scope.bundleText = $scope.l10n.interpolate('ITC.apps.manageyourapps.summary.bundle');

      /*//check if user has seen modal yet...
      $scope.checkLaunchIntroModal();*/

    });

    var userListener = $scope.$watch('user', function(newValue, oldValue) {
      if (newValue !== undefined) {
        $scope.init();
        userListener();
      }
    });

    $scope.init = function() {
      $rootScope.currentclass = "ManageApps"; //class to highlight the correct box...

      $scope.loadAppData();

      if ($cookies.get('appsViewMode' + $scope.user.contentProviderId)) $scope.setView($cookies.get('appsViewMode' + $scope.user.contentProviderId));

      window.scope = $scope; // For easy testing
    }

    $scope.$watch("query", function(query){

        $scope.query = query;

        $scope.filteredData = $scope.applySearchQualifications();
    });

    $scope.setIsReady = function() {
      $rootScope.isReady = true;
      $rootScope.wrapperclass = "nonfixedheader";

      // Once the app has loaded ... make sure to send the data
      TimingMarker.marker.send();

    }

    $scope.versionsTest = function(versionsArr, queryString) {
      for (var i = 0; i < versionsArr.length; i++) {
        if ($scope.l10n.interpolate($scope.referenceData.statusLevels[versionsArr[i].stateKey].locKey).toLowerCase().indexOf(queryString) != -1 ||
           (versionsArr[i].version && versionsArr[i].version.indexOf(queryString) != -1)) {
          return true;
        }
      }
    }

    $scope.platTest = function(versionsArr, queryString) {
      for (var i = 0; i < versionsArr.length; i++) {
        if (versionsArr[i].platformString.toLowerCase().indexOf(queryString) != -1) {
          return true;
        }
      }
    }

    $scope.applySearchQualifications = function() {

      if (!$scope.apps.length) return;

      if ($scope.query && $scope.query != '') {

        // Begin testing to see if this is potentially an app store link to then parse out the adamId
        if ($scope.query.length > 7) {
          var re = /(\d{6,})/;
          if ($scope.query.substring(0, 8) === 'https://') {
            var adamId = re.exec($scope.query);
            $scope.query = adamId[0];
          }
        }

        // var filteredSearch = $filter('filter')($scope.apps, $scope.query);

        var lowerCaseQuery = $scope.query.toLowerCase();
        // Only search on certain fields (excluding meaningless ones like iconUrl & lastModified)
        var filteredSearch = _.filter($scope.apps, function(app){
          if (app.adamId.indexOf(lowerCaseQuery) != -1 ||
             (app.appType && app.appType.toLowerCase().indexOf(lowerCaseQuery) != -1) ||
             (app.bundleId && app.bundleId.toLowerCase().indexOf(lowerCaseQuery) != -1) ||
             (app.name && app.name.toLowerCase().indexOf(lowerCaseQuery) != -1) ||
             (app.vendorId && app.vendorId.toLowerCase().indexOf(lowerCaseQuery) != -1) ||
             $scope.versionsTest(app.universalVersions, lowerCaseQuery) ||
             $scope.platTest(app.universalVersions, lowerCaseQuery))
          {
            return true;
          }
          return false;
        });
      }
      else filteredSearch = $scope.apps;

      filteredSearch = $filter('orderBy')(filteredSearch, $scope.appsSortOrder, $scope.reverse);

      if ($scope.selectedType != 'All Types') {
        var tempSelectedType = $scope.selectedType;
        if ($scope.selectedType != 'iOS App Bundle') tempSelectedType = $scope.selectedType.toLowerCase();

        filteredSearch = _.filter(filteredSearch, function(app){

          if (app.type != 'ios' && (app.type == tempSelectedType)) return true;
          else {
            var match = _.find(app.universalVersions, function(version){
              return version.platformString == tempSelectedType;
            });

            if (match) return true;
          }
        });
      }
      if ($scope.selectedStatus != 'all' && $scope.selectedStatus != '') filteredSearch = _.filter(filteredSearch, function(app){
        var statusTest = _.find(app.versionSets, function(version){
          // if (app.type == 'ios' || app.type == 'mac') return version.stateKey == $scope.selectedStatus;
          // Karen added to fix rdar://problem/15916297 but does not like this solution.
          // When Patrick returns, he should re-evaluate this solution.
          // The problem is that we're using the same status menu but bundles and regular apps
          // have different status's returned from the db. Bundles get "prepareForSubmission"
          // while apps get "prepareForUpload" for "Prepare for Submission."
          if ($scope.selectedType === "iOS App Bundle") {
            if ($scope.selectedStatus === "prepareForUpload") {
              $scope.selectedStatus = "prepareForSubmission";
            }
          }
          else {
            if ($scope.selectedStatus === "prepareForSubmission") {
              $scope.selectedStatus = "prepareForUpload";
            }
          }

          if ((version.deliverableVersion && version.deliverableVersion.stateKey == $scope.selectedStatus) ||
              (version.inFlightVersion && version.inFlightVersion.stateKey == $scope.selectedStatus)) {
            return true;
          }

          // return version.stateKey == $scope.selectedStatus;

          // else return version.stateGroup == $scope.selectedStatus;
        });
        if (statusTest !== undefined) return true;
        else return false;
      });

      var filteredSearchSubset = filteredSearch.slice(0, $scope.pageSize);

      $scope.fullSearchResults = filteredSearch;

      return filteredSearchSubset;
    }

    $scope.filterDeletedApps = function(apps) {
      var filteredApps = _.reject(apps, function(app){
        if (_.findWhere(app.universalVersions, {state: "deleted"})) return true;
      });
      return filteredApps;
    }

    $scope.modifyAppsData = function (apps) {

      var sortArray = univPurchaseService.getSortList();

      // Run through apps and flatten version data from new versionSets object to universalVersions object so we can more easily access version info in rest of code
      _.each(apps, function(app){

        app.universalVersions = [];
        app.universalBuildVersions = [];

        _.each(app.versionSets, function(versionSet, index) {

          if (app.versionSets[index].inFlightVersion || app.versionSets[index].deliverableVersion) {
            if (app.versionSets[index].inFlightVersion) var newLength = app.universalVersions.push(angular.copy(app.versionSets[index].inFlightVersion));
            else var newLength = app.universalVersions.push(angular.copy(app.versionSets[index].deliverableVersion));

            app.universalVersions[newLength-1].platformString = app.versionSets[index].platformString;
            app.universalVersions[newLength-1].type = app.versionSets[index].type;
          }
        });

        _.each(app.buildVersionSets, function(versionSet, index) {

          if (app.buildVersionSets[index].inFlightVersion || app.buildVersionSets[index].deliverableVersion) {
            if (app.buildVersionSets[index].inFlightVersion) var newLength = app.universalBuildVersions.push(angular.copy(app.buildVersionSets[index].inFlightVersion));
            else var newLength = app.universalBuildVersions.push(angular.copy(app.buildVersionSets[index].deliverableVersion));

            app.universalBuildVersions[newLength-1].platformString = app.buildVersionSets[index].platformString;
            app.universalBuildVersions[newLength-1].type = app.buildVersionSets[index].type;
          }
        });

        if (app.universalVersions) app.universalVersions = _.sortBy(app.universalVersions, function(app){
          return sortArray.indexOf(app.platformString);
        });

        if (app.universalBuildVersions) app.universalBuildVersions = _.sortBy(app.universalBuildVersions, function(app){
          return sortArray.indexOf(app.platformString);
        });

      });

      return apps;
    }

    $scope.platformTypeCheck = function(apps, platformType) {
      var result = _.find(apps, function(app){
        return _.find(app.universalVersions, function(version){
          return version.platformString == platformType;
        });
      });

      if (result) return true;
      else return false;
    }

    $scope.checkForPresenceOfPlatformTypes = function(apps) {
      $scope.shouldShowiOSCol = $scope.platformTypeCheck(apps, 'ios');
      $scope.shouldShowMacOSCol = $scope.platformTypeCheck(apps, 'osx');
      $scope.shouldShowtvOSCol = $scope.platformTypeCheck(apps, 'appletvos');
      $scope.shouldShowtvTemplateCol = $scope.platformTypeCheck(apps, 'appletvtemplate');
    }

    $scope.loadAppData = function() {
      loadManageAppsDataService.summaryV2().then(function(response) {

        var data = response.data.data;

        $scope.apps = $scope.modifyAppsData(data.summaries);

        $scope.checkForPresenceOfPlatformTypes($scope.apps);

        $scope.apps = $scope.filterDeletedApps($scope.apps);

        $scope.canCreateAppBundles = data.canCreateAppBundles;
        $scope.canCreateIOSApps = data.canCreateIOSApps;
        $scope.canCreateMacApps = data.canCreateMacApps;
        $scope.contractAnnouncements = data.contractAnnouncements;
        $scope.cloudStorageEnabled = data.cloudStorageEnabled;
        $scope.iCloudDisplaySetPermitted = checkiCloudDisplaySetPermitted();
        $scope.macBundlesEnabled = data.macBundlesEnabled;
        $scope.showSharedSecret = data.showSharedSecret;
        $scope.gameCenterGroupLink = data.gameCenterGroupLink;
        $scope.cloudStorageLink = data.cloudStorageLink;
        $scope.sharedSecretLink = data.sharedSecretLink;
        $scope.catalogReportsLink = data.catalogReportsLink;

        $scope.enabledPlatforms = data.enabledPlatforms;

        // $scope.availableStatuses = $scope.getAvailableStatuses(data.summaries);

        $scope.filteredData = $scope.apps;

        $scope.filteredData = $scope.applySearchQualifications();

        $scope.loadPreviousSort();
        $scope.loadPreviousFilters();
        // $scope.loadPreviousSearch();

        $scope.multipleAppTypes = $scope.calcNumAppTypes();

        $scope.setIsReady();
      },
      function(error){
        console.error("Error getting data: ", error);

        $scope.errorString = error.status + " " + error.statusText;

        $scope.setIsReady();
      });
    };

    var checkiCloudDisplaySetPermitted = function() {
      if (!$scope.user.permittedActivities) return false;

      var test = _.find($scope.user.permittedActivities.VIEW, function(permission) {
        if (permission == "iCloudDisplaySet") return true;
      });

      if (test) return true;
      else return false;
    }

    $scope.setView = function(viewMode) {
      if (viewMode == "grid") $scope.appsViewMode = "grid";
      else if (viewMode == "list") $scope.appsViewMode = "list";
    };

    $scope.toggleView = function() {
      if ($scope.appsViewMode == "grid") {
        $scope.appsViewMode = "list";
        $cookies.put('appsViewMode' + $scope.user.contentProviderId, "list");
      }
      else if ($scope.appsViewMode == "list") {
        $scope.appsViewMode = "grid";
        $cookies.put('appsViewMode' + $scope.user.contentProviderId, "grid");
      }
    };

    $scope.setSelectedType = function(selectedType) {
      $scope.selectedType = selectedType;
      $cookies.put('selectedType' + $scope.user.contentProviderId, selectedType);

      $scope.filteredData = $scope.applySearchQualifications();
    }

    $scope.typeDisplay = function(type) {
      if (!$rootScope.isReady || $scope.l10n === undefined || type === undefined) return;

      switch(type) {
        case 'All Types':
          return $scope.l10n.interpolate('ITC.apps.manageyourapps.summary.alltypes');
          break;
        case 'iOS':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.iOS');
          break;
        case 'osx':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.macOS');
          break;
        case 'iOS App Bundle':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.iOSBundle');
          break;
        case 'appletvos':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.tvOS');
          break;
        case 'appletvtemplate':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.tvTemplate');
          break;
      }
    }

    $scope.closeMenu = function(event) {
        var menuID = event.currentTarget.id;
        $scope.$emit('closepopup', menuID);
    }

    $scope.setSelectedStatus = function(status) {
      $scope.selectedStatus = status;
      $cookies.put('selectedStatus' + $scope.user.contentProviderId, status);

      $scope.filteredData = $scope.applySearchQualifications();
    }

    $scope.loadPreviousFilters = function() {
      if ($cookies.get('selectedType' + $scope.user.contentProviderId) !== undefined) $scope.setSelectedType($cookies.get('selectedType' + $scope.user.contentProviderId));
      if ($cookies.get('selectedStatus' + $scope.user.contentProviderId) !== undefined) $scope.setSelectedStatus($cookies.get('selectedStatus' + $scope.user.contentProviderId));
    }

    $scope.changeOrder = function (appsSortOrder) {
      $scope.appsSortOrder = appsSortOrder;
      $cookies.put('appsSortOrder' + $scope.user.contentProviderId, appsSortOrder);
      $scope.filteredData = $filter('orderBy')($scope.fullSearchResults, appsSortOrder, $scope.reverse);
    };

    $scope.updateSorting = function (appsSortOrder) {
      if ($scope.appsSortOrder != appsSortOrder) $scope.reverse = true;
      $scope.reverse = !$scope.reverse;
      $scope.appsSortOrder = appsSortOrder;
      // $cookies['appsSortOrder' + $scope.user.contentProviderId] = appsSortOrder;

      $scope.changeOrder(appsSortOrder);
    };

    $scope.loadPreviousSort = function() {
      if ($cookies.get('appsSortOrder' + $scope.user.contentProviderId) !== undefined) $scope.updateSorting($cookies.get('appsSortOrder' + $scope.user.contentProviderId));
    }

    $scope.loadPreviousSearch = function() {
      if ($cookies.get('appsSearchQuery' + $scope.user.contentProviderId)) $scope.query = $cookies.get('appsSearchQuery' + $scope.user.contentProviderId);
      // else $scope.query = "";
    }

    $scope.countCalc = function(countType, string) {
      var count = 0;
      for (var i = 0; i < $scope.apps.length; i++) {
        if (countType === 'appType') {

          if (string == 'iOS App Bundle') {
            if ($scope.apps[i].universalVersions[0].type == "BUNDLE") count++;
          }
          else {
            _.each($scope.apps[i].universalVersions, function(version){
              if (version.platformString && version.platformString.toLowerCase() == string.toLowerCase()) {
                count++;
              }
            });
          }

        }
        else if (countType === 'status') {
          for (var y = 0; y < $scope.apps[i].universalVersions.length; y++) {
            if ($scope.apps[i].universalVersions[y].stateKey.toLowerCase() == string.toLowerCase()) count++;
          }
        }
      }

      if (count === undefined) count = -1;

      return count;
    };

    $scope.calcNumAppTypes = function() {
      if (!$scope.apps.length) return;

       var typeArray = [];

        for (var i = 0; i < $scope.apps.length; i++) {
          if (!$scope.apps[i].universalVersions) return;
          for (var y = 0; y < $scope.apps[i].universalVersions.length; y++) {
            if ($scope.apps[i].universalVersions[y].platformString) {
              if ($scope.apps[i].universalVersions[y].platformString == 'ios' && $scope.apps[i].universalVersions[y].type == 'BUNDLE') typeArray.push('iosbundle');
              else typeArray.push($scope.apps[i].universalVersions[y].platformString);
            }
          }
        }

        var uniqueArray = _.uniq(typeArray);
        if (uniqueArray.length > 1) return true;
    }

    $scope.appBundleLink = function(adamId, type, version) {
      if ($scope.isBundle(type)) {
        // var baseUrl = global_itc_path + '/wa/LCAppBundlePage?adamId=';
        // return baseUrl + adamId;

        return global_itc_home_url + '/bundle/' + adamId;
      } else {
        var currentPath = $location.absUrl();
        var newPath = currentPath + '/' + adamId;
        if (version) return newPath + '/' + version.platformString + '/versioninfo';
        else return newPath;
      }
    }

    $scope.buildLink = function(adamId, type) {
      return global_itc_home_url + '/app/' + adamId + '/testflight/builds/' + type;
    }

    $scope.getBuildStatusClass = function( status ) { return betaStateResolver.getIconClass( status ) }

    $scope.resCenterLink = function(adamId, type, platform) { // now used in a ui-sref
      var route;
      if (!platform) platform = type;
      if ($scope.isBundle(type)) {
        route = "bundle_resolution_center({adamId: '" + adamId + "'})";
      } else {
        route = "app_overview.resolution_center({adamId: '" + adamId + "', platform: '" + platform + "' })";
      }
      return route;
    }

    $scope.isBundle = function(type) {
      if (type == 'iOS App Bundle' || type == 'Mac App Bundle') return true;
      else return false;
    }

    $scope.getNoResultsString = function() {
      if (!$rootScope.isReady || $scope.l10n === undefined) return;
      if (!$scope.query) return $scope.l10n.interpolate('ITC.apps.manageyourapps.summary.noresultsgeneric');
      else return $scope.l10n.interpolate('ITC.apps.manageyourapps.summary.noresults', {'query': $scope.query});
    }

    $scope.getProperType = function(type) {
      if (!$rootScope.isReady || $scope.l10n === undefined || type === undefined) return;

      switch (type) {
        case 'ios':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.iOS');
          break;
        case 'mac':
        case 'osx':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.macOS');
          break;
        case 'iOS App Bundle':
          return $scope.l10n.interpolate('ITC.apps.manageyourapps.summary.iosbundle');
          break;
        case 'Mac App Bundle':
          return $scope.l10n.interpolate('ITC.apps.manageyourapps.summary.macbundle');
          break;
        case 'appletvos':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.tvOS');
          break;
        case 'appletvtemplate':
          return $scope.l10n.interpolate('ITC.apps.universal.myapps.tvTemplate');
          break;
        default:
          return type;
          break;
      }
      return false;
    }

    $scope.launchCreateNewApp = function(appType) {

      if ((!$scope.canCreateIOSApps && appType == 'ios') ||
          (!$scope.canCreateMacApps && appType == 'osx') ||
          (!$scope.canCreateAppBundles && appType == 'bundle')) {
        $scope.showContractAnnouncementsModal = true;
      }
      else {
        if (appType == 'bundle') $state.go('new_bundle');
        else {
          $scope.modalcontent.showCreateNewAppModal = true;
          $scope.modalcontent.appType = appType;
        }
      }
      $scope.$emit('closepopups',true);
    }

    $scope.appIcon = function(app) {

      var iosPlatform = _.findWhere(app.versionSets, {'platformString':'ios'});
      var tvosPlatform = _.findWhere(app.versionSets, {'platformString':'appletvos'});
      var tvchannelPlatform = _.findWhere(app.versionSets, {'platformString':'appletvtemplate'});
      var osxPlatform = _.findWhere(app.versionSets, {'platformString':'osx'});

      //look for devlierable version's icons in this order: iOS -> OSX -> tvOS -> tvChannel
      var appIconUrl = null;

      if (iosPlatform !== undefined && iosPlatform.deliverableVersion !== null && iosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = iosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
      } else if (osxPlatform !== undefined && osxPlatform.deliverableVersion !== null && osxPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = osxPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
      } else if (tvosPlatform !== undefined && tvosPlatform.deliverableVersion !== null && tvosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = tvosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
      } else if (tvchannelPlatform !== undefined && tvchannelPlatform.deliverableVersion !== null && tvchannelPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = tvchannelPlatform.deliverableVersion.largeAppIcon.thumbNailUrl;
      } else if (iosPlatform !== undefined && iosPlatform.inFlightVersion !== null && iosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = iosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
      } else if (osxPlatform !== undefined && osxPlatform.inFlightVersion !== null && osxPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = osxPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
      } else if (tvosPlatform !== undefined && tvosPlatform.inFlightVersion !== null && tvosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = tvosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
      } else if (tvchannelPlatform !== undefined && tvchannelPlatform.inFlightVersion !== null && tvchannelPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appIconUrl = tvchannelPlatform.inFlightVersion.largeAppIcon.thumbNailUrl;
      } else {
          appIconUrl = app.iconUrl;
      }

      return appIconUrl;
    }

    $scope.isTvOsIcon = function(app) {
      var iosPlatform = _.findWhere(app.versionSets, {'platformString':'ios'});
      var tvosPlatform = _.findWhere(app.versionSets, {'platformString':'appletvos'});
      var tvchannelPlatform = _.findWhere(app.versionSets, {'platformString':'appletvtemplate'});
      var osxPlatform = _.findWhere(app.versionSets, {'platformString':'osx'});

      var appleTVStyle;
      if (iosPlatform !== undefined && iosPlatform.deliverableVersion !== null && iosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = false;
      } else if (osxPlatform !== undefined && osxPlatform.deliverableVersion !== null && osxPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = false;
      } else if (tvosPlatform !== undefined && tvosPlatform.deliverableVersion !== null && tvosPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = true;
      } else if (tvchannelPlatform !== undefined && tvchannelPlatform.deliverableVersion !== null && tvchannelPlatform.deliverableVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = true;
      } else if (iosPlatform !== undefined && iosPlatform.inFlightVersion !== null && iosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = false;
      } else if (osxPlatform !== undefined && osxPlatform.inFlightVersion !== null && osxPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = false;
      } else if (tvosPlatform !== undefined && tvosPlatform.inFlightVersion !== null && tvosPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = true;
      } else if (tvchannelPlatform !== undefined && tvchannelPlatform.inFlightVersion !== null && tvchannelPlatform.inFlightVersion.largeAppIcon.thumbNailUrl !== null) {
          appleTVStyle = true;
      } else {
          if (iosPlatform !== undefined || osxPlatform !== undefined) {
              appleTVStyle = false;
          } else {
              appleTVStyle = true;
          }
      }

      return appleTVStyle;
    }

    $scope.getIconClass = function(app) {
      if ($scope.isTvOsIcon(app)) return 'tv-os-icon';
      else if (app.type == 'ios' && $scope.appsViewMode == 'list') return 'ios7-style-icon';
      else if (app.type == 'ios' && $scope.appsViewMode != 'list') return 'ios7-style-icon-large';
    }

    $scope.loadMoreResults = function() {
      if (!$scope.filteredData || !$scope.filteredData.length) return;

      var low = $scope.filteredData.length;
      var high = $scope.filteredData.length + $scope.pageSize;
      var subsetToConcat = $scope.fullSearchResults.slice(low, high);

      $scope.filteredData = $scope.filteredData.concat(subsetToConcat);
    }

    $scope.closeContractAnnouncementsModal = function() {
      $scope.showContractAnnouncementsModal = false;
    }

    /*$scope.isSiloingActive = function() {
        if ($scope.parentScopeLoaded) {
            return ($scope.user.contentProviderType === 'Purple Software' && _.indexOf($scope.user.contentProviderFeatures,'APP_SILOING') >= 0);
        }
    }*/

    /** Shared Secret **/
    $scope.showSharedSecretModal = function() {
        $scope.$emit('closepopups',true);
        $scope.sharedSecretCode = null;
        $scope.tempPageContent.sharedSecretUpdating = false;
        $scope.tempPageContent.showSharedSecretModal = true;
        $scope.tempPageContent.sharedSecretModalLoading = true;
        iapServices.getSharedSecret().then(function(data){
            $scope.tempPageContent.sharedSecretModalLoading = false;
            $scope.sharedSecretCode = data.data;
        });
    }
    $scope.generateSharedSecret = function() {
        $scope.tempPageContent.sharedSecretModalLoading = true;
        iapServices.generateSharedSecret().then(function(data){
            $scope.sharedSecretCode = data.data;
            $scope.tempPageContent.sharedSecretModalLoading = false;
        });
    }

  }

  itcApp.register.controller('manageAppsControllerUniversal', ['$scope', '$rootScope', '$filter', '$http', '$cookies', 'loadManageAppsDataService', '$location', 'betaStateResolver', 'univPurchaseService', '$state', 'iapServices', 'TimingMarker', manageAppsControllerUniversal]);


});
