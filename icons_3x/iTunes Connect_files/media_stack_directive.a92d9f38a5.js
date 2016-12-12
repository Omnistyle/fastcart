define(['sbl!app'], function (itcApp) {

    /* Example:
        <div media-stack class="animate-repeat" ng-repeat="dev in others"
            device="{{dev}}" 
            images="getMediaStackGroup(dev)"
            videos=""
            style="color:black; display:inline">
        </div>
    */
    /* for ss */
	itcApp.directive('mediaStack', function($sce, $timeout, getLocKeyFromRootAndDevice) {
        return {
          restrict: 'A',
          //replace: true,
          templateUrl: getGlobalPath('/itc/views/directives/media_stack_template.html'),
          scope: {
            images: "=",
            videos: "=",
            videoData: "=",
            device: "@",
            l10n: "=",
            mediaData: "=",
            localeCode: "@",
            error: "=",
            positionErrorRelativeTo: "@", 
            isPrimLang: "=",
            allowsVideo: "=",
            stackImageCount: "="
          }, 
          
          link: function(scope, element, attrs) {
            //log("in mediaStack dir ", scope.device);
            
            var zone = element.find(".zone");
            // ***** if replace is true: var zone = element; 
            var img = zone.find("img");
            
            // update image if loc changes.
            scope.$watch('localeCode', function(newVal, oldVal) {
                if (newVal) {
                    scope.updateImageUrl();
                }
            });

            // Watch for any changes to first image
            scope.$watch('images[0].thumbnailData', function(newVal, oldVal) {
                if (newVal) {
                    //log("in mediaStack dir watch ", scope.images);
                    scope.updateImageUrl();
                }
            });

            // Watch for any changes to the video
            scope.$watch('videos[0].thumbnailData', function(newVal, oldVal) {
                if (newVal) {
                    //log("in mediaStack dir watch ", scope.images);
                    scope.updateImageUrl();
                }
            });

            scope.$watch('images.length', function(newVal, oldVal) {
                if (newVal !== undefined) {
                    scope.updateImageUrl();
                    scope.updateStackImageCount();
                }
            });

            scope.$watch('videos.length', function(newVal, oldVal) {
                if (newVal !== undefined) {
                    scope.updateImageUrl();
                    scope.updateStackImageCount();
                }
            });

            scope.updateStackImageCount = function() {
                var numImages = 0;
                if (scope.images) {
                    numImages = scope.images.length;
                }
                var numVideos = scope.getNumVideos();
                scope.stackImageCount = numImages + numVideos;
                //log("scope.stackImageCount for " + scope.device + ": " + scope.stackImageCount);

                // this is to set the width on the description below the image if this stack is empty (if full, it gets set in setZoneDimensions())
                var w = parseInt(zone.css("width"));
                var text = element.find(".textDescription");
                text.css("width", w + "px");
            }

            // watch vid data from json if scope.videos has not been initialized yet.
            // previewImageUrl
            scope.$watch('videoData', function(newVal, oldVal) {
                if (newVal) {
                    if (!scope.videos) {
                        //log("vid data ", scope.videoData);
                    }
                    //scope.updateImageUrl();
                }
            });

            scope.$watch('mediaData.scaleImages', function(newVal, oldVal) {
                if (newVal !== undefined) {
                    //log("mediaData for " + scope.device + ": ", scope.mediaData);
                    /*
                        groupToInheritFromIfScaled: 
                            dev: "iphone6"
                            loc: "en-GB"
                        scaleImages: false
                    */
                    scope.updateImageUrl();
                }
            });

            scope.getPreviewImageUrlFromJSON = function() {
                //scope.videoData is 'versionInfo.details.value' 
                if (scope.mediaData && scope.mediaData.scaleImages!==undefined) {
                    var vidData;
                    if (scope.mediaData.scaleImages) {
                        if (scope.allowsVideo) {
                            var groupToInheritFrom = scope.mediaData.groupToInheritFromIfScaled;
                            vidData = scope.getVideoDataFromJSON(groupToInheritFrom.loc, groupToInheritFrom.dev);
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        vidData = scope.getVideoDataFromJSON(scope.localeCode, scope.device);
                    }

                    if (!vidData) {
                        return null; // happens for iphone35, for example
                    }
                    else {
                        return vidData.previewImageUrl;
                    }
                }
                else {
                    return null;
                }
            }

            scope.getVideoDataFromJSON = function(localeCode, device) {
                // scope.videoData is 'versionInfo.details.value'. 
                var detailForLoc = _.find(scope.videoData, function(detail) {
                    return (detail.language.toLowerCase() === localeCode.toLowerCase());
                });

                var groups = detailForLoc.displayFamilies.value;
                var groupForDevice = _.find(groups, function(group) {
                    return (group.name === device);
                });
                var trailer = groupForDevice.trailer;

                var vidData = trailer.value;
                return vidData;
            }

            scope.hasVideos = function() {
                var hasVids = false;
                var videoPrevImgFromJSON = scope.getPreviewImageUrlFromJSON();
                // use the first image
                if (scope.isPrimLang && scope.videos && scope.videos.length > 0) {
                    hasVids = true;
                }
                else if (videoPrevImgFromJSON) {
                    hasVids = true;
                }
                return hasVids;
            }

            scope.getNumVideos = function() {
                if (scope.hasVideos()) {
                    return 1;
                }
                else {
                    return 0;
                }    
            }

            scope.updateImageUrl = function() {
                var videoPrevImgFromJSON = scope.getPreviewImageUrlFromJSON();
                // use the first image
                if (scope.isPrimLang && scope.videos && scope.videos.length > 0) {
                    scope.previewImgSrc = scope.videos[0].thumbnailData;
                }
                else if (scope.isPrimLang && videoPrevImgFromJSON) {
                    //log("updateImageUrl: media data: ", scope.mediaData);
                    scope.previewImgSrc = videoPrevImgFromJSON;
                }
                else if (scope.images && scope.images.length > 0) {
                    scope.previewImgSrc = scope.images[0].thumbnailData;
                }
                else {
                    // clear it out
                    // note: setting scope.previewImgSrc to the empty string does not clear the src attribute as expected
                    scope.previewImgSrc = "empty";
                }
                scope.updateStackImageCount();
            };

            scope.imageEmptyState = function() {
                return scope.previewImgSrc === "empty";
            }

            scope.getScaledText = function() {
                if (scope.mediaData) {
                    var group = scope.mediaData.groupToInheritFromIfScaled;
                    if (group) {
                        var locDevice = scope.l10n.interpolate('ITC.apps.deviceFamily.long.inSentence.' + group.dev);
                        if (scope.localeCode.toLowerCase() === group.loc.toLowerCase() && scope.isPrimLang) {   
                            var locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.ScreenshotText.withoutLang.', group.dev);   
                            return scope.l10n.interpolate(locKey, {'device': locDevice});
                        }
                        else {
                            var locLang = scope.l10n.interpolate('ITC.locale.' + group.loc.toLowerCase());
                            var locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.ScreenshotText.withLang.', group.dev);
                            return scope.l10n.interpolate(locKey, {'device': locDevice, 'language': locLang});
                        }
                    }
                }
                return "";
            }

            // THIS is where we get the image width. Pass it along (emit it) to the parent scope.
            img.bind('load', function() {
                //scope.imageError = false;
                //scope.loadError = false;
                //zone.removeClass("loadError");
                scope.setZoneDimensions();
                scope.$apply(); //?
            });

            scope.setOrientationClasses = function() {
                //var w = parseInt(zone.css("width")); // note: don't use  zone.width() or zone.height() - they return floats that are slightly off.
                //var h = parseInt(zone.css("height")); 
                
                var imgW = img[0].width;
                var imgH = img[0].height;
                if (imgW > imgH) { // if landscape image but there are vertical images              
                    zone.removeClass("portrait");
                    zone.addClass("landscape");
                }
                else {
                    zone.removeClass("landscape");
                    zone.addClass("portrait");
                }
            }

            scope.getWidthExtras = function() {
                var borderWidth = parseInt(zone.css("border-width"));
                var paddingRt = parseInt(zone.css("padding-right"));
                var paddingLt = parseInt(zone.css("padding-left"));
                var marginRt = parseInt(zone.css("margin-right"));
                var marginLt = parseInt(zone.css("margin-left"));
                return paddingRt + paddingLt + marginRt + marginLt + (2*borderWidth); 
            }

            scope.getHeightExtras = function() {
                var borderWidth = parseInt(zone.css("border-width"));
                var paddingTop = parseInt(zone.css("padding-top"));
                var paddingBottom = parseInt(zone.css("padding-bottom"));
                return paddingTop + paddingBottom + (2*borderWidth); 
            };
    
            scope.setZoneDimensions = function() {
                var w = parseInt(zone.css("width")); // note: don't use  zone.width() or zone.height() - they return floats that are slightly off.
                var h = parseInt(zone.css("height")); 
                var zoneWidth = Math.min(w, h); // default to vertical
                var zoneHeight = Math.max(w, h);

                var imgW = img[0].naturalWidth;
                var imgH = img[0].naturalHeight;
                if (imgW > imgH) { // but if horizontal 
                    zoneWidth = Math.max(w, h); 
                    zoneHeight = Math.min(w, h); 
                }
                var data = {};
                data.imgWidth = zoneWidth + scope.getWidthExtras(); 
                data.imgHeight = zoneHeight + scope.getHeightExtras(); 
                data.actualImgHeight = img[0].naturalHeight; //img.height();  
                data.actualImgWidth = img[0].naturalWidth; //img.width();             

                zone.css("height", zoneHeight + "px");
                zone.css("width", zoneWidth + "px");

                var text = element.find(".textDescription");
                text.css("width", zoneWidth + "px");

                if (data.actualImgHeight === 0 || data.actualImgWidth === 0) { // happens if image cannot be loaded
                    img.css("height", "0px"); 
                    img.css("width", "0px");
                }else {
                    img.css("height", "100%");
                    img.css("width", "100%");
                }

                scope.setOrientationClasses();
            };

            scope.updateDropwellWidth = function() { 
                var total = scope.getTotalPreviewImagesWidth();
                scope.setMaxImageHeight();
                scope.updateDropTrayMinWidth(total);
            }; 

            scope.getTotalPreviewImagesWidth = function() {
                var totalWidth = 0;
                var imgWidth;

                for (var i = 0; i < scope.allImagesInDropWell.length; i++) {
                    imgWidth = scope.allImagesInDropWell[i].imgWidth;
                    if (imgWidth !== undefined) { // if dropping a few at a time, some will be undefined initially. 
                        totalWidth += imgWidth;
                    }
                }
                if (scope.allVideosInDropWell) {
                    for (var i = 0; i < scope.allVideosInDropWell.length; i++) {
                        imgWidth = scope.allVideosInDropWell[i].imgWidth;
                        if (imgWidth !== undefined) {
                            totalWidth += imgWidth;
                        }
                    }
                }
                
                return totalWidth;
            };

            // Sets scope.maxHeight to the height of the highest (tallest) image. The drop zone 
            // watches that variable and sets its height accordingly
            scope.setMaxImageHeight = function() {
                var maxHeight = 0;
                var imgHeight;
                for (var i = 0; i < scope.allImagesInDropWell.length; i++) {
                    imgHeight = scope.allImagesInDropWell[i].imgHeight;
                    if (imgHeight !== undefined) { // if dropping a few at a time, some will be undefined initially. 
                        maxHeight = Math.max(imgHeight, maxHeight);
                    }
                }
                if (scope.allVideosInDropWell) {
                    for (var i = 0; i < scope.allVideosInDropWell.length; i++) {
                        imgHeight = scope.allVideosInDropWell[i].imgHeight;
                        if (imgHeight !== undefined) { // if dropping a few at a time, some will be undefined initially. 
                            maxHeight = Math.max(imgHeight, maxHeight);
                        }
                    }
                }

                $timeout(function() {
                    scope.maxHeight = maxHeight;
                    scope.$apply();
                });
            }; 

            scope.updateImageUrl();
            
          }

          
        }
    });

}); // end define