define(['sbl!app'], function (itcApp) {

	itcApp.directive('simpleImageDropCombo',function($sce, $http, $animate, $timeout){
		return {
            restrict: 'A',
            templateUrl: getGlobalPath('/itc/views/directives/simple_image_drop_combo_template.html'),
            scope: {
                url: "=",
                error: "=",
                styleClass: "@",
                useStyleClassForDropZoneOnly: "=", // not for image
                ignoreImageLoadError: "=",
                callBackFunc: "&",
                callBackFile: "=",
                isRequired: '=',
                errorKeys: '=',
                missingImage: '@',
                origUrl: '=',
                curUrl: '=',
                imageValidationData: "=", //can be an object with a value of an array of sizes ie. 1024x2024, 1136x640 OR an object with ratio size information in this format: {'ratioRange':['2:1','1:2'],'minLong':1024} **larger ratio fraction needs to come first in array ie. 2:1 = "2" -> 1:2 = ".5"
                locFile: "=",
                dropLabel: '@',
                fileInProgress: '=',
                allowedFileTypes: "=",
                valueToClearOnDelete: "=",
                customErrorMsgKey: "@",
                deleteButtonWithText: "=",
                centerVer: "=?" //true or false
            }, 

            link: function(scope, element, attrs) {
                // let the two child directives inside simple_image_drop_combo_template.html do all the work! (the info in scope gets passed cleverly to them.)

                var el = element.find(".fileloading");
                $animate.enabled(el, false);

                scope.showDropZone = true; // default

                var loadFunc = function() {
                    scope.fileInProgress = false;        
                    scope.$apply();    
                }
                var loadErrorFunc = function() {
                    scope.fileInProgress = false; 
                    scope.$apply();   
                }

                scope.$on("$destroy",function() {
                    var img = element.find('img.realImage');
                    img.unbind('load', loadFunc);
                    img.unbind('error', loadErrorFunc);
                });

                scope.addImgListeners = function() {
                    // Set fileInProgress to false on image load, or on image load failure. We've been setting it to false on return 
                    // from direct uploader upload, but this is a better place to do it. There is no need to set it to false elsewhere.
                    var img = element.find('img.realImage');
                    
                    if (img.length > 0) { // img.length will be 0 at beginning of this link function, if using angular v 1.5.
                        img.bind('load', loadFunc);
                        img.bind('error', loadErrorFunc);
                    }
                }

                // Only add image listeners once.
                var unwatch = scope.$watch('url', function(newVal, oldVal) {
                    if (newVal) {
                        $timeout(function() { // timeout so the img element exists before adding the image listeners.
                            scope.addImgListeners();
                        });   
                        unwatch();
                    }
                });
                
            } // end link

		} // end return
	}); // end itcApp.directive

}); // end define