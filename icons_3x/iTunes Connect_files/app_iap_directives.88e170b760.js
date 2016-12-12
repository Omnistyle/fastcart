define(['sbl!app'], function (itcApp) {

	itcApp.directive('itcScrollingTitle', function() {
		return {
			link: function(scope,element,attrs) {
				var fixTitleBar = function(){
                	if (element.hasClass('fixedheader')) {
						
						var fullHeaderWidth = element.outerWidth(true);
						var buttonsWidth = element.find('.formActionButtons').outerWidth(true);
						var titleWidth = element.find('.title').outerWidth(true);
						var versWidth = element.find('.version').outerWidth(true);

						var headerWidthAvailableForTitleAndVersion = fullHeaderWidth - buttonsWidth - 70; //adjust for paddings
						var maxWidthAvailableForTitle = headerWidthAvailableForTitleAndVersion - versWidth;
						var widthAvailableForTitleText = maxWidthAvailableForTitle - 40; //adjust for icon

						element.find('.title').css('maxWidth',maxWidthAvailableForTitle);
						element.find('.titletext').css('maxWidth',widthAvailableForTitleText);
						element.find('.page-subnav').fadeOut(100);
					} else {
						element.find('.page-subnav').fadeIn(100);
					}
                }

				fixTitleBar();

				$(window).on('scroll',fixTitleBar);

				$(window).on('resize',fixTitleBar);

				scope.$on("$destroy",function(){
                    $(window).off('scroll',fixTitleBar);
                    $(window).off('resize',fixTitleBar);
                });

                scope.$watch(function(){
                	return element.find('.titletext').html()
                },function(newVal,oldVal){
                	if (newVal !== oldVal) {
                		fixTitleBar();
                	}
                });
                scope.$watch(function(){
                	return element.find('.version').html()
                },function(newVal,oldVal){
                	if (newVal !== oldVal) {
                		fixTitleBar();
                	}
                });
			}
		}
	});

	itcApp.directive('hideItems',function($window){
		return {
			link: function(scope,element,attrs) {

				scope.$watch(function(){
					var nothideableElements = element.find('.nothideable');
					var updated = "";
					angular.forEach(nothideableElements,function(item){
						updated = updated + $(item).offset().top;
					});
					return updated;
				},function(val,oldval){
					if (val !== oldval) {
						scope.fixSidebar();
					}
				});

				scope.$watch(function(){
					var hideableElements = element.find('.hideable');
					var updated = "";
					angular.forEach(hideableElements,function(item){
						updated = updated + $(item).html;
					});
					return updated;
				},function(val,oldval){
					if (val !== oldval) {
						scope.fixSidebar();
					}
				});

				scope.$watch(function(){
					//slightly different than above - classes missing "nothideable"
					var nothideableElements = element.find("li:not('.hideable')");
					var updated = "";
					angular.forEach(nothideableElements,function(item){
						updated = updated + $(item).offset().top;
					});
					return updated;
				},function(val,oldval){
					if (val !== oldval) {
						scope.fixSidebar();
					}
				});

				angular.element($window).on('resize',function(){
					scope.fixSidebar();
				});

				scope.sidebarIsAllSet = function(hideableElements,elementsMustShow) {
					if (hideableElements.length > 0) {
						var isElementShowing = true;
						angular.forEach(elementsMustShow,function(item){
							if (!scope.isInViewPort(item)) {
								isElementShowing = false;
							}
						});
						return isElementShowing;
					} else {
						return true;
					}
				}

				scope.isInViewPort = function(item) {
					var top_of_element = $(item).offset().top;
				    var bottom_of_element = $(item).offset().top + $(item).outerHeight();
				    var bottom_of_screen = $(window).scrollTop() + $(window).height();
				    if(bottom_of_screen > bottom_of_element){
				        return true;
				    } else {
				        return false;
				    }
				}

				scope.fixSidebar = function() {
					var allset = false;
					//element.find('.hideable').removeClass("hidden");
					$(element).find('.hidden').removeClass("hidden");
					while(!allset) {
						var hideableElements = element.find('.hideable').not('.hidden');
						var nothideableElements = element.find('.nothideable');
						allset = scope.sidebarIsAllSet(hideableElements,nothideableElements);
						if (!allset) {
							var key = hideableElements.length - 1;
							$(hideableElements[key]).addClass("hidden");
						}
					}
				}
				
				scope.fixSidebar();
				
				scope.$on("$destroy",function(){
                    angular.element($window).off('resize');
                });

			}
		}
	});

});