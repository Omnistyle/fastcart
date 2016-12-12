define([], function () {

    var global_directives = angular.module('global_directives', []);

    // global_directives.directive('mainNavSizeFix',function(){
    //     return {
    //         scope: {
    //             'mainNavSizeFix': '='
    //         },
    //         link:function(scope,element,attrs) {
    //             scope.$watch('mainNavSizeFix',function() {
    //                 if (scope.mainNavSizeFix < 6) {
    //                     var newWidth = (125 * scope.mainNavSizeFix) + 2;
    //                     element.width(newWidth);
    //                 }
    //             }); 
    //         }
    //     }
    // });
    
    
    /*
        Tooltip helper function
    */
    var tooltips = {
        hideAll: function() {
            // Clear out any tooltips that are mid-transition (e.g. in the process of disappearing)
            $('.disappearing').removeClass('disappearing');
            
            // Find all open tooltips, and close them
            var tips = $('.open')
                .removeClass('open')
                .addClass('disappearing');
                        
            setTimeout( function() { tips.removeClass('disappearing') }, 300);
        }
    };

    /*
    This directive is placed on the body to capture clicks off a menu ("hasPopOver")
    */
    global_directives.directive('itcDocumentClick',function(){
        return {
            link: function(scope,element,attrs){
                
                element.bind('click',function(e){
                    if ($(e.target).parents('.hasPopOver, [fixed-position-tooltip]').length <= 0) {
                        // $('.open').removeClass('open');
                        tooltips.hideAll();
                    }
                });
                element.find('#header').click(function(e){
                    if ($(e.target).parents('.hasPopOver').length <= 0 && $(e.target).parents('a').length <= 0) {
                        $("html,body").stop().animate({ 
                         scrollTop: 0
                        },1000);
                        return false;
                    }
                });
                scope.$on('closepopups',function(event,data){
                    if (data) {
                      // $('.open').removeClass('open');  
                      tooltips.hideAll();
                    }
                });

                scope.$on('closepopup',function(event,id){
                    if (id) {
                      $('#' + id + '.open').removeClass('open');  
                    }
                });

                scope.$on('$locationChangeStart', function (event, next, current) {
                   element.find('.open').removeClass('open');
                });
            }
        }
    });

    global_directives.directive('animationControl',function($animate) {
        return {
            link: function(scope, element, attrs) {
                $animate.enabled(element, false);
                var mainwrapper = element.find('#main-wrapper-loader');
                var mainuiview = element.find('#main-ui-view');
                $animate.enabled(mainwrapper,false);
                $animate.enabled(mainuiview,false);
            }
        }
    });

    global_directives.directive('centerOnPage',['$timeout',function($timeout){
        return {
            scope: {
                centerOnPage: '='
            },
            link: function(scope,element,attrs) {
                var centerElement = function() {
                    var bodyHeight = window.innerHeight;
                    var elementHeight = element.outerHeight(true);
                    var headerHeight = $('#header').outerHeight(true);
                    // var footerHeight = $('#footer').outerHeight(true);
                    var footerHeight = 85;
                    var centerAvailable = bodyHeight - footerHeight - headerHeight - elementHeight;
                    var topVal = (centerAvailable/2) + headerHeight;
                    var marginLeftAdjustment = (element.width()/2)*-1;
                    if (topVal < 50) {
                        element.css('position','relative');
                        element.css('top','0');
                        element.css('left','50%');
                        element.css('marginLeft',marginLeftAdjustment)
                    } else {
                        element.css('position','absolute'); 
                        element.css('top',topVal);
                        element.css('left','50%');
                        element.css('marginLeft',marginLeftAdjustment)
                    }
                    $timeout( function() {
                        element.css('opacity','1');
                    }, 50)
                }
                
                centerElement();
                
                $(window).on('resize',centerElement);

                scope.$on("$destroy",function(){
                    $(window).off('resize',centerElement)
                });

                scope.$watch('centerOnPage',function(val){
                    if (val === true) {
                        centerElement();
                    }
                });
                // $timeout(function(){
                //     centerElement();
                // },1000);
            }
        }
    }]);


    /*
    apply this directive to a div you want to have fixed at the top. NOTE - this div should NOT be in a div that has relative positioning.
    (It may need to be outside of any wrappers as well)
    */
    global_directives.directive('itcFixedHeader', function($window){
        return {
            link: function(scope, element, attrs) {
   
                var isChecking = false;
                var windowEl = angular.element($window);

                var checkHeader = function() {
                    if (isChecking) return;
                    isChecking = true;
                    var positionFromTop = 0;
                    var originalOffset;
                    var placeholderid = element.attr('id') + "_placholder";

                    // get distance from top of element... if we have a placeholder - then get distance from top to placeholder..
                    if ($('#'+placeholderid).length <= 0) {
                        originalOffset = element.offset().top
                    } else {
                        originalOffset = $('#'+placeholderid).offset().top;
                    }
                    /*
                    when the window scrolls past the offset of the element, add placeholder (if we don't already have one.) and set it's height to the height of the original element.
                    ELSE - if we have a placeholder - remove it - and remove classname
                    */
                    if ($(window).scrollTop() > originalOffset && !element.hasClass('fixedheader')) {
                        if ($('#'+placeholderid).length <= 0) {
                           element.after('<div id="'+placeholderid+'"></div>');
                           $('#'+placeholderid).height(element.outerHeight()).width('100%'); 
                        }
                        element.addClass('fixedheader');
                        element.css('top',positionFromTop);
                    } 
                    else if ($(window).scrollTop() <= originalOffset && element.hasClass('fixedheader')) {
                        if ($('#'+placeholderid).length > 0) {
                            $('#'+placeholderid).remove();
                        } 
                        element.removeClass('fixedheader');
                    }

                    isChecking = false;
                };

                var handler = scope.$apply.bind(scope, checkHeader)
                windowEl.on('scroll', handler);

                scope.$on("$destroy",function(){
                    windowEl.off('scroll',handler)
                });

                scope.$watch(function(){
                    element.bind('click',function(e){
                        //don't scroll to top when clicking popups or buttons...                            
                        if ($(e.target).parents('.hasPopOver').length <= 0  && !$(e.target).is('button') && $(e.target).parents('button').length <= 0) {
                            if (element.hasClass('fixedheader')) {
                                $("html,body").stop().animate({ 
                                     scrollTop: 0
                                },1000);
                                return false;
                            }
                        }
                    });
                });
            }
        };
    });

    /*
    Description: Attribute that will pop up an associated menu.
    Usage: <a href="" itc-pop-up-menu="mainNav">Menu</a>
    <div id="mainNav">
    This is the popup
    </div>
    **Make sure to include the class "hasPopOver" somewhere in a parent wrapper
    */ 
    global_directives.directive('itcPopUpMenu',function() {
        return {
            restrict: 'A',
            scope: {
                itcPopUpMenu: "@",
                eventType: "@",
                itcPopUpMenuCallback: '&'
            },
            link: function(scope,element,attrs) {
                if (!scope.eventType) scope.eventType = 'click';

                element.bind(scope.eventType, function() {
                    //close other menus
                    $('.open').each(function(){
                        var widenMenuId = scope.itcPopUpMenu+"_widenmenu";
                        if ($(this).attr('id') !== scope.itcPopUpMenu && $(this).attr('id') !== widenMenuId) {
                            $(this).removeClass('open');
                        }
                    });
                    
                    var tip = $("#"+scope.itcPopUpMenu);
                    var menu = $("#"+scope.itcPopUpMenu+"_widenmenu");
                    
                    if (tip.hasClass('open')) {
                        
                        tip.removeClass('open')
                           .addClass('disappearing');
                        menu.removeClass('open');
                                
                        setTimeout( function() {
                            tip.removeClass('disappearing');
                        }, 300)

                    } else {

                        if (scope.itcPopUpMenuCallback) {
                            scope.itcPopUpMenuCallback();
                        }
                        
                        tip.addClass('open');
                        menu.addClass('open');
                        
                        // Ensure the tooltip's height is an even number of pixels
                        // to avoid placing it on a half-pixel
                        if (tip.innerHeight() % 2 === 1) tip.css('paddingBottom', (
                            ( parseInt(tip.css('paddingBottom'),10)+1) + 'px'
                        ));
                        
                        // For centered tooltip, ensure its pixel-width is an even number
                        // (to fix the blurriness caused by sub-pixel transforms in Webkit)
                        setTimeout( function() {
                            var tipWidth = tip.width();
                            if (tipWidth % 2 !== 0 && /centerPop/i.test(tip.attr('class')) ) {
                                tip.width( tipWidth + 1 + 'px' );
                            }
                        }, 100);
                    }
                });

                

                /*scope.close = function() {
                    element
                }*/
            }
        };
    });

    /*
    Description: similar to itcPopUpMenu - but opens menu on hover of main element (and closes on mouseleave...)
    */
    global_directives.directive('itcHoverMenu',function(){
        return {
            restrict: 'A',
            scope: {
                'itcHoverMenu': '@',
                'closeHoverMenu': '=' //true or false
            },
            link: function(scope,element,attrs) {
                element.bind('mouseenter',function(){
                    $('#'+scope.itcHoverMenu).addClass('open');
                });
                element.bind("mouseleave",function(){
                    $('#'+scope.itcHoverMenu).removeClass('open');
                });
                if (scope.closeHoverMenu !== undefined && scope.closeHoverMenu !== null) {
                    scope.$watch('closeHoverMenu',function(val){
                        if (val) {
                            $('#'+scope.itcHoverMenu).removeClass('open');
                            scope.closeHoverMenu = false;
                            //also adding in close popups as we...
                            $('.open').removeClass('open');
                        }
                    });
                }
            }
        }
    });

    /*
    Description: Attribute that will create a list of nav items (ie. for tab nav or breadcrums)
    Usage: <div itc-list-nav="JSONofLinks" itc-list-nav-class="classname"></div>
    Where JSONofLinks is a json structured like: [{"link": "/page.html", "text": "page link","external":true,"current":true},
    {"link": "/page2.html", "text": "page 2 link"}]
    "text" is only item that is required
    */
    global_directives.directive('itcListNav',function(){
        return {
            restrict: 'A',
            replace: true,
            scope: {
                itcListNav: '=',
                itcListNavClass: '@'
            },
            template:  '<ul ng-class="itcListNavClass" role="menu">' +
                        '<li role="menuitem" ng-repeat="itcitem in itcListNav track by $index" ng-class="isCurrent(itcitem)">' +
                        '<a href="{{itcitem.link}}" ng-show="isExternal(itcitem)" target="_self">{{itcitem.text}}</a>' +
                        '<a href="{{itcitem.link}}" ng-show="hasLink(itcitem) && !isExternal(itcitem)">{{itcitem.text}}</a>' +
                        '<span ng-hide="hasLink(itcitem)">{{itcitem.text}}</span>' +
                        '</li>' +
                        '</ul>',
            link: function(scope,element,attrs) {
               scope.hasLink = function(theitem) {
                    return theitem.link !== undefined && theitem.link!==""?true:false;
                }
                scope.isExternal = function(theitem) {
                    return theitem!=='undefined'&&theitem.external !== undefined &&theitem.link!==""?true:false;
                }
                scope.isCurrent = function(theitem) {
                    return theitem!=='undefined'&&theitem.current!=='undefined'&&theitem.current?'current':'';
                }
                scope.$watch('itcListNav',function(){
                    //console.log("list nav length"+scope.itcListNav.length);
                    if (scope.itcListNav !== undefined && scope.itcListNav.length === 1) {
                        element.find('li').addClass('single');
                    }
                });
            }
        };
    });

    /*
    Applies height of mainnav to a placeholder div, creates additional div for faded background
    */
    global_directives.directive('itcFixedMainNav',['$rootScope',function($rootScope) {
        return {
            scope: true,
            link: function(scope,element,attrs) {
                    /*console.log($rootScope.wrapperclass);
                    scope.$watch('wrapperclass',function(){
                        console.log("wrapperclass: "+$rootScope.wrapperclass)
                    });*/
                    
                    function setPlaceHolderSize() {
                        if ($rootScope.wrapperclass != "nonfixedheader") {
                            var theHeight = element.outerHeight(true);
                            if ($("#headerPlaceholder").length <= 0) {
                                var placeholder = '<div id="headerPlaceholder"></div>';
                                element.after(placeholder);
                            }
                            $("#headerPlaceholder").height(theHeight);
                        } else {
                            $("#headerPlaceholder").remove();
                        }
                    }

                    setPlaceHolderSize();

                    $(window).on('resize',setPlaceHolderSize)
                    scope.$on("$destroy",function(){
                        $(window).off('resize',setPlaceHolderSize);
                    });
                    scope.$watch(function(){
                        setPlaceHolderSize();
                    });

                    
            }
        }
    }]);

    global_directives.directive('itcModal',['$timeout','$animate',function($timeout,$animate){
        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            scope: {
                show: "=show",
                onShow: "&onShow",
                onHide: "&onHide",
                noFocus: "@?",
                hasFlex: "=flex",
                ignoreEscapeKey: "@?"
            },
            template:   "<div class='ng-modal' ng-show='show' ng-class=\"{'has-flex':hasFlex}\">\
                           <div class='ng-modal-overlay'>\
                               <div class='ng-modal-wrapper' role='dialog'>\
                                   <div class='modal-dialog' ng-style='dialogStyle' ng-transclude></div>\
                               </div>\
                           </div>\
                        </div>",
            link: function(scope,element,attrs) {
                
                // Use a custom namespace for event handlers
                scope.namespace = '.modalListener';
                
                scope.dialogStyle = {};
                //scope.wrapperStyle = {};

                if (scope.noFocus === undefined || scope.noFocus.toLowerCase() === "false") {
                    scope.noFocus = false;
                } else if (scope.noFocus === "true") {
                    scope.noFocus = true;
                }
                
                if (attrs.width) {
                    scope.dialogStyle.width = attrs.width;
                    var newwidth = parseInt(attrs.width);
                }
                
                // Hide the modal
                scope.hideModal = function() {
                    if (scope.show !== false) {
                        scope.show = false;
                        $timeout( function() { scope.$apply() }, 0)
                    }
                };
                
                // If desired, make the primary button show AJAX "in progress" state after clicking
                var primaryBtn = $(element).find('.modal-buttons').find('.primary');
                if (primaryBtn.length > 0) {
                    btn = $(primaryBtn[0]);
                    if (btn.attr('show-loader') !== undefined) {
                        btn.click( function() {
                            $(this).addClass('in-progress')
                        })
                    }
                }

                $animate.enabled(element, false);
                
                // Attach "close" handler to any button with `close-modal` attribute
                $(element).find( '[close-modal]' ).click( function() {
                    scope.hideModal();
                });
                $(element).on( 'click', '[close-modal]', function() {
                    $timeout( scope.hideModal );
                });
                
                scope.$watch('show',function( isShown, wasShown ){
                    
                    if (isShown === true) {
                        $('body').addClass('overflowHidden');
                        scope.bindListeners();
                        if (scope.onShow && typeof scope.onShow === 'function') {
                            scope.onShow();
                        }
                    }
                    else if (isShown === false && wasShown !== undefined && wasShown !== false) { // don't invoke if "false" is the starting value for show
                        $('body').removeClass('overflowHidden');
                        scope.unbindListeners();
                        if (scope.onHide && typeof scope.onHide === 'function') {
                            scope.onHide();
                        }
                    }
                });

                scope.bindListeners = function() {
                    var textFields = element.find('input[type=text],textarea,select').not(":hidden");

                    if (!scope.noFocus) {
                        if (textFields.length > 0) $(textFields[0]).focus()
                    } else {
                        $(':focus').blur().removeClass('hasVisited');
                    }   
                    
                    //manage tabbing when we're showing a modal - only allow tabbing to fields in the modal
                    //and only when a modal is showing
                    $(document).bind( 'keydown' + scope.namespace, function(e) {
                        var keyCode = e.keyCode || e.which;
                        if (keyCode == 9 && scope.show === true) {
                            var textFields = element.find('input[type=text],textarea,select').not(":hidden");
                            var thisIndex = textFields.index($(":focus"));
                            if (textFields.length > 0) {
                                if (e.shiftKey) {
                                    if (thisIndex > 0) {
                                        $(textFields[thisIndex-1]).focus();
                                    } else {
                                        $(textFields[textFields.length-1]).focus();
                                    }
                                } else {
                                    if (thisIndex < (textFields.length - 1) && thisIndex >= 0) {
                                        $(textFields[thisIndex+1]).focus();
                                    } else {
                                        $(textFields[0]).focus();
                                    }
                                }
                            }
                            return false;
                        }
                    });
                    // Close the modal when we press ESC key, unless we've disabled this feature
                    if (scope.ignoreEscapeKey === undefined || scope.ignoreEscapeKey === false) {
                        scope.keyup = $(document).bind( 'keyup' + scope.namespace, function(e) {
                            var keyCode = e.keyCode || e.which;
                            if (keyCode === 27) scope.hideModal();
                        });
                    }
                    // Close the modal if we click anywhere in the background
                    /*scope.clickToClose = $(element).find('.ng-modal-overlay').bind( 'click' + scope.namespace, function(e) {
                        var target = $(e.target).attr('class');
                        // Valid click targets: .ng-modal-overlay, .ng-modal-wrapper
                        if (/modal-overlay|modal-wrapper/i.test( target )) {
                            scope.hideModal();
                        }
                    });*/

                }
                
                // Clean up after ourselves by deleting events in this namespace
                scope.unbindListeners = function() {
                    $(document).unbind(scope.namespace)
                     $(element).unbind(scope.namespace)
                }
                
            }
        }
    }]);

    global_directives.directive('itcLightbox',['$timeout',function($timeout){
        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            scope: {
                show: "="
            },
            template:   "<div class='full-lightbox' ng-show='show' >" +
                        "   <div class='lightboxCloseButton' ng-click='close()'></div>" +
                        "   <div ng-transclude></div>" +
                        "</div>",
            link: function(scope,element,attrs){
                scope.close = function() {
                    scope.show = false;
                };

                // copying blindly from itcModal directive 
                scope.$watch('show',function( isShown, wasShown ){
                    if ( isShown === true ) {
                        $('body').addClass('overflowHidden');
                    }
                    else if (isShown === false && wasShown !== undefined && wasShown !== false) { // don't invoke if "false" is the starting value for show
                        $('body').removeClass('overflowHidden');
                    }

                });

            }
        }
    }]);

    // Directive to show first num-to-show elements of elements-array, and display the rest in a popup.
    global_directives.directive('itcShortenedList', function($timeout, $rootScope, $compile){
        return {
            restrict: 'A',
            scope: {
                elementsArray: "=",
                numToShow: "=",
                idForPopover: "="
            },
            template:   
                "<div><div class=\"hasPopOver\">" +  
                "<div class=\"rightPopDown multiLevelNav\" id=\"shortenedList{{idForPopover}}\">" +       
                "<ul><li class=\"checkable-menu-item\" ng-repeat=\"extra in extras\">{{extra}}</li></ul>" +           
                "</div></div></div>",
            link: function(scope,element,attrs){
                if (scope.elementsArray) {
                    scope.numInPopover = scope.elementsArray.length-scope.numToShow;
                    var arr = scope.elementsArray.slice(0, scope.numToShow);
                    scope.elsToShow = arr.join($rootScope.l10n.interpolate( "ITC.common.delimiterWithSpace"));
                    scope.extras = scope.elementsArray.slice(scope.numToShow);
                    var localizedText = $rootScope.l10n.interpolate( "ITC.ShortenedList.text", { elsToShow: scope.elsToShow,  numInPopover: scope.numInPopover, idForPopover: scope.idForPopover} );
                    var view = $compile('<div>' + localizedText + '</div>')(scope);
                    element.find(".hasPopOver").prepend(view);
                }
            }
        }
    });

    // Duplicate of itcShortenedList extended to use object, with specified value
    global_directives.directive('itcShortenedListObject', function($timeout){
        return {
            restrict: 'A',
            scope: {
                elementsObject: "=",
                numToShow: "=",
                idForPopover: "=",
                valueKey: "@",
                useValueTo: "@",
                andText: "@",
                numMoreText: "@"
            },
            template:   
                "<div>{{elsToShow}}" + 
                    "<span ng-show=\"numInPopover>0\">{{ andText }} " +
                        "<span class=\"hasPopOver\">" +
                            "<a href=\"\" itc-pop-up-menu=\"shortenedList{{idForPopover}}\">{{displayText}}</a>" +
                            "<span class=\"centerPopUp center\" id=\"shortenedList{{idForPopover}}\">" +
                                "<span class=\"popupmenuinner\">" +    
                                    "<ul><li class=\"checkable-menu-item\" ng-repeat=\"extra in extras track by $index\">{{extra}}</li></ul>" +           
                                "</span>" +
                            "</span>" +
                        "</span>" +
                    "</span>" +
                "</div>",
            link: function(scope,element,attrs){
                //create array 
                scope.$watch('elementsObject',function(){
                    var elementsArray = [];
                    angular.forEach(scope.elementsObject,function(item){
                        if (scope.useValueTo === "true") {
                            //console.log("item[scope.valueKey].value",item[scope.valueKey].value)
                            elementsArray.push(item[scope.valueKey].value);
                        } else {
                            elementsArray.push(item[scope.valueKey]);
                        }
                    });
                    //alphabetize array
                    elementsArray = _.sortBy(elementsArray, function(elem) {
                        var str = elem.toLowerCase();
                        return str;
                    })

                    scope.numInPopover = elementsArray.length - scope.numToShow;

                    scope.displayText = scope.numMoreText.replace("@@number@@",scope.numInPopover);
                    var arr = elementsArray.slice(0, scope.numToShow);
                    scope.elsToShow = arr.join(", ");        
                    scope.extras = elementsArray.slice(scope.numToShow);
                });
            }
        }
    });


    global_directives.directive('itcModalPage',['$timeout',function($timeout){
        return {
            restrict: 'A',
            transclude: true,
            template: '<div ng-transclude></div>',
            link: function(scope, element, attrs) {
                function checkpageheight() {
                    $("#headerPlaceholder").hide();

                    var availableHeight = $(window).height() - ($("#header").outerHeight(true) + $("#footer").outerHeight(true));
                    var minheight = $('.modal-dialog').height() + 20;
                    if ($('.modal-dialog')){
                        if (availableHeight < minheight) {
                            availableHeight = minheight;
                            $('.modal-dialog').addClass('fixedtop');
                        } else {
                            $('.modal-dialog').removeClass('fixedtop');
                        }
                    }
                    element.height(availableHeight);
                    //$('#pageWrapper').height(availableHeight);
                }
                $(window).resize(function(){
                    checkpageheight();
                });
                $(document).ready(function(){

                    checkpageheight();
                });
                $timeout(function(){
                    checkpageheight();
                });
            }
        }
    }]);


    /*
    Description: Use to create a link to popup a modal - pass in the path to a partial for what is shown in modal
    Usage example: <div itc-modal-include="/itc/views/shared/termsOfService.html" show-modal="false">Terms of Service</div>
    */
    global_directives.directive('itcModalInclude',function(){
        return {
            restrict: 'A',
            scope: {
                'itcModalInclude': '@',
                'showModal': '@'
            },
            transclude: true,
            template: ''+
                '<a href="" ng-click="openModal()" ng-transclude></a>' +
                '<div itc-modal show="showModal" class="moveToParent">' +
                '     <div ng-include="includepath"></div>'+
                '</div>',
            link: function(scope,element,attrs) {
                scope.includepath = scope.itcModalInclude;
                scope.show = false;
                if (scope.showModal == undefined) {
                    scope.showModal = false;
                }
                $('body').append($('.moveToParent'));
                scope.closeModal = function() {
                    scope.showModal = false;
                }
                scope.openModal = function() {
                    scope.showModal = true;
                }
            }
        }
    });

    /*
    Description: Use to watch the page for changes and display a message. Directive takes an object that holds a true/false value and message for the popup.
    $scope.confirmLeave = {}; //storage of error messaging for user leaving page.
    $scope.confirmLeave.needToConfirm = false or true;
    $scope.confirmLeave.msg = "Your message goes here...";
    */
    global_directives.directive('confirmLeave',function(){
        return {
            scope: {
                'confirmLeave': '='
            },
            link: function(scope,element,attrs) {
                var unloadfunction = function(){
                    if (scope.confirmLeave && scope.confirmLeave.needToConfirm) {
                        return scope.confirmLeave.msg;
                    }
                }
                $(window).bind('beforeunload', unloadfunction);
                scope.$on("$destroy",function(){
                    $(window).unbind('beforeunload', unloadfunction);
                });
            }
        }
    });

    /*
    Description: put on a div that you want to have scroll to the top when the supplied object is set to true.
    Example:
    <div itc-scroll-to-div-top="myobject.shouldScrollNow">...</div>
    in controller - set myobject.shouldScrollNow when this div needs to scroll to the top.
    */
    global_directives.directive('itcScrollToDivTop',function(){
        return {
            scope: {
                'itcScrollToDivTop': "="
            },
            link: function(scope,element,attrs) {
                scope.$watch('itcScrollToDivTop',function(){
                    if (scope.itcScrollToDivTop) {
                        element.scrollTop(0);
                        scope.itcScrollToDivTop = false;
                    }
                });
            }
        }
    });

    /*
    Description: put on a div that you want to have scroll to a particular ID within the div when the supplied object "scrollnow" field is set to true.
    Example:
    <div itc-scroll-to-div-Id="myobject.scrollControl">...</div>
    in controller - set myobject.scrollControl.scrollnow false (true when ready to scroll) & myobject.scrollControl.divId = "divIdInside"
    */
    global_directives.directive('itcScrollToDivId',function($timeout){
        return {
            scope: {
                'itcScrollToDivId': "=" //scope.itcScrollToDivId.scrollnow & scope.itcScrollToDivId.divId
            },
            link: function(scope,element,attrs) {
                scope.$watch('itcScrollToDivId',function(){
                    if (scope.itcScrollToDivId.scrollnow) {
                        $timeout(function(){
                            element.scrollTop($('#'+scope.itcScrollToDivId.divId).position().top);
                            scope.itcScrollToDivId.scrollnow = false;
                        },100);
                        
                    }
                },true);
            }
        }
    });

    /*
    Description: put on a div to affect the whole page. When the object supplied is true - the page will scroll to the top.
    Example:
    <div itc-scroll-to-page-top="myobject.shouldScrollNow">...</div>
    in controller - set myobject.shouldScrollNow when the page needs to scroll to the top.
    */
    global_directives.directive('itcScrollToPageTop',function(){
        return {
            scope: {
                'itcScrollToPageTop': "="
            },
            link: function(scope,element,attrs) {
                scope.$watch('itcScrollToPageTop',function(){
                    if (scope.itcScrollToPageTop) {
                        $("html,body").stop().animate({ 
                             scrollTop: 0
                        },1000);
                        //return false;
                        scope.itcScrollToPageTop = false;
                    }
                });
            }
        }
    });



    /*
    Description: will apply a "blink" class (and then remove the class) to element when object passed to directive changes. 
    */
    global_directives.directive('itcBlinkText',['$timeout',function($timeout){
        return {
            scope: {
                'itcBlinkText': '='
            },
            link: function(scope,element,attrs) {
                element.addClass('preblink');
                scope.$watchCollection('itcBlinkText',function(value){
                    element.addClass('blink');
                    $timeout(function(){
                        element.removeClass('blink');
                    },500); 
                });
            }
        }
    }]);

    /*
    Description: Will slide element up/down based on boolean provided (use like "ng-show")
    (myobj.boolean = true)
    <div itc-scroll-up-down="myobj.boolean">This will show to begin with</div>
    when myobj.boolean = false - div will slide up/hide
    Can also take call back functions that will be called when the slide is complete.
    <div itc-scroll-up-down="myobj.boolean" itc-scroll-up-call-back="finishedSlidingUp()" itc-scroll-down-call-backk="finishedSlidingDown()">
    */
    global_directives.directive('itcScrollUpDown',function(){
        return {
            scope: {
                'itcScrollUpDown': '=',
                'itcScrollUpCallBack': '&',
                'itcScrollDownCallBack':'&'
            },
            link: function(scope,element,attrs) {
                if (scope.itcScrollUpDown) {
                    element.show();
                } else {
                    element.hide();
                }
                scope.$watch('itcScrollUpDown',function(){
                    if (scope.itcScrollUpDown) {
                        element.slideDown("slow",function(){
                            if(scope.itcScrollDownCallBack) {
                                scope.itcScrollDownCallBack();
                            }
                        });
                    } else {
                        element.slideUp("slow",function(){
                            if(scope.itcScrollUpCallBack) {
                                scope.itcScrollUpCallBack();
                            }
                        });
                    }
                });
            }
        }
    });

    /*
    Add directive to an element to have all text in that element selected upon a single click. example:
    <div selectable-text>If you click me, you’ll select me</div>
    */
    global_directives.directive('selectableText',function(){
        return {
            scope:{},
            restrict: 'A',
            link: function(scope,element,attrs) {
                element.click(function(){
                    if (document.selection) {
                        var range = document.body.createTextRange();
                        range.moveToElementText(element[0]);
                        range.select();
                    } else if (window.getSelection) {
                        var range = document.createRange();
                        range.selectNode(element[0]);
                        window.getSelection().addRange(range);
                    }
                });
            }
        }
    });

    /*
    TODO - THIS DOESN"T WORK YET _ NEED TO MODIFY TO CREATE A FIXED HEADER....
    {'orig':'editGroupMembTableHeader','dup':'editGroupMembTableHeaderDuplicate'}
    */
    global_directives.directive('itcFixedTableHeader',function(){
        return { 
            //transclude: true, 
            restrict: 'A',
            scope: {
                'itcFixedTableHeader': '='
            },
            //template: '<div>PUT HEADER TABLEHERE</div>+TRANCLUDESTUFF',
            link: function(scope,element,attrs) {
                //console.log(element.find("tr"));
                /*
                TODO: somehow make this work :/
                it works with a plain html page - angular is being difficult


                *** get the THEAD element and clone it into a NEW element above transcluded table
                To do so - I think we need this element to be a wrapper around the table. - pass the table's div id to attribute:
                <div itc-list-table="myTableId"><table id="myTableId"><thead><tr>myheader....stuff...</table></div>
                */
                /*$(document).ready(function(){
                    calculateWidths()
                    $(window).resize(function(){
                        calculateWidths();
                        getHeaderPosition();
                    });
                    $(window).scroll(function(){
                        getHeaderPosition();
                    });
                });
                var widths = [];
                var headerdivs;

                scope.$watch(function(){
                    return scope.itcFixedHeader.orig.height();
                },function(){

                });


                function calculateWidths() {
                    widths = []; //clear

                    $('#mytable').find('th').each(function(i){
                        widths.push($(this).width());
                    });
                    $('#tableheader th').each(function(i){
                        $(this).width(widths[i]);
                    });
                }
                function getHeaderPosition() {
                    var tablebottom = $('#mytable').offset().top + $('#mytable').height() - $('#tableheader').height();
                    if ($(window).scrollTop() > $('#mytable').offset().top && $(window).scrollTop() < tablebottom) {
                        if (!$('#tableheader').hasClass('showme')) $('#tableheader').addClass('showme');
                    } else {
                        $('#tableheader').removeClass('showme');
                    }
                }*/
                
            }
        }
    });

    global_directives.directive('stickyTableHeaderWrapper',function(){
        return {
            scope: {
                'stickyTableHeaderWrapper':'@'
            },
            link: function(scope,elem,attr) {
                var setPaddingHeight = function() {
                    var padding = $("#"+scope.stickyTableHeaderWrapper+" tr th div").outerHeight();
                    elem.css("paddingTop",padding);
                }
                scope.$watch(function(){
                    var test = $("#"+scope.stickyTableHeaderWrapper+" tr th div").outerHeight();
                    return test;
                },function(val){
                    if (val) {
                        setPaddingHeight();
                    }
                });
            }
        }
    });

    /*
    itc-sortable-table
    Description: Use this to make a table sortable.
    
        <table itc-sortable-table sort-object="OBJECT_TO_BE_SORTED">
            <thead>
                <th class="sortable" sort-by="KEY_TO_SORT_BY"> ... </th>
                ...
            </thead>
            ...
        </table>
       
    -= WHAT IT DOES =-
    - Adds click functionality to the <th> elements.
    - Upon click, it will update the table's styling to reflect the current sorting status.
    - It will also sort your data for you, unless you provide a custom sorting function (see [2] below) 
       
        
    -= USAGE =-
        
    [1] To use DEFAULT sorting behavior:
        - supply the "sort-object" as an attribute on the <table>. This is the object that will be sorted.  (Example: "testers")
        - for each <th>, provide a "sort-by" value, containing the key name you'd like to sort by.          (Example: "lastName")
        - This should just work! No further configuration required :-)
        
    [2] To use CUSTOM sorting behavior:
        - To override the default, simply write your own function and attach it to the <th> with "ng-click"
        - NOTE: Make sure your ng-click function actually sorts the data (!!) otherwise nothing will happen
        
        
        You can mix/match these two approaches (for instance, to apply custom sorting 
        to a single element and keep default sorting behavior for the others)
            ...
            <th class="sortable" sort-by="lastName"> Tester Name </th>
            <th class="sortable" sort-by="status"> Status </th>
            <th class="sortable" ng-click="doCustomSort( $event, 'testing')"> Is Testing? </th>
            **add "sortableOverride" class when using a custom sort via ng-click and apply a ng-class="{'sort-asc':reverse}" to handle chevron
            ...
            
    */
    
    global_directives.directive( 'itcSortableTable', ['$timeout', function($timeout){
        return {
            restrict: 'A',
            scope: {
                'itcSortableTable': '=table',
                'sortedObject': '=sortedObject',
                'initialSort': '=initialSort',
                'control': '='
            },
            link: function(scope,el,attrs) {
                
                var s = scope;
                
                s.control = s.control || {};
                
                // Storing the current sort values
                s.currentTh = undefined;
                s.currentKey = undefined;
                s.currentDirection = false;
                s.flexMode = false;
                
                // CSS classnames used by the directive
                var SORTED = 'sorted',     // element is currently sorted
                    desc   = 'sort-desc',  // sorted, descending
                    asc    = 'sort-asc';   // sorted, ascending
                    
                // Attribute used for inverting the sort order on a column (mostly for comparing booleans)
                var INVERT_SORT = 'invert-sort';
                
                // log('initial sort', s.initialSort)
                
                // Grab the table headers so we can apply functionality
                s.headers = $(el).find("th.sortable");
                s.allHeaders = $(el).find("th");
                
                // Update the visual style of column to reflect sorting status, + return the new state
                s.updateStyles = function(th, tdsOnly) {
                    
                    var isDescending = false,
                        tdsOnly = tdsOnly || false,
                        rowContainer;
                    
                    if (!th) {
                        th = s.currentTh;
                    }
                    
                    // Apply class of 'sorted' to <td>'s in the currently-sorted column
                    var indexOfSortedColumn = s.allHeaders.index(th);
                    if (indexOfSortedColumn !== undefined && indexOfSortedColumn > -1) {
                        
                        var trs = $(el).find('tbody tr'),
                            cellSelector = 'td';
                        
                        if (trs.length < 1) {
                            s.flexMode = true;
                            rowContainer = $(el).siblings('.repeat-wrapper');
                            trs = rowContainer.find('.trow');
                            cellSelector = '.tcell';
                        }
                        
                        if (s.flexMode) {
                            
                            rowContainer.attr( 'sort-index', 'sorted'+(indexOfSortedColumn+1) );
                            // log( rowContainer.attr( 'sort-index'))
                            
                        } else trs.each( function() {
                            
                            var tds = $(this).find( cellSelector );
                            tds.removeClass( SORTED, desc, asc );
                            $(tds[indexOfSortedColumn]).addClass( SORTED );
                            
                        });
                    }
                    if (tdsOnly === true) return false;
                    
                    // If header wasn't previously sorted, indicate that it's now sorted
                    if (! th.hasClass(SORTED)) {
                        s.headers.removeClass(SORTED);
                        if (!th.hasClass('sortableOverride')) {
                            th.addClass(SORTED +" "+ asc);
                            // log(th)
                        } else {
                            th.addClass(SORTED);
                        }
                        // isDescending = true;
                        
                    } else {
                        if (!th.hasClass('sortableOverride')) {
                            // Otherwise, switch the sort order (ascending <-> descending)
                            if (th.hasClass(asc)) {
                                th.addClass(desc).removeClass(asc);
                                isDescending = true;
                            } else {
                                th.addClass(asc).removeClass(desc);
                                isDescending = false;
                            }
                        }
                    }
                    
                    // true = descending, false = ascending
                    return isDescending;
                };
                
                // Used to prepare values for sorting (because we can't accurately compare undefined / null/ etc.)
                s.sanitizeValue = function(val) {
                    if (val === null || val === undefined || val === '') {
                        return '~~~'; // I use these characters instead of a blank string
                                      // to ensure that empty values appear AFTER any real values.
                                      // Otherwise the blanks would be sorted first (not desirable)
                    }
                    if (typeof val === 'string') {
                        return val.toLowerCase();
                    }
                    else {
                        return val;  
                    }
                };
                
                
                // Default sorting function
                s.performDefaultSort = function(obj, key, isDescending) {
                    var obj = obj || s.sortedObject,
                        key = key || s.currentKey,
                        isDescending = isDescending || s.currentDirection;
                    
                    if (obj === undefined || Object.keys(obj).length < 1 || !key) return false;
                    
                    obj.sort( function(x, y) {
                        var a = s.sanitizeValue( s.resolveKey(x, key)),
                            b = s.sanitizeValue( s.resolveKey(y, key));

                        if (a < b) return (isDescending) ? 1 : -1;
                        if (a > b) return (isDescending) ? -1 : 1;
                        return 0;
                    });
                    
                    // console.log(isDescending, obj.map( function(o){ return o[key]}).join('-'))
                    
                    $timeout( function() { scope.$apply() }, 0); // IMPORTANT: pushes the sorted object back to controller $scope  

                    return obj;
                };
                
                
                s.resolveKey = function(obj, path) {
                    if (obj.path) return obj.path;
                    return [obj || self].concat(path.split('.')).reduce(function(prev, curr) {
                        return prev[curr];
                    });
                };
                
                
                s.enableHeader = function(i, th) {
                    var th = $(th);
                    var sortKey = th.attr('sort-by'),
                        invertSort = !!(th.attr( INVERT_SORT ));
                    
                    th.click( function() {
                        
                        // Update table styling + retrieve current sorting status
                        var isDescending = s.updateStyles(th);
                        if (invertSort) isDescending = !isDescending;
                        
                        s.currentTh = th;
                        s.currentKey = sortKey;
                        s.currentDirection = isDescending;
                        
                        // Unless overriden by 'ng-click', use our default sorting behavior
                        if (s.sortedObject && sortKey && th.attr('ng-click') === undefined) {
                            s.performDefaultSort( s.sortedObject, sortKey, isDescending );
                        }
                    });
                    
                    // Initial sort (for when "sorted" is declared in the HTML for a column)
                    if (th.hasClass( SORTED )) {
                        
                        isDescending = th.hasClass(desc);
                        if (invertSort) isDescending = !isDescending;
                        
                        var removeWatcher = s.$watch( 'sortedObject', function(obj) {
                            if (obj !== undefined && Object.keys(obj).length > 0) {
                                
                                if (s.sortedObject && sortKey && th.attr('ng-click') === undefined) {
                                    s.performDefaultSort( s.sortedObject, sortKey, isDescending );
                                }
                                
                                removeWatcher();
                            }
                        })
                    }

                    return th;
                };
                    
                
                // Apply sorting functionality to each header
                s.headers.map( s.enableHeader );
                
                // Setup the interface to allow our controller to update the table
                if (s.control) {
                    
                    s.control.updateStyles = function(th, tdsOnly) {
                        s.updateStyles(th, tdsOnly);
                    };
                    
                    s.control.update = function(key, isDescending) {
                        // log('calling tableSorter.update():', key, isDescending)
                        // s.control.showVals();
                        // log('---------')
                        s.performDefaultSort( s.sortedObject, key, isDescending );
                        var th = $(el).find('th[sort-by="'+key+'"]');
                        s.updateStyles(th, false)
                    };
                    
                    s.control.showVals = function() {
                        log('currentTh:',s.currentTh)
                        log('currentKey:', s.currentKey)
                        log('currentDirection:', s.currentDirection)
                    }
                }
                
                // Sort based on whatever the initial sort is meant to be
                if (s.initialSort) {
                    // var headerToSort = $(el).find('[sort-by="'+s.initialSort+'""]');
                    // log(s.initialSort, headerToSort)
                    // if (headerToSort.length > 0) {
                        $timeout( function() {
                            s.control.update(s.initialSort, false)
                            // headerToSort.click()
                        // $timeout( function() {
                            // s.updateStyles(headerToSort, true)
                        }, 50)
                    // }
                }
            }
        }
    }]);

    /* 
    itc-fixed-boxes-with-conditional 
    main-box-id="appStorePageInfoHeaderId" 
    fix-this-id="locHeaderDuplicate" 
    when-this-id-is-hidden="locHeader" 
    remain-visible-for-this-id="localizationSection" 
    */
    global_directives.directive('itcFixedBoxesWithConditional',function($window){
        return {
            scope: {
                'mainBoxId': '@',
                'fixThisId': '@',
                'whenThisIdIsHidden': '@',
                'remainVisibleForThisId': '@'
            },
            link: function(scope,element,attrs) {
                var calculateHeights = function() {
                    var divtop = element.offset().top;
                    $('#'+scope.mainBoxId).css('top',divtop); //fix mainbox id to top of content section
                    element.css('paddingTop',$('#'+scope.mainBoxId).outerHeight(true)); // add padding to main content div equivalent to height of main box id
                    
                    //where is the div that we're watching to disappear
                    if (scope.whenThisIdIsHidden !== undefined) {
                        var watching_div_top_offset = $('#'+scope.whenThisIdIsHidden).offset().top;
                        var watching_div_height = $('#'+scope.whenThisIdIsHidden).outerHeight(true);
                        var watching_div_total = watching_div_top_offset + watching_div_height
                    }

                    //height of main box ID...
                    var height_main_box = $('#'+scope.mainBoxId).outerHeight(true);
                    //console.log("full offset of main box",$('#'+scope.mainBoxId).offset())
                    var offset_main_box = divtop;
                    var main_box_total = height_main_box + offset_main_box;
                    //console.log("main box total",main_box_total);

                    $('#'+scope.fixThisId).css({'top':main_box_total});//set top location of div to be fixed

                    if (scope.whenThisIdIsHidden !== undefined) {
                        scope.main_box_watching_div_difference = watching_div_total - main_box_total;
                    }

                    //height of box we care about (remainVisibleForThisId)
                    if (scope.remainVisibleForThisId !== undefined) {
                        var important_div_height = $('#'+scope.remainVisibleForThisId).outerHeight(true);
                        var important_div_top_offset = $('#'+scope.remainVisibleForThisId).offset().top;

                        scope.hideExtraAfterThisScrollPoint = important_div_height + important_div_top_offset; //this gets our hide point at the TOP of the page - we need to subtract from that where our fixed header (main box) is positioned...
                        scope.hideExtraAfterThisScrollPoint = scope.hideExtraAfterThisScrollPoint - main_box_total;
                        //now remove the height of sometimes fixed div
                        scope.hideExtraAfterThisScrollPoint = scope.hideExtraAfterThisScrollPoint - $('#'+scope.fixThisId).outerHeight(true);
                    }
                }

                var showHideDiv = function() {
                    if ($(window).scrollTop() > scope.main_box_watching_div_difference && $(window).scrollTop() < scope.hideExtraAfterThisScrollPoint) {
                        $('#'+scope.fixThisId).slideDown("slow");
                    } else {
                        $('#'+scope.fixThisId).slideUp("fast");
                    }
                }

                //watching height of this div because it changes as it loads
                scope.$watch(function(){
                    return $('#'+scope.remainVisibleForThisId).outerHeight(true);
                },function(){
                    calculateHeights();
                });

                scope.$watch(function(){
                    return $('#'+scope.mainBoxId).outerHeight(true);
                },function(){
                    calculateHeights();
                });

                scope.$watch(function(){
                    return $('#'+scope.mainBoxId).is(':visible');
                },function(){
                    calculateHeights();
                });

                var resizeFunction = function() {
                    calculateHeights();
                    showHideDiv();
                }

                var handler = scope.$apply.bind(scope, showHideDiv);
                var resizeHandler = scope.$apply.bind(scope,resizeFunction);

                var windowEl = angular.element($window);

                windowEl.on('scroll', handler);
                windowEl.on('resize',resizeHandler);

                scope.$on("$destroy",function(){
                    windowEl.off('scroll',handler);
                    windowEl.off('resize',resizeHandler)
                });

            }
        }
    });
    /*
    itc-adjust-content-header-widths -- put on wrapper element
    fixed-width-div="buttonDiv" 
    adjustable-div="textDiv"
    */    
    global_directives.directive('itcAdjustContentHeaderWidths',function($window){
        return {
            scope: {
                'fixedWidthDiv': '@',
                'adjustableDiv': '@',
                'additionalAdjustment': '='
            },
            link: function(scope,element,attrs) {
                scope.adjustWidth = function() {
                    var fixedWidth = $('#'+scope.fixedWidthDiv).width();
                    var wrapperWidth = element.width();
                    $('#'+scope.adjustableDiv).width(wrapperWidth - fixedWidth - scope.additionalAdjustment); //30px padding on edge, 3
                }
                scope.$watch(function(){
                    return $('#'+scope.adjustableDiv).width();
                },function(){
                    scope.adjustWidth();
                });
                scope.$watch(function(){
                    return element.width();
                },function(){
                    scope.adjustWidth();
                });
                var windowEl = angular.element($window);
                windowEl.on('resize', function(){
                    scope.adjustWidth();
                });
            }
        }
    });


    global_directives.directive('collapseTrigger',function($timeout){
        return {
            restrict: 'C',
            link: function( scope, el, attrs ) {
                
                var setup = function( scope, el, attrs ) {

                    var trigger  = $(el).find('h2'),
                        parent   = $(el).closest('.collapse-container'),
                        contents = parent.find('.collapsible');
                    
                    if (contents.length < 0 || parent.length < 0) {
                        log('missing certain pieces')
                        return false;
                    }
                    
                    (parent.hasClass('accordion-open')) ? contents.show() : contents.hide();
                    
                    // if (contents.is(":visible")) { parent.addClass('accordion-open') }
                    
                    trigger.click( function() {
                        if (contents.is(":visible")) {
                            parent.removeClass('accordion-open')
                            contents.slideUp( 150 )
                        } else {
                            parent.addClass('accordion-open')
                            contents.slideDown( 150 )
                        }
                    });
                }
                
                $timeout( function() { setup(scope, el, attrs) }, 0)   
            }
        }
    });

    global_directives.directive('screenAwarePopup',function($window){
        return {
            scope: {
                'screenAwarePopup': '@',
                'modelToWatch':'=',
                'classToRemove':'@',
                'classToAdd': '@'
            },
            link: function(scope,element,attrs) {
                scope.offsetTop = 0;
                scope.setOffsetTop = function() {
                    scope.offsetTop = $('#'+scope.screenAwarePopup).offset().top;
                }
                 
                scope.adjustPopupBox = function() {
                    if (scope.isPopupBelowWindow()) {
                        if ($('#'+scope.screenAwarePopup).hasClass(scope.classToRemove)) {
                            $('#'+scope.screenAwarePopup).removeClass(scope.classToRemove);
                            $('#'+scope.screenAwarePopup).addClass(scope.classToAdd);
                        }
                    } else {
                        $('#'+scope.screenAwarePopup).addClass(scope.classToRemove);
                        $('#'+scope.screenAwarePopup).removeClass(scope.classToAdd);
                    }
                }
                scope.isPopupBelowWindow = function() {
                    var popup = scope.offsetTop + $('#'+scope.screenAwarePopup).outerHeight();
                    if (popup > $window.innerHeight) {
                        return true;
                    } else {
                        return false;
                    }
                }
                scope.$watch('modelToWatch',function(val){
                    if (val) {
                        scope.setOffsetTop();
                        scope.adjustPopupBox();
                    }
                },true);
                scope.$watch(function(){
                    return $('#'+scope.screenAwarePopup).outerHeight();
                },function(val){
                    if (val) {
                        scope.adjustPopupBox();
                    }
                },true);
                $(window).on('resize',scope.adjustPopupBox);
                scope.$on("$destroy",function(){
                    $(window).off('resize',scope.adjustPopupBox)
                });
            }
        }
    });

    //inject-to="header_inject"
    //appinfo example: inject-to="header_inject" wait-for="appOverviewInfo" stay-for="app_overview"
    global_directives.directive('injectTo',function($rootScope){
        return {
            scope: {
                'injectTo': '@',
                'waitFor': '=', //object to wait until is loaded
                'stayFor': '@' //when navigating around - if next ui-route includes this string - do not remove content
            },
            link: function( scope, element, attrs) {

                scope.$watch('waitFor',function(newVal,oldVal){
                    if (newVal !== null && newVal !== undefined && newVal !== oldVal) {
                        $( "#" + scope.injectTo ).html(element);
                    }
                },true);

                //remove when leaving
                $rootScope.$on('$stateChangeStart', function(event, next, toParams, current, fromParams) {
                    if (next.name.indexOf(scope.stayFor) < 0) {
                        $( "#" + scope.injectTo ).html("");
                    }
                });
                
            }
        }
    });
    
    // Provide fallback image when the original fails to load
    //      <img src="originalUrl" fallback-src="fallbackUrl" />
    global_directives.directive( 'fallbackSrc', function () {
        var fallbackSrc = {
            link: function postLink( scope, el, attrs ) {
                el.bind( 'error', function() {
                    angular.element( this ).attr( 'src', attrs.fallbackSrc );
                });
            }
        }
        return fallbackSrc;
    });
    
    
    //  Directive for handling loc-keys that vary based on a given number. e.g. "@@num@@ Session(s)"
    //      In order for this to work, the keys -MUST- be named in the following manner:
    //
    //          (when 'count' == 0)    "ITC.some.localization.key.zero"
    //          (when 'count' == 1)    "ITC.some.localization.key.singular"
    //          (when 'count' > 1)     "ITC.some.localization.key.plural"
    //
    //      The directive is then invoked thusly:
    //
    //          <... value-sensitive-localization
    //               loc-key-base="ITC.some.localization.key"
    //               object-to-interpolate="build.crashCount" > ...
    //
    global_directives.directive( 'valueSensitiveLocalization', [ '$rootScope', '$timeout', function ( $rootScope, $timeout ) {
        return {
            
            restrict: 'A',
            
            scope: {
                'countValue': '=valueSensitiveLocalization',
                'locKeyBase': '@',
                'data': '=objectToInterpolate'
            },
            
            link: function( $$, el, attrs ) {

                if ($$.countValue) {
                    render( $$, el, attrs );
                }
                else {
                    $$.$watch('countValue',function(val) {
                        if (val !== undefined) {
                            render( $$, el, attrs );
                        }
                    });
                }
                
                function prepareKey( base, count ) {
                    // Add a trailing period to the key prefix, if it doesn't have one
                    var key = ( base.substr(-1) !== '.' ) ? base += '.' : base;
                    
                    // Retrieve the proper key variant, based on #
                    count = Math.abs( count );
                    if ( count > 1 ) return( key += 'plural' )
                    else if ( count === 1 ) return( key += 'singular' )
                    else return( key += 'zero' )
                }
              
                function render( $$, el, attrs ) {
                
                    var key, count;
                    
                    // Grab the 'count' directly from the attribute that triggers this directive
                    if ( typeof $$.countValue === 'number' ) {
                        count = $$.countValue;
                    }
                    
                    // Or try to grab it from the data object provided
                    else if ( typeof deep( $$.data, 'num') === 'number' ) {
                        count = $$.data.num;
                    }
                    
                    // Otherwise return
                    else return;
                
                    // Prepare the key, based on the value of 'count'
                    key = prepareKey( $$.locKeyBase, count );
                    
                    //log(count);
                    //log(key);
                    //log($$.l10n.interpolate( key, { num: count } ))
                    
                    el[0].textContent = $rootScope.l10n.interpolate( key, { num: count } );
                }
                
                //$timeout( function() { render( $$, el, attrs ) }); // waiting for countValue instead of doing this
            }
        }
    }]);
    
    
    
    global_directives.directive( 'fixedPositionTooltip', [ '$timeout', function( $timeout ) {
        return {
            restrict: 'A',
            link: function( scope, el, attrs ) {
                
                var $el = el, 
                    trigger = $el.find('[tooltip-trigger]'),
                    tooltip = $el.find('.fixed-tooltip'),
                    _classWhenVisible = 'fixed-open';
                    
                window.trigger = trigger;
                
                function resetTooltip() {
                    return tooltip.css({ top: '', left: '' });
                }
                    
                function positionTooltip() {
                    
                    var offset = trigger.offset(),
                        triggerTop  = offset.top,
                        triggerLeft = offset.left,
                        triggerHeight = trigger[0].clientHeight,
                        tipHeight = tooltip[0].clientHeight;
                        
                    var tooltipX = triggerLeft + 30;
                    
                    var tooltipY = triggerTop - Math.floor(tipHeight/2) + Math.floor(triggerHeight/2);
                        
                    return tooltip.css({ top:  tooltipY, left: tooltipX });
                }
                
                trigger.on( 'click', function( e ) {
                    // Hide other tooltips
                    $('.'+_classWhenVisible).not( tooltip ).removeClass( _classWhenVisible );
                    // Show or hide this tooltip
                    return (tooltip.hasClass( _classWhenVisible )) ? hideTooltip() : showTooltip()
                });
                
                function showTooltip() {
                    positionTooltip();
                    attachBodyListeners();
                    tooltip.addClass( _classWhenVisible );
                }
                
                function hideTooltip() {
                    resetTooltip();
                    unsetBodyListeners();
                    tooltip.removeClass( _classWhenVisible );
                }
                
                function attachBodyListeners() {
                    $('.pane-layout-content-wrapper').on( 'scroll.fixedPositionTooltip', hideTooltip );
                    $(window).on( 'resize.fixedPositionTooltip', positionTooltip )
                }
                
                function unsetBodyListeners() {
                    $('.pane-layout-content-wrapper').off( 'scroll.fixedPositionTooltip', hideTooltip );
                    $(window).off( 'resize.fixedPositionTooltip', positionTooltip );
                }
                
            }
        };
    }]);
    
    global_directives.directive( 'noClickPropagation', function() {
        return {
            restrict: 'A',
            link: function( scope, el, attrs ) {
                $(el).on('click', function(e) {
                    e.stopPropagation();
                })
            }
        } 
    });

    //fixed-table-header
    // to use wrap table with div and place directive in wrapper div with a class of "fixedTableWrapper". 
    // Duplicate the table tag and TH row and give this new table a class of "fixedHeader", then wrap the scrolling table with "<div class="containScrollTable">"
    // classes are set up to position table header absolutely and match TD sizes of table header in scrolling table. table width will also be matched to account for scrollbar
    // ** see edit user roles - role matrix modal - as an example
    // ALSO - need to wrap HEADER / TH row with <thead> and body with <tbody>
    global_directives.directive('fixedTableHeader',function($timeout){
        return {
            restrict: 'A',
            link: function(scope,element,attrs) {

                scope.$watch(function(){
                        var tdWidthArray = "";
                        var firstRow = element.find('.containScrollTable table tr:nth-child(1) th');
                        angular.forEach(firstRow,function(value,key){
                            var test = $(value).attr('colspan');
                            if (test === undefined) {
                                tdWidthArray += $(value).innerWidth() + ",";
                            } else {
                                tdWidthArray += 'SKIP,'
                            }
                        });
                        tdWidthArray += element.find('.containScrollTable table').width();
                        return tdWidthArray;
                },function(newval,oldval){ //withFixedHeader
                    if (newval !== oldval) {
                        var tdWidthArray = newval.split(',');
                        var firstRow = element.find('table.fixedHeader tr:nth-child(1) th');
                        //element.find('table.fixedHeader').width(tdWidthArray[tdWidthArray.length-1]);
                        element.find('table.fixedHeader').css('width',tdWidthArray[tdWidthArray.length-1] + 'px');
                        angular.forEach(firstRow,function(value,key){
                            if (value !== 'SKIP') {
                                if (!$(value).hasClass('ng-hide')) {
                                    //$(value).width(tdWidthArray[key]);
                                    $(value).css('width', tdWidthArray[key] + 'px');
                                }
                            }
                        });
                        $timeout(function(){ //run the width evaluation again to make sure we got all widths correctly. Needed when table is getting different data dynamically.
                            scope.$digest()
                        },0);
                    }
                });
            }
        }
    });


});
