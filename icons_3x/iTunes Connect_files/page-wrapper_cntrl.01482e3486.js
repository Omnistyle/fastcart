'use strict';
//new
define(['sbl!app'], function (itcApp) {
	var pageWrapperController = function ($q, $scope, sharedProperties, $rootScope, userSessionService, localizationService, referenceDataService, $sce, $cookies, mainNavService, $location, appDetailsService, $state,$stateParams,ITC,multiProviderServices,$cookieStore,TimingMarker) {

		$scope.updateMainNav = function() {
 			$scope.onHomepage = !!($rootScope.currentPage === "Homepage");
		};

		$scope.loadUserSession = function() {
	        userSessionService.async().then(function(data) {
	            $scope.user = data.data;
	            usersessionloaded = true;
	            //sort providers by name alpha
	            if ($scope.user.associatedAccounts !== undefined && $scope.user.associatedAccounts.length > 1) {
	            	$scope.user.associatedAccounts = _.sortBy($scope.user.associatedAccounts,function(acct){
	            		return acct.contentProvider.name.toLowerCase();
	            	});
	            	//pull out current provider from list and put at top
	            	angular.forEach($scope.user.associatedAccounts,function(acct,key){
	            		if (acct.contentProvider.contentProviderId === $scope.user.sessionToken.contentProviderId) {
	            			$scope.user.associatedAccounts.move(key, 0);
	            		}
	            	});
	            }
	            $scope.checkIsReady();
	        });
	    };
        
        $scope.hasProviderFeature = function( feature ) {
            var collection = deep( $scope, 'user.contentProviderFeatures' );
            if (!collection) return null;
            return ( collection.indexOf( feature ) >= 0 );
        };
        
        $scope.hasUserFeature = function( feature ) {
            var collection = deep( $scope, 'user.userFeatures' );
            if (!collection) return null;
            return ( collection.indexOf( feature ) >= 0 );
        };

        $scope.hasEditPermittedActivity = function(feature) {
        	var collection = deep($scope,'user.permittedActivities.EDIT');
        	if (!collection) return true; //default to show if permittedActivities doesn't exist
        	return (collection.indexOf(feature) >= 0);
        }
        $scope.hasViewPermittedActivity = function(feature) {
        	var collection = deep($scope,'user.permittedActivities.VIEW');
        	if (!collection) return true; //default to show if permittedActivities doesn't exist
        	return (collection.indexOf(feature) >= 0);
        }

        $scope.hasContentProviderFeature = function(feature) {
        	var collection = deep($scope,'user.contentProviderFeatures');
        	if (!collection) return null; //default to show if permittedActivities doesn't exist
        	return (collection.indexOf(feature) >= 0);
        }

	    $scope.loadMainNavModules = function() {
	        mainNavService.async().then(function(data) {
	            $scope.mainNavigation = data.data;

	            // Replace the default name property (which the shared header uses for module icon labels) coming in modules endpoint with the localized key iconTextKey rdar://problem/26840154
	            $scope.mainNavigation = _.each($scope.mainNavigation, function(module){
	            	module.name = $scope.l10n.interpolate(module.iconTextKey);
	            });

	            $scope.pageWrapperVars.mainNavigationCount = $scope.mainNavigation.length;
	            mainNavloaded = true;
	            $scope.checkIsReady();
	        });
	    };

	    $scope.loadHelpResourcesNav = function() {
	    	mainNavService.helpResourcesNav().then(function(data) {
	            $scope.helpResources = data.data;
	            helpResourcesloaded = true;
	            $scope.checkIsReady();
	            $scope.showHelpResources = false;
	            if ($scope.helpResources.length) {
	            	$scope.showHelpResources = true;
		            /*$scope.resourcesAll = _.findWhere($scope.helpResources, {linkKey: "All"});
		            $scope.resourcesNews = _.findWhere($scope.helpResources, {linkKey: "News"});
		            $scope.resourcesGuides = _.findWhere($scope.helpResources, {linkKey: "Guides"});
		            $scope.resourcesVideos = _.findWhere($scope.helpResources, {linkKey: "Videos"});
		            $scope.resourcesFAQ = _.findWhere($scope.helpResources, {linkKey: "FAQ"});
		            $scope.resourcesConactUs = _.findWhere($scope.helpResources, {linkKey: "ContactUs"});*/
		        }

	        });
	    }
        
        $scope.ITC = ITC;
	    
	    // The interpolate function allows us to replace arbitrary variables with their appropriate value
        // Usage: l10n.interpolate( <localization key>, <data object>)
	    var interpolateFunc = function( localizationKey, replacements ) {
        	var text = $scope.l10n[ localizationKey ] || localizationKey,
        		r = replacements;
        		
        	if (typeof r === 'object' && Object.keys(r).length > 0) {
        		for (var key in r) {
        			if (r.hasOwnProperty(key)) {
            			r['@@'+key+'@@'] = r[key];
            			delete r[key];
            		}
        		}
        		var rgx = new RegExp( Object.keys(r).join('|'), 'gi');
        		return text.replace(rgx, function(match) { return r[match] });
        	} else {
        		return text;
        	}
        };
        
        $scope.l10n = { interpolate: interpolateFunc };

	    $scope.loadLocalizationKeys = function() {
	    	TimingMarker.marker.start("homepage.service.l10n");
			return localizationService.async().then( function(data) {
				// Store the localization array
	            $scope.l10n = data.data || {};
	            $scope.l10n.interpolate = interpolateFunc;
                $scope.loc = $scope.l10n.interpolate;
	            
	            localizationloaded = true;
                $rootScope.l10n = $scope.l10n;
                TimingMarker.marker.end("homepage.service.l10n");
	            $scope.checkIsReady();
	            return $scope.l10n;
	        });
	    };

	    $scope.loadReferenceData = function() {
	    	TimingMarker.marker.start("homepage.service.refData");
			return referenceDataService.async().then(function(data) {
                
	            $scope.referenceData = data.data;
                $rootScope.referenceData = $scope.referenceData;
                
	            referenceDataloaded = true;
	            $scope.checkIsReady();

	            //load dev/qa header info
	            $scope.loadDevQAHeaderInfo();
	            TimingMarker.marker.end("homepage.service.refData");
	            return $scope.referenceData;
	        });   
	    };


	    $rootScope.storageitems = {};
	    
	    $scope.setNewProvider = function(providerId) {
	    	if (providerId !== $scope.user.sessionToken.contentProviderId) {
	    		$state.go('switch',{'newproviderid':providerId});
	    	}
	    }

		//var sharedPropertiesObj = sharedProperties.isReady();
		$scope.checkIsReady = function() {
			if (usersessionloaded && localizationloaded && referenceDataloaded && mainNavloaded && helpResourcesloaded) {
				//let child scope know we're ready...
				$scope.parentScopeLoaded = true;
				$scope.$broadcast("parentScopeLoaded");


				$rootScope.footerNavConfig = {
			        options: {
			            contactUrl:     global_itc_path + '/da/LCProviderDispatcherPage/contactUs',
			            privacyText:    $scope.l10n.interpolate('ITC.HeaderFooter.PrivacyPolicyLinkText'),
			            contactText:    $scope.l10n.interpolate('ITC.HeaderFooter.ContactUsLinkText'),
			            tosText:        $scope.l10n.interpolate('ITC.HeaderFooter.termsOfServiceLinkText'),
			            rightsText:     $scope.l10n.interpolate('ITC.HeaderFooter.Copyright.AppleRightsReserved'),
			            copyrightText:  $scope.l10n.interpolate('ITC.HeaderFooter.Copyright.text'),
			            doneCtaText:    $scope.l10n.interpolate('ITC.Done.Button')
			        }
			    };

			    var baseHost = location.protocol + '//' + location.hostname;

			    if ($rootScope.headerConfig !== undefined) {
			    	$rootScope.headerConfig.title.text = $scope.currentPage !== undefined ? $scope.currentPage : '';
			    	$rootScope.headerConfig.title.className = $rootScope.currentclass !== undefined ? $rootScope.currentclass : '';
			    } else {
				    $rootScope.headerConfig = {
	                    title: {
	                        text: $scope.currentPage !== undefined ? $scope.currentPage : '',
	                        url: '',
	                        className: $rootScope.currentclass !== undefined ? $rootScope.currentclass : ''
	                    },

	                    itcBaseUrl: baseHost,
	                    itcHomeUrl: baseHost,

	                    apis: {
	                        user: {//: baseHost + global_itc_path + '/ra/user/detail',
	                        	response: { data: $scope.user }
	                    	},
	                        header: {//baseHost + global_itc_path + '/ra/nav/header/modules',
	                        	response: { data: { data: $scope.mainNavigation } }
	                    	},
	                        help: { //baseHost + global_itc_path + '/ra/nav/help/links',
	                        	response: { data: { data: $scope.helpResources } }
	                    	},
	                        //session: baseHost + global_itc_path + '/ra/v1/session/webSession'
	                        //managing this locally//
	                        session: {
	                        	url: null,
	                        	override: function(app) {
		                            $scope.setNewProvider(app)
		                        }
	                        }
	                    },
	                    signOut: {
	                        text: $scope.l10n.interpolate('ITC.HeaderFooter.SignoutLinkText'),
	                        url: $scope.signoutlink //baseHost + global_itc_path +'/wa/logout'
	                    },
	                    userDetail: {
	                    	fullName: $scope.l10n.interpolate('ITC.user.firstLastName', {firstName: $scope.user.firstname, lastName: $scope.user.lastname}),
	                        text: $scope.l10n.interpolate('ITC.HeaderFooter.PersonalDetailsLinkText'),
	                        url: baseHost + global_itc_path +'/ra/ng/users_roles'
	                    },
	                    appSwitcherData: {
	                        apps: [],
		                    application: {},
		                    showListLink: "true",
		                    baseIcon: getGlobalPath('/itc/img/ico_homepage/MyApps.png'),
		                    applicationLabel: $scope.l10n.interpolate('ITC.HomePage.ManagePurpleSoftwareLinkText'),
		                    searchLabel: $scope.l10n.interpolate('ITC.component.search.label'),
		                    noResultsLabel: $scope.l10n.interpolate('ITC.NoResults'),
		                    onAppSelect: function(app) {
			                    $state.go('app_overview.store.appinfo',{'adamId':app.id})
			                },
			                goToList: function() {
			                	$state.go('my_apps');
			                }
	                    }
		            }
		        }


			} else {
				$scope.parentScopeLoaded = false;
			}
			if($rootScope.isReady && usersessionloaded && localizationloaded && referenceDataloaded && helpResourcesloaded) {
				$scope.isLoaded = true;
		        $scope.$broadcast("pageIsLoaded");
			} else {
				$scope.isLoaded = false;
			}
		}


		$scope.getYear = new Date().getFullYear();
		$scope.showTOS = function() {
			$scope.pageWrapperVars.showTOS = true;
		}
		$scope.closeTOS = function() {
			$scope.pageWrapperVars.showTOS = false;
		}

		//onLoad
		var usersessionloaded = false;
		var localizationloaded = false;
		var referenceDataloaded = false;
		var mainNavloaded = false;
		var helpResourcesloaded = false;
		$scope.parentScopeLoaded = false;
		$scope.signoutlink = global_itc_path + "/wa/logout";

		$scope.updateMainNav();
		$scope.checkIsReady();
		$scope.loadUserSession();
		
		$q.all([$scope.loadLocalizationKeys(), $scope.loadReferenceData()]).then(function(){
			$scope.loadMainNavModules();
			TimingMarker.marker.send();
		});
		$scope.loadHelpResourcesNav();
		$scope.isSaving = false;
		$scope.pageWrapperVars = {};
		$scope.pageWrapperVars.showTOS = false;

		//global environment variables to use in HTML
		$scope.global_itc_path = global_itc_path;
		$scope.global_itc_home_url = global_itc_home_url;

		$scope.setIsSaving = function(isItSaving) {
			$scope.isSaving = !!(isItSaving);
		}



		//For Dev/QA Headers...adamid and bundle id display
		$rootScope.$on('$stateChangeSuccess', function () {
			$scope.loadDevQAHeaderInfo();
        });
        $scope.loadDevQAHeaderInfo = function() {
        	if ($scope.referenceData !== undefined && $scope.referenceData.isDevOrQA) {
	            $scope.pageWrapperVars.adamId = $scope.getAdamIdFromPath();
	            if ($scope.pageWrapperVars.adamId !== undefined && $scope.pageWrapperVars.adamId !== null && $scope.pageWrapperVars.adamId !== '') {
		            $scope.loadHeaderData($scope.pageWrapperVars.adamId);
		        }
	        }
        }
        $scope.getAdamIdFromPath = function() {
        	var path = $location.path();
            var pathParts = path.split("/");
            //if first item in path is "app" get adam id (should be second value)
            if (pathParts[1] == "app" && pathParts[2]) {
            	 return pathParts[2];
            } else {
            	return null;
            }
        }
		$scope.loadHeaderData = function(adamId) {
			if (adamId !== null && adamId !== '') {
				
				// If we already have this app's info in $rootScope, then re-use it...
				if ($rootScope.appPageHeader !== undefined && $rootScope.appPageHeader.adamId == adamId) {
					var appData = $rootScope.appPageHeader;
					$scope.pageWrapperVars.bundleId = appData.bundleId.value.replace("*","") + (deep(appData.bundleIdSuffix.value) ? appData.bundleIdSuffix.value : '');
				// ...otherwise load a fresh copy from the server
				} else {
					appDetailsService.debugInfo(adamId).then(function(data) {
                        if (data.status == "500" || data.status == "403" || data === undefined || data.data === undefined) {
		                    //error
		                } else {
						/*if (data.data.bundleIdSuffix !== null && data.data.bundleIdSuffix.value !== null) {
							$scope.pageWrapperVars.bundleId = data.data.bundleId.replace("*","") + data.data.bundleIdSuffix.value;
						} else {
							$scope.pageWrapperVars.bundleId = data.data.bundleId;
								}*/
							$scope.pageWrapperVars.bundleId = data.data.bundleId;
						}
					});	
				}
			}
		}
		
		
		var constructHier = function(val) {
            var val = val || '', hierString = '';
            var isProd = (location.hostname === "itunesconnect.apple.com") ? true : false;
            if (val !== '') {
                hierString += 'appleitmsitc' + val + ((isProd)?'':'qa') + 'dev,';
            }
            hierString += 'appleitmsitc' + ((isProd)?'':'qa') + 'dev';
            return hierString;
        };
		
		var applyTrackingMetadata = function( trackingConfig ) {
            var c = trackingConfig;
            if (c === undefined) return false;
            s.pageName = (c.pageName !== undefined) ? c.pageName : ''; // e.g. "App - Summary"
            s.channel  = (c.channel  !== undefined) ? c.channel  : ''; // e.g. "Manage Your App"
            s.hier5    = constructHier(c.hier5); // e.g. "appleitmsitcdev"
            return trackingConfig;
        };


		$rootScope.$watch('currentPage',function(value){
			$scope.currentPage = value;
            if ($rootScope.headerConfig !== undefined) {
            	//$scope.headerConfig.options.title.text = value;
            	$rootScope.headerConfig.title.text = value;
            	$rootScope.headerConfig.title.className = $rootScope.currentclass;
            }
			$scope.updateMainNav();
		});
		$rootScope.$watch('currentclass',function(value){
            if ($rootScope.headerConfig !== undefined) {
            	$rootScope.headerConfig.title.className = $rootScope.currentclass;
            }
		});
		$rootScope.$watch('isReady',function(value){
			$scope.checkIsReady();
		});
		$rootScope.$on('$stateChangeStart', function(event, next, toParams, current, fromParams) {
			//is state part of the "app store" group:
			var nameStatesArray = next.name.split('.');
			if (_.indexOf(nameStatesArray,'app_overview') >= 0 && _.indexOf(nameStatesArray,'store') >= 0) {
				$scope.hasSidebar = true;
			} else {
				$scope.hasSidebar = false;
			}
			if (next.data && next.data.trackingConfig) {
				applyTrackingMetadata( next.data.trackingConfig );
			}
		});

		$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
			$rootScope.urlChangeSuccessFrom = from;
			$rootScope.urlChangeSuccessFromParams = from;
			$rootScope.urlChangeSuccessFromURL = window.location.pathname;
        });

		/********* GLOBAL UTILITY FUNCTIONS *********/
		$scope.renderHtml = function(html_code) {
    		return $sce.trustAsHtml(html_code);
		};
        $scope.showHtml = $scope.renderHtml;

		$scope.getGlobalFilePathMap = function(filepath) {
			return getGlobalPath(filepath);
		}

		//use to reutn values from JSON without ng-repeat's auto sorting
		$scope.notSorted = function(obj){
			if (!obj) {
				return [];
			}
			return Object.keys(obj);
		}
		$scope.urlEncode = function(string) {
            return encodeURIComponent(string);
        }
        
        $scope.showDebugMenu = function() {
        	$scope.debugMenuVisible = true;
        }
        $scope.hideDebugMenu = function() {
        	$scope.debugMenuVisible = false;
        }
        
        $scope.hasValue = function(val) {
            return (val !== null && val !== undefined);
        }

        //global values
        $scope.globalOptions = {
        	ngModelOptions: { updateOn: 'default blur', debounce: { 'default': 100, 'blur': 0 } }
        }

        //store current and last state in rootscope
        $rootScope.previousState;
		$rootScope.currentState;
		$rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
		    $rootScope.previousState = from.name;
		    $rootScope.currentState = to.name;
		});

	}

	itcApp.controller('pageWrapperController', ['$q', '$scope', 'sharedProperties','$rootScope','userSessionService','localizationService', 'referenceDataService','$sce','$cookies','mainNavService','$location','appDetailsService','$state','$stateParams','ITC','multiProviderServices','$cookieStore', 'TimingMarker', pageWrapperController]);

});
