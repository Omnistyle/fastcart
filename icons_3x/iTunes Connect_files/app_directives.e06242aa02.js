define(['sbl!app'], function (itcApp) {

	itcApp.directive('appView', function() {
		return {
			replace: true,
			transclude: true,
			template:
				'<div>'+
				  	'<div ng-if="app.iconUrl" class="ios7-style-icon" style="background-image:url({{app.iconUrl}})"></div>'+
	              	'<div ng-if="!app.iconUrl" class="iconfont-icon-placeholder icon-64"></div>'+
	              	'<div class="metadata">'+
	                	'<div class="app-name">{{app.name}}</div>'+
	                	'<div class="app-type-badge">{{getFormattedType(app.appType)}}</div>'+
	              	'</div>'+
	              	'<div ng-if="appsInBundleList.length < 10" class="addIcon" ng-click="addAppToBundleAction($index, app)"></div>'+
              	'</div>',
			link: function(scope, element, attrs) {

			}
		}
	});

	/*
		if app header main nav is too long - pull nav items into "more" dropdown. If window width is resized larger, pull items back out.
	*/
	itcApp.directive('appHeaderNav',function(){
		return {
			scope: {
				'origNavObj': '=appHeaderNav' // get this for length of nav items
			},
			link: function(scope,element,attrs) {

				$(window).resize(function(){
                	fixNav();
                });

				var getLIWidthTotal = function() {
					var liArray = element.find('li:not(li li):visible'); //base width on full li total... we'll only be showing hidding .mainNavLinks though
                	var liWidthTotal = 0;
                	angular.forEach(liArray, function(liElement) {
                		liWidthTotal += $(liElement).outerWidth(true);
                	});
                	return liWidthTotal;
				}

				var hideAllOverflowNav = function() {
					var navitems = element.find('#navOverflow li');
					$(navitems).each(function(index) {
						$(navitems[index]).hide();
					});
				}

				var showAllMainNav = function() {
					var navitems = element.find('li.mainNavLinks');
					$(navitems).each(function(index) {
						$(navitems[index]).show();
					});
				}

                var fixNav = function() {
                	if (scope.origNavObj) {
						totalNumNavItems = scope.origNavObj.length;
	                	var fullULWidth = element.width();
	                	var liArrayOverflow = element.find('#navOverflow li');
			            var liArray = element.find('li.mainNavLinks');
			            showAllMainNav(); //reset what's visible...
			            var liWidthTotal = getLIWidthTotal();

		                if (fullULWidth > liWidthTotal) {
			                hideAllOverflowNav(); //hide all more nav if navigation is ok and all overflow is already hidden
			            } else if (liWidthTotal > fullULWidth) {
			            	var count = totalNumNavItems-1;
			            	while (count > 0 && liWidthTotal > fullULWidth) {
			            		//show main nav item and hide overflow items
			            		$(liArrayOverflow).each(function(index){
			            			if (index < count) {
			            				$(liArrayOverflow[index]).hide();
			            			} else {
			            				$(liArrayOverflow[index]).show();
			            			}
			            		});
			            		$(liArray).each(function(index){
			            			if (index < count) {
			            				$(liArray[index]).show();
			            			} else {
			            				$(liArray[index]).hide();
			            			}
			            		});
			            		liWidthTotal = getLIWidthTotal();
			            		var test = element.find('li:visible:not(li li)');
			            		count--;
			            	}
			            }
	                }
	                scope.$on('pageIsLoaded', function() {
			            fixNav();
			        });
			        scope.$on('$locationChangeSuccess',function(){
			        	fixNav();
			        });
		    	}	
				scope.$watch('origNavObj',function() {
					fixNav();
				});	

			}
		}
	});

	itcApp.directive('appNameHeaderBar',function($window){
		return {
			scope: {
				'parentId':'@',
				'logoNavId':'@',
				'sessionNavId':'@',
				'appNameDiv':'@',
				'paddingAroundLogoTotal':'@',
				'paddingAroundSessionNavTotal':'@'
			},
			link: function(scope,element,attrs) {

				scope.$watch(function(){
					return $('#'+scope.appNameDiv).html();
				},function(newval,oldval){
					if (newval !== undefined && newval !== null) {
						calculateWidths();
					}
				});
               	var calculateWidths = function() {

               		var parentWidth = $('#'+scope.parentId).outerWidth();
               		var logoNavWidth = $('#'+scope.logoNavId).outerWidth();
               		var sessionNavWidth = $('#'+scope.sessionNavId).outerWidth();

               		var widthOccupied = sessionNavWidth + logoNavWidth + parseInt(scope.paddingAroundLogoTotal) + parseInt(scope.paddingAroundSessionNavTotal); //30px*2 outer edge each side, 30px*2 margin between app header and nav blocks
               		var appNameWidth = parentWidth - widthOccupied;

               		//make sure width clears both sides
               		var clearedArea = (parentWidth - appNameWidth)/2;
               		if (clearedArea < (logoNavWidth + parseInt(scope.paddingAroundLogoTotal))) {
               			appNameWidth = parentWidth - ((logoNavWidth + parseInt(scope.paddingAroundLogoTotal))*2);
               		}
               		//update clearedArea value...
               		var clearedArea = (parentWidth - appNameWidth)/2
               		if (clearedArea < (sessionNavWidth + parseInt(scope.paddingAroundSessionNavTotal))) {
               			appNameWidth = parentWidth - ((sessionNavWidth + parseInt(scope.paddingAroundSessionNavTotal))*2);
               		}

               		$('#'+scope.appNameDiv).css('maxWidth',appNameWidth);
               	}
               	var windowEl = angular.element($window);
               	var handler = scope.$apply.bind(scope, calculateWidths);
                windowEl.on('resize', handler);
                scope.$on("$destroy",function(){
                    windowEl.off('resize',handler)
                });

			}
		}
	});

	itcApp.directive('appStoreLangsModal',['appDetailsService','$timeout','$filter','$rootScope','$sce',function(appDetailsService,$timeout,$filter,$rootScope,$sce){
		return {
			scope: {
				'showModal':'=',
				'l10n':'='
			},
			templateUrl: getGlobalPath('/itc/views/directives/app-store-langs-modal.html'),
			link: function($scope, element, attrs) {
				$scope.chosenStoreFront = {
						'selection':""
					};
					
				var init = function() {
					
					$scope.dataLoading = true;
					$scope.sortASC = true;
					appDetailsService.getStoreFrontLangs().then(function(data){
						if(data.data) {
							$scope.storeFrontLangs = data.data;
							$scope.dataLoading = false;
							$scope.storeFrontLangs = $filter('orderBy')($scope.storeFrontLangs, function(storeFront){
                                	return $scope.l10n.interpolate('ITC.region.' + storeFront.region)     
							});
							$scope.chosenStoreFront.selection = $scope.storeFrontLangs[0].region;
							$scope.updateTable();
						}
					});
				}
				$scope.updateTable = function() {
					$timeout(function() { // timeout because of $apply(), because we're already in a digest loop. 
                    	$scope.chosenStoreFrontLangs = _.findWhere($scope.storeFrontLangs, {region: $scope.chosenStoreFront.selection});
                    	$scope.chosenStoreFrontLangs.storeFronts = $filter('orderBy')($scope.chosenStoreFrontLangs.storeFronts, function(store){
                                        return $scope.l10n.interpolate('ITC.country.' + store.country)
                                    },!$scope.sortASC);
                    	$scope.$apply();
                    });
				}
				$scope.$watch('chosenStoreFront',function(){
					if ($scope.storeFrontLangs !== undefined) {
						$scope.updateTable();
					}
				},true);

				$scope.closeModal = function() {
					$scope.showModal = false;
				}
				$scope.toLowerCase = function(string) {
					return string.toLowerCase();
				}
				$scope.changeSort = function() {
					$scope.sortASC = $scope.sortASC?false:true;
					$scope.updateTable();
				}
				$scope.renderHtml = function(html_code) {
		    		return $sce.trustAsHtml(html_code);
				};

				$scope.$watch('showModal',function(){
					init();
					$rootScope.$broadcast('closepopups',true);
				});
			}
		}
	}]);

	/*
    See users_roles -> edit user notifications for use. styles found in _chosen.scss
    */
    itcApp.directive('chosenSelectApps',function($timeout){
        return {
            scope: {
                ngModel: "=",
                fullList: "=",
                callbackFunction: '&',
                emptyPlaceholderText: '@',
                disableDropdown: "=?",
                l10n: "="
            },
            link: function(scope,element,attrs) {
            	var hasPlaceholder = false;
            	var hasWatchModel = false;

                scope.$watch('ngModel',function(newVal,oldVal) {

                    if (newVal !== undefined && hasWatchModel === false) {
                        hasWatchModel = true;
                        scope.checkvalues();
                    }
                    if (!($(newVal).not(oldVal).length == 0 && $(oldVal).not(newVal).length == 0)) {
                        if (scope.callbackFunction !== undefined) {
                            $timeout(function() {
                                scope.$apply(scope.callbackFunction())
                            });
                        }
                        element.trigger("chosen:updated");
                    }
                },true);

                scope.$watch("disableDropdown",function(val){
                	if (val) {
                		element.prop('disabled',true).trigger("chosen:updated");
                	} else {
                		element.prop('disabled',false).trigger("chosen:updated");
                	}

                });
                
                scope.$watch('emptyPlaceholderText',function(newval,oldval){
                	hasPlaceholder = true;
                	scope.checkvalues();
                });

                scope.checkvalues = function() {
                	if (hasPlaceholder && hasWatchModel) {
                		scope.setupChosen();
                	}
                }

                scope.setupChosen = function() {
                	
                	scope.processDups();

                    element.chosen({
                        width:"100%",
                        placeholder_text_multiple: scope.emptyPlaceholderText
                    })
                    .on("change",function(event, change){
                        var select_el = this;
                        var chosen_el = $(this).next();
                        if (change.hasOwnProperty("selected")) {
							var selectedAdamId = scope.fullList[change.selected].adamId;
							var wasMixed = _.findWhere(scope.ngModel,{'adamId':selectedAdamId});
							if (wasMixed.isMixed) {
								wasMixed.isMixed = false;
								scope.fullList[change.selected].isMixed = false;
								var num = change.selected;
								num++;
								if (chosen_el.find(".search-choice-close[data-option-array-index=" + num + "]").size() > 1) {
									var dups = chosen_el.find(".search-choice-close[data-option-array-index=" + num + "]").parents('.search-choice');
									chosen_el.find(".search-choice-close[data-option-array-index=" + num + "]").parents('.search-choice').removeClass('mixed');
									dups[0].remove();
								}
							}
                        }
                    })
                    .on("chosen:add_choice", function(event, chosen) {
                        // handle images
                        scope.processDups();
                        var chosen_option_el = chosen.choice;
                        if ( ! chosen_option_el.data("image-added")) {
	                        var dataKey = chosen_option_el.find(".search-choice-close").attr("data-option-array-index");
	                        var iconstyle = "";

	                        var platformList = "";
                        	if (dataKey > 2 && scope.fullList[dataKey-2].dup !== undefined && scope.fullList[dataKey-2].dup) {
	                            angular.forEach(scope.fullList[dataKey-2].platforms,function(platform,key) {
	                            	if (key > 0) {
	                            		platformList += ", ";
	                            	}
	                            	platformList += scope.l10n['ITC.platformForDropdowns.'+ platform.toLowerCase()];
	                            });
                            }
                            var platformString = " <span class='platformType'>(" + platformList + ")</span>";

	                    	if (dataKey > 2 && scope.fullList[dataKey-2].largeIconUrl !== null) {
	                    		if (scope.fullList[dataKey-2].iconPlatform === "AppleTVOS") {
		                        	iconstyle = "tv-placeholder-sml ";
		                        } else {
		                        	iconstyle = "ios7-style-icon ";
		                        }
	                            var srcVal = scope.fullList[dataKey-2].largeIconUrl;
	                            if (platformList !== "") chosen_option_el.append(platformString);
	                            chosen_option_el.wrapInner( "<div class='text'></div>" );
	                            chosen_option_el.prepend("<div style='background-image:url(\"" + srcVal + "\")' class='" + iconstyle + " icon-16 icon'></div>");
	                    	} else if (dataKey > 2) {
	                    		
		                        if (scope.fullList[dataKey-2].iconPlatform === "AppleTVOS") {
		                        	iconstyle = " tv-placeholder-sml"
		                        }
	                            var div = $("<div class='iconfont-icon-placeholder icon-16" + iconstyle + "'></div>");
	                            if (platformList !== "") chosen_option_el.append(platformString);
	                            chosen_option_el.wrapInner( "<div class='text'></div>" );
	                            chosen_option_el.prepend(div);
	                        }
	                    }
	                    //handle mixed...
	                    angular.forEach(scope.fullList,function(app,key){
	                    	if (scope.ngModel.indexOf(app) >= 0 && app.isMixed) {
	                    		key++;
								chosen_option_el.find(".search-choice-close[data-option-array-index=" + key + "]").parents('.search-choice').addClass("mixed");	
	                        }
	                    });

                    })
                    .on("chosen:showing_dropdown chosen:filter", function(event, chosen) {
                    	scope.processDups();
                        // handle images
                        var select_el = this;
                        chosen.chosen.dropdown.find("LI[data-option-array-index]").each(function(count) {
                        	var index = $(this).attr('data-option-array-index');
                        	var index = parseInt(index);
                        	var tempindex;
                        	if (index === 1) {
                        		tempindex = 0;
                        	} else if (index > 1) { //subtract one to account for rule line group divider
                        		tempindex = index-2;
                        	} else {
                        		tempindex = index;
                        	}

                        	var chosen_option_el = $(this);

                        	if (chosen_option_el.data("image-added")) return;
                            chosen_option_el.data("image-added", true);

                            var iconstyle = "";
                            if (scope.fullList[tempindex].showicon) {
                            	var platformList = "";
                            	if (scope.fullList[tempindex].dup !== undefined && scope.fullList[tempindex].dup) {
		                            angular.forEach(scope.fullList[tempindex].platforms,function(platform,key) {
		                            	if (key > 0) {
		                            		platformList += ", ";
		                            	}
		                            	platformList += scope.l10n['ITC.platformForDropdowns.'+ platform.toLowerCase()];
		                            });
	                            }
	                            var platformString = " <span class='platformType'>(" + platformList + ")</span>";

	                        	if (scope.fullList[tempindex].largeIconUrl !== null) {
	                        		if (scope.fullList[tempindex].iconPlatform === "AppleTVOS") {
			                        	iconstyle = "tv-placeholder-sml ";
			                        } else {
			                        	iconstyle = "ios7-style-icon ";
			                        }
	                                var srcVal = scope.fullList[tempindex].largeIconUrl;
	                                if (platformList !== "") chosen_option_el.append(platformString);
	                                chosen_option_el.wrapInner( "<div class='text'></div>" );
	                                chosen_option_el.prepend("<div style='background-image:url(\"" + srcVal + "\")' class='" + iconstyle + "icon-25 icon'></div>");
	                        	} else {
			                        if (scope.fullList[tempindex].iconPlatform === "AppleTVOS") {
			                        	iconstyle = " tv-placeholder-sml"
			                        }
	                                var div = $("<div class='iconfont-icon-placeholder icon-25" + iconstyle + "'></div>");
	                                if (platformList !== "") chosen_option_el.append(platformString);
	                                chosen_option_el.wrapInner( "<div class='text'></div>" );
	                                chosen_option_el.prepend(div);
	                            }

	                            

	                        } else if (scope.ngModel.length === 0) {
	                        	chosen_option_el.addClass('result-selected');
	                        }

	                        if (scope.fullList[tempindex].isMixed) {
	                        	chosen_option_el.removeClass("result-selected").addClass("active-result");
	                        }
                        });
                    });
				}

				scope.processDups = function() {
					var discoveredNames = {};
					angular.forEach(scope.fullList,function(item,key){
						if (discoveredNames.hasOwnProperty(item.appName)) {
							discoveredNames[item.appName].dup = true;
							item.dup = true;
						}
						else {
							discoveredNames[item.appName] = item;
						}
					});
				}

            }
        }
    });


	    /*
    See users_roles -> edit user notifications for use. styles found in _chosen.scss
    */
    itcApp.directive('chosenSelectUsers',function($timeout){
        return {
            scope: {
                ngModel: "=",
                fullList: "=",
                callbackFunction: '&',
                emptyPlaceholderText: '@',
                l10n: "="
            },
            link: function(scope,element,attrs) {
            	var hasPlaceholder = false;
            	var hasWatchModel = false;
            	var chosenCreated = false;

                scope.$watch('ngModel',function(newVal,oldVal) {
                	element.trigger("chosen:updated");
                    if (newVal !== undefined && hasWatchModel === false) {
                        hasWatchModel = true;
                        scope.checkvalues();
                    }
                    if (!($(newVal).not(oldVal).length == 0 && $(oldVal).not(newVal).length == 0)) {
                        if (scope.callbackFunction !== undefined) {
                            $timeout(function() {
                                scope.$apply(scope.callbackFunction())
                            });
                        }
                    }
                    if (chosenCreated) {
                    	element.trigger("chosen:updated");
                    }
                },true);
                
                scope.$watch('emptyPlaceholderText',function(newval,oldval){
                	hasPlaceholder = true;
                	scope.checkvalues();
                });

                scope.checkvalues = function() {
                	if (hasPlaceholder && hasWatchModel) {
                		scope.setupChosen();
                		chosenCreated = true;
                	}
                }

                scope.setupChosen = function() {
                    element.chosen({
                        width:"100%",
                        placeholder_text_multiple: scope.emptyPlaceholderText
                    })
                    .on("chosen:showing_dropdown chosen:filter", function(event, chosen) {
                        // handle images
                        var select_el = this;
                        chosen.chosen.dropdown.find("LI[data-option-array-index]").each(function(index) {
                        	var chosen_option_el = $(this);
                        	if (chosen_option_el.data("role-added")) return;
                            chosen_option_el.data("role-added", true);
                            var roleList = "";
                            var fullListIdx = parseInt(chosen_option_el.attr("data-option-array-index"));
                            if (fullListIdx > 1) {
                            	fullListIdx = fullListIdx-2;
	                            angular.forEach(scope.fullList[fullListIdx].roles,function(role,key) {
	                            	if (key > 0) {
	                            		roleList += ", ";
	                            	} 
	                            	roleList += scope.l10n['ITC.role.'+ role +'.label'];
	                            });
	                            if (roleList !== "") {
		                            chosen_option_el.wrapInner( "<div class='username-chosen'></div>" );
		                            chosen_option_el.append("<div class='roles-chosen'>" + roleList + "</div>");

		                        } else if (scope.ngModel.length === 0) {
			                        chosen_option_el.addClass('result-selected');
			                    }
			                }
                        });
                    });
				}

            }
        }
    });



    // Duplicate of itcShortenedList extended to use object, with specified value
    itcApp.directive('shortenedAppListObject', function($timeout){
        return {
            restrict: 'A',
            scope: {
                elementsObject: "=",
                numToShow: "=",
                //idForPopover: "=",
                //andText: "@",
                numMoreText: "@",
                fullAppList: "=",
                altFunction: "&"

            },
            templateUrl: getGlobalPath('/itc/views/directives/shortened-app-list-object-template.html'),
            link: function(scope,element,attrs){
                //create array 
                scope.$watch('elementsObject',function(val){
                	if (val) {
	                    scope.numInPopover = scope.elementsObject.length - scope.numToShow;
	                    scope.andMoreText = scope.numMoreText.replace("@@number@@",scope.numInPopover);
	                    scope.elsToShow = scope.elementsObject.slice(0, scope.numToShow);
	                    scope.extras = scope.elementsObject.slice(scope.numToShow);


	                    //andMoreText }}</span>ITC.ItcUsers.appAccess.AppList.AndMoreText
	                }
                });
                scope.callBackFunction = function() {
                	if (scope.altFunction) {
                		scope.altFunction();
                	}
                }

				scope.getAppIcon = function(adamId) {
		            var app = _.findWhere(scope.fullAppList,{'adamId':adamId});
		            if (app !== undefined) {
		                return app.largeIconUrl;
		            } else {
		                return null;
		            }
		        }
		        scope.getAppName = function(adamId) {
		            var app = _.findWhere(scope.fullAppList,{'adamId':adamId});
		            //return app.appName;
		            if (app !== undefined) {
		                return app.appName;
		            } else {
		                return null;
		            }
		        }
		        scope.isTVIcon = function(adamId) {
		        	var app = _.findWhere(scope.fullAppList,{'adamId':adamId});
		        	if (app !== undefined) {
		        		if (app.iconPlatform === "AppleTVOS") {
		        			return true;
		        		} else {
		        			return false;
		        		}
		        	}
		        }

            }
        }
    });

    // Provided a loc key root and a device name will return a full loc key
    itcApp.factory('getLocKeyFromRootAndDevice', function(){
    	return function(locRoot, device, useDeviceGroupName){
	    	var locSuffix = device;
	    	var iphoneRegEx = /^iphone/;
	    	var ipadRegEx = /^ipad/;
	    	var messagesRegEx = /^messages/;

	        if (useDeviceGroupName !== false) {
	            if (iphoneRegEx.test(device) || ipadRegEx.test(device)) locSuffix = 'iosSizes';
	        }
	        else {
	            if (iphoneRegEx.test(device) && !messagesRegEx.test(device)) locSuffix = 'iphone';
	            else if (ipadRegEx.test(device) && !messagesRegEx.test(device)) locSuffix = 'ipad';
	        }

	        var locKey = locRoot + locSuffix;

	        return locKey;
    	}
    });

});
