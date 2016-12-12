define(['sbl!app'], function (itcApp) {

	itcApp.directive('simpleImage', function($sce, $timeout, $animate) {
        return {
          restrict: 'A',
          templateUrl: getGlobalPath('/itc/views/directives/simple_image_template.html'),
          scope: {
            error: "=",
            url: "=",
            styleClass: "@",
            useStyleClassForDropZoneOnly: "=", // not for image
            errorKeys: '=',
            origUrl: '=',
            curUrl:'=',
            locFile: '=',
            valueToClearOnDelete: "=",
            showDropZone: "=",
            unDeletable: "=",
            deleteButtonWithText: "=", // if true, show "Remove" text by delete button
            centerVer: "=?" //true or false
          }, 
          
          link: function(scope, element, attrs) {

            if (scope.centerVer === undefined) {
                scope.centerVer = true;
            }

            scope.hovered = false;

            //$animate.enabled(element, false); // don't disable animation on this element

            var zone = element.find(".container");
            var img = zone.find("img.realImage");

            if (scope.url !== null) {
                scope.imageError = false;
            }
            //var playButton = element.find(".playButton");
            
            zone.on('mouseenter', function() {
                    scope.hovered = true;
                    scope.$apply();
            });
            zone.on('mouseleave', function() {
                    scope.hovered = false;
                    scope.$apply();
            });

            // This element has an opacity transition on it. Don't show drop zone until transition is done.
            element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function( event ) { 
                if (event.target === this && event.originalEvent.propertyName === "opacity" ) {
                    var op = element.css("opacity")
                    if (op === "0") { // if image just finished disappearing
                        scope.showDropZone = true;
                        scope.$apply();
                    }
                    else if (op === "1") { // image just finished appearing
                        // do nothing.
                    }
                }
            });

            // THIS is where we get the image width. Pass it along (emit it) to the parent scope.
            img.bind('load', function() {
                if (!scope.imageError) {
                    //console.log("Loading new image..");
                    scope.imageError = false;
                    scope.error = "";
                    //element.find('.zone').removeClass('invalid');
                    scope.clearError();
                    scope.addStyleClass();
                } else {
                    //reset image error to false for next time...
                    scope.imageError = false;
                }
            });

            scope.$watch('styleClass', function(newVal, oldVal) {
                var parent = img.parent();
                if (zone.hasClass("rounded")) {
                    parent.addClass("ios7-style-icon");
                }
                if (zone.hasClass("watchIcon")) {
                    parent.addClass("circle");
                }
            });

            scope.addStyleClass = function() {
                var parent = img.parent();
                if (zone.hasClass("rounded")) {
                    parent.addClass("ios7-style-icon");
                }
                if (zone.hasClass("watchIcon")) {
                    parent.addClass("circle");
                }
            }

            scope.$watch('error', function(newVal, oldVal) {
                if (newVal) {
                    scope.showError(newVal);
                }
                else {
                    scope.clearError();
                }
            });
            scope.showError = function(msg) {
                zone.addClass("invalid");
                scope.errorMsg = $sce.trustAsHtml(msg);
                element.find('.errorPopUp').addClass('stayopen');
                scope.imageError = true;
                //scope.$apply();
                $timeout(function(){
                        element.find('.errorPopUp').removeClass('stayopen');
                    },3000);
                //scope.error = msg;
            };

            scope.clearError = function() {
                zone.removeClass("invalid");
                //scope.errorMsg = "";
            };

            img.bind('error', function(e) {
                
                //zone.addClass('invalid');
                //scope.errorMsg = $sce.trustAsHtml("The image did not load successfully.");
                //scope.showError(scope.locFile['ITC.AppVersion.GeneralInfoSection.AppIconErrors.ImageNotLoaded'])

                //scope.url = '/itc/images/layoutelements/noimg.png';
                //scope.url = null;
                console.log("There was some error with the image at: " + img[0].src);
                //scope.imageError = true;
                //scope.errorText = "The image did not load successfully.";
                //scope.$apply();
            });

            scope.deleteImage = function() {
                img.attr("src", ""); // clearing ng-src doesn't clear src. Without this line, there's a momentary flash of the old image.
                scope.url = null;
                scope.curUrl = null; // karen leaving this in tho it's not necessary, just because there's a watch on it below that might depend on this.
                scope.valueToClearOnDelete = null;
                scope.$apply();
            }

            var deleteButton = element.find(".deleteButton");
            var deleteTextByButton = element.find(".deleteTextByButton");
            deleteButton.bind('click', scope.deleteImage);
            deleteTextByButton.bind('click', scope.deleteImage);
            
            scope.$watch('curUrl',function() {
                if (scope.errorKeys !== undefined && scope.errorKeys !== null && scope.errorKeys.length > 0 && scope.origUrl === scope.curUrl) {
                    zone.addClass('invalid-srvr');
                    //scope.showingServerError = true;
                    scope.errorMsg = "";
                    angular.forEach(scope.errorKeys,function(value){
                        scope.errorMsg += "<p>"+value+"</p>";
                    });
                    scope.errorMsg = $sce.trustAsHtml(scope.errorMsg);
                } else {
                    zone.removeClass('invalid-srvr');
                    //scope.showingServerError = false;
                }
            });

            zone.on('mouseenter', function(){
                if (zone.hasClass('invalid') || element.find('.zone').hasClass('invalid-srvr')) {
                    element.find('.errorPopUp').addClass('open');
                }
            });
            zone.on('mouseleave', function(){
                element.find('.errorPopUp').removeClass('open');
            });


            
          },
        }
    });

}); // end define