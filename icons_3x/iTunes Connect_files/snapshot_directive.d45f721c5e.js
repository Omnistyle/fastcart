define(['sbl!app'], function (itcApp) {

	itcApp.directive('previewZone', function($sce, $timeout) {
        return {
          restrict: 'A',
          //replace: true,
          templateUrl: getGlobalPath('/itc/views/directives/snapshot_preview_template.html'),
          scope: {
            /*show: "=",*/
            device: "@",
            error: "=",
            maxHeight: "=",
            showSlideShow: "=",
            showWatchImages: "=", // for slideshow
            currentIndex: "=",
            videoShowing: "=",
            saveError: "=",
            locFile: "=",
            cantPlayVideo: "=",
            processingVideo: "=",
            videoError: "=",
            videoEditable: '=',
            imagesEditable: '=',
            duError: '=',
            videoLoaded: '=',
            dontAnimate: '=',
            videoExists: "=" //f this is a screenshot, this tells us if there's a video in first position.
          }, 
          
          link: function(scope, element, attrs) {

            //console.log("previewZone LINK");
            scope.hovered = false;
            //console.log("this is videoPreview #" + scope.$parent.$index);
            var zone = element.find(".zone");
            // ***** if replace is true: var zone = element; 
            var img = zone.find("img");
            var playButton = element.find(".playButton");
            //zone.attr("draggable", scope.imagesEditable);

            zone.bind('mouseenter', function() {
                if (scope.hasError()) {
                    var dropTray = element.closest(".dropTray");
                    var dropTraysErrorPopup = dropTray.find(" > .errorPopUp");
                    dropTraysErrorPopup.addClass("dontOpen");
                    element.find(".errorPopUp").addClass("open");
                }
            });

            zone.bind('mouseleave', function() {
                if (scope.hasError() && !scope.stayOpen) {
                    var dropTray = element.closest(".dropTray");
                    var dropTraysErrorPopup = dropTray.find(" > .errorPopUp");
                    dropTraysErrorPopup.removeClass("dontOpen");
                    element.find(".errorPopUp").removeClass("open");
                }
            });

            // Special-casing for watch. Blech.
            scope.isWatchScreenshot = function() {
                return scope.device === "watch";
            };

            scope.hasError = function() {
                return scope.saveError || scope.loadError || scope.duError;
            }

            scope.getErrorMessage = function() {
                if (scope.saveError) {
                    return scope.saveError;
                }
                else if (scope.loadError) {
                    return scope.loadError;
                }
                else if (scope.duError) {
                    return scope.duError;
                }
            };

            scope.$watch('dontAnimate', function(newVal, oldVal) {
                if (newVal) {
                    zone.addClass("dontAnimate");
                }
                else {
                    zone.removeClass("dontAnimate");
                }
            });

            // returns true if there's a video error
            scope.showErrorText = function() {
                var showErrorText = scope.cantPlayVideo || scope.processingVideo || scope.videoError;
                if (showErrorText === undefined) {
                    showErrorText = false;
                }
                return showErrorText;
            };

            scope.allowDelete = function() {
                // no longer check if video is editable, as per <rdar://problem/17906747>
                //return scope.hovered && ((scope.videoType && scope.videoEditable) || (!scope.videoType && scope.imagesEditable));
                return scope.hovered && (scope.videoType || (!scope.videoType && scope.imagesEditable));
            };

            scope.showPlayButton = function() {
                return scope.videoType && scope.videoLoaded && !scope.showErrorText(); // show play button only if there's no error text
            }

            scope.showAppPreviewLoader = function() {
                return scope.videoType && !scope.videoLoaded && !scope.hasError();
            }

            scope.showImageError = function() {
                return !scope.videoType && scope.imageError;
            }

            scope.allowPosterFrameEdits = function() {
                if (scope.hovered && scope.videoType && scope.videoEditable) {
                    var hasAnError = scope.showErrorText();
                    return !hasAnError;
                } else {
                    return false;
                }
            };

            scope.$watch('cantPlayVideo',function(value){
                scope.updateVideoSelectableness();
                scope.setMask();
            });

            scope.$watch('processingVideo',function(value){
                scope.setMask();
            });

            scope.$watch('videoError',function(value){
                scope.setMask();
            });

            scope.setMask = function() {
                var imageHolder = element.find('.imageHolder');
                if (scope.showErrorText()) {
                    imageHolder.addClass("mask"); 
                }
                else {
                    imageHolder.removeClass("mask");
                }
            };

            scope.setMask();

            scope.$watch('videoType',function(value){
                scope.updateVideoSelectableness();
            });

            scope.updateVideoSelectableness = function() {
                if (scope.videoType) {
                    if (scope.showErrorText()) {
                        element.find("img.selectable").removeClass("selectable");
                    }
                    else {
                        element.find("img").addClass("selectable");
                    }
                }
            };

            scope.$watch('locFile',function(value){
                if (value !== undefined) {
                    scope.setErrorText();  
                }
            });

            scope.setErrorText = function() {
                if (scope.processingVideo) {
                    scope.titleText = scope.locFile['ITC.AppVersion.Media.ProcessingVideo']; 
                    scope.textDetail = scope.locFile['ITC.AppVersion.Media.ProcessingVideoDetail'];
                }
                else if (scope.videoError) {
                    scope.titleText = scope.locFile['ITC.AppVersion.Media.GenericVideoError']; 
                    scope.textDetail = scope.locFile['ITC.AppVersion.Media.GenericVideoErrorDetail'];
                }
                else if (scope.cantPlayVideo) {
                    scope.titleText = scope.locFile['ITC.AppVersion.Media.CantPlayVideo']; 
                    scope.textDetail = scope.locFile['ITC.AppVersion.Media.CantPlayVideoDetail'];
                }
                else {
                    scope.titleText = "";
                    scope.textDetail = "";   
                }
            };

            scope.$on('setImagePreview', function(event, indexInParentArray) { 
                scope.indexInParentArray = indexInParentArray;

                var index = scope.$parent.$index; // will be set if this is in an ng-repeat (which it is for images)
                if (index === indexInParentArray && !scope.videoType && !scope.isWatchScreenshot()) {
                    
                    var dataFromParent = scope.$parent.previewImages[index];

                    if (scope.snapshotIsShowing) { // load will not get called on the image again
                        var snapshotData = {};
                        snapshotData.watchImage = false;
                        scope.$emit('snapshotIsShowing', snapshotData);
                    }

                    scope.previewImgSrc = dataFromParent.thumbnailData;
                    scope.videoType = dataFromParent.videoType;

                    if(!scope.$parent.$$phase) {
                        scope.$apply();
                    }

                }
                
            });

            scope.$on('setWatchImage', function(event, indexInParentArray) { 
                scope.indexInParentArray = indexInParentArray;

                var index = scope.$parent.$index; // will be set if this is in an ng-repeat (which it is for images) //??
                if (index === indexInParentArray && !scope.videoType && scope.isWatchScreenshot()) {
                    
                    var dataFromParent = scope.$parent.watchImages[index];
                    
                    if (scope.snapshotIsShowing) { // load will not get called on the image again
                        var snapshotData = {};
                        snapshotData.watchImage = true;
                        scope.$emit('snapshotIsShowing', snapshotData);
                    }

                    scope.previewImgSrc = dataFromParent.thumbnailData;
                    scope.videoType = dataFromParent.videoType;

                    if(!scope.$parent.$$phase) {
                        scope.$apply();
                    }

                }
               
            });

            scope.$on('setVideoPreview', function(event, indexInParentArray) { 
                scope.indexInParentArray = indexInParentArray;
                
                var index = scope.$parent.$index; // will be set if this is in an ng-repeat (which it is for videos)
                if (index === indexInParentArray && (scope.videoType === undefined || scope.videoType)) {

                    var dataFromParent = scope.$parent.tempPageContent.previewVideos[index];
                    scope.previewImgSrc = dataFromParent.thumbnailData;
                    scope.videoType = dataFromParent.videoType;

                    if(!scope.$parent.$$phase) {
                        scope.$apply();
                    }
                }
            });

            element.bind('mouseenter', function() {
                    scope.hovered = true;
                    scope.$apply();
            });
            element.bind('mouseleave', function() {
                    scope.hovered = false;
                    scope.$apply();
            });

            scope.setZoneDimensions = function() {
                var index = scope.$parent.$index;

                //console.log("image loaded (w x h) (" + img.width() + " " + img.height() + ")");
                var w = parseInt(zone.css("width")); // note: don't use  zone.width() or zone.height() - they return floats that are slightly off.
                var h = parseInt(zone.css("height")); 
                var zoneWidth = Math.min(w, h); // default to vertical
                var zoneHeight = Math.max(w, h);

                var imgW = img[0].width;
                var imgH = img[0].height;
                if (imgW > imgH) { // but if horizontal 
                    zoneWidth = Math.max(w, h); 
                    zoneHeight = Math.min(w, h); 
                }
                var data = {};
                data.imgWidth = zoneWidth + scope.getWidthExtras(); 
                data.imgHeight = zoneHeight + scope.getHeightExtras(); 
                data.actualImgHeight = img[0].naturalHeight; //img.height();  
                data.actualImgWidth = img[0].naturalWidth; //img.width();             
                                    
                data.imgIndex = index;
                data.isVideo = scope.videoType;
                data.isWatchScreenshot = scope.isWatchScreenshot();
                scope.$emit("imageLoaded", data);    // CAUSES drop tray min width to change just by the right amount

                zone.css("height", zoneHeight + "px");
                zone.css("width", zoneWidth + "px");
                if (data.actualImgHeight === 0 || data.actualImgWidth === 0) { // happens if image cannot be loaded
                    img.css("height", "0px"); 
                    img.css("width", "0px");
                }else {
                    img.css("height", "100%");
                    img.css("width", "100%");
                }

                scope.setMarginTop();
                
                // center playbutton
                //var playButton = element.find(".playButton");
                playButton.css("top", (zoneHeight - playButton.height())/2 + "px");

                // center loader
                var loader = element.find(".appTrailerLoader");
                loader.css("top", (zoneHeight - loader.height())/2 + "px");

                // wait 1/2 a second after drop zone shrinks to show this snapshot (otherwise the drop zone hasn't shrunk yet, 
                // causing this snapshot to temporarily appear BELOW the drop zone because there isn't room for it on same row)
                //$timeout(function(){
                    scope.show = true; 
                    scope.$apply();
                    // Here's where appPreviewSnapshotShowing should be set to true
                    if (scope.videoType) {
                        scope.show = true; 
                        scope.$apply();
                        scope.$emit('appPreviewSnapshotIsShowing');
                    }
                    else {
                        var snapshotData = {}
                        snapshotData.watchImage = scope.isWatchScreenshot();
                        scope.$emit('snapshotIsShowing', snapshotData);
                        scope.snapshotIsShowing = true;
                    }
                //}, 500); 
            };

            scope.getHeightExtras = function() {
                var borderWidth = parseInt(zone.css("border-width"));
                var paddingTop = parseInt(zone.css("padding-top"));
                var paddingBottom = parseInt(zone.css("padding-bottom"));
                //var marginTop = parseInt(zone.css("margin-top"));
                //var marginBottom = parseInt(zone.css("margin-bottom"));
                //return paddingTop + paddingBottom + marginTop + marginBottom + (2*borderWidth); 
                return paddingTop + paddingBottom + (2*borderWidth); 
            };

            scope.getWidthExtras = function() {
                var borderWidth = parseInt(zone.css("border-width"));
                var paddingRt = parseInt(zone.css("padding-right"));
                var paddingLt = parseInt(zone.css("padding-left"));
                var marginRt = parseInt(zone.css("margin-right"));
                var marginLt = parseInt(zone.css("margin-left"));
                return paddingRt + paddingLt + marginRt + marginLt + (2*borderWidth); 
            }

            scope.$watch('maxHeight', function(newVal, oldVal) {
                if (newVal && img[0].width) {
                    scope.setMarginTop(true);
                }
            });

            scope.setMarginTop = function(show) {
                var w = parseInt(zone.css("width")); // note: don't use  zone.width() or zone.height() - they return floats that are slightly off.
                var h = parseInt(zone.css("height")); 
                var extras = scope.getHeightExtras();

                var imgW = img[0].width;
                var imgH = img[0].height;
                if (imgW > imgH && scope.maxHeight !== 0) { // if landscape image but there are vertical images              
                    // Set margin-top so that landscape image will be vertically centered
                    var marginTop = (scope.maxHeight - Math.min(w, h))/2;
                    zone.css("margin-top", marginTop);
                    zone.removeClass("portrait");
                    zone.addClass("landscape");
                }
                else {
                    zone.removeClass("landscape");
                    zone.addClass("portrait");
                }

                if (show) {
                    //console.log("set margin top");
                    scope.show = true; 
                }
               
            }

            // THIS is where we get the image width. Pass it along (emit it) to the parent scope.
            img.bind('load', function() {
                scope.imageError = false;
                scope.loadError = false;
                //zone.removeClass("loadError");
                scope.setZoneDimensions();
                scope.$apply(); //?
            });

            scope.showErrorBriefly = function() {
                // show the error for 3 seconds regardless of mouse hover.
                var errorPopup = element.find('.errorPopUp');
                errorPopup.addClass("open");
                scope.stayOpen = true;
                $timeout(function(){
                    errorPopup.removeClass("open");
                    scope.stayOpen = false;
                }, 3000);
            };

            scope.$watch('loadError',function(value){
                scope.addRemoveLoadError();
            });

            scope.$watch('duError',function(value){
                scope.addRemoveLoadError();
            });

            scope.$watch('saveError',function(value){            
                if (value) {
                    zone.addClass("saveError");
                }
            }); 

            scope.addRemoveLoadError = function() {
                if (scope.loadError || scope.duError || scope.saveError) {
                    zone.addClass("loadError"); 
                    scope.showErrorBriefly();
                }
                else {
                    zone.removeClass("loadError");
                }
            };

            img.bind('error', function(e) {
                console.log("There was some error with the image at: " + img[0].src);
                if (!scope.videoType) { // for now, ignore video image errors. will fix when have more time to work on video.
                    //scope.imageError = true;
                    scope.loadError = scope.locFile['ITC.AppVersion.Media.ErrorMessages.ImageNotLoaded']; 
                    //scope.saveError = scope.locFile['ITC.AppVersion.Media.ErrorMessages.ImageNotLoaded'];
                }
                scope.setZoneDimensions();
                scope.$apply();
            });

            var resetPreviewButton = element.find(".bottomButton");
            resetPreviewButton.bind('click', function() {
                scope.$emit('showVideoModal', true);
            });

            var deleteButton = element.find(".deleteButton");
            deleteButton.bind('click', function() {
                // note: setting scope.previewImgSrc to the empty string does not clear the src attribute as expected
                // It needs to be cleared so that if the same video is selected after deletion, the load event fires.
                scope.previewImgSrc = "ignore"; 
                var data = {};
                data.index = scope.$parent.$index;
                data.isVideo = scope.videoType;

                // save the parent scope for later use after the transition end.
                scope.savedParentScope = scope.$parent.$parent;
                // Listen for a transitionend so that only once this snapshot is DONE disappearing, we adjust the drop zone width.
                element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', scope.deleteTransitionEnded);
                
                data.isWatchScreenshot = scope.isWatchScreenshot();
                scope.$emit('deletePreview', data);
            });

            scope.deleteTransitionEnded = function(e) {
                // Cheating on Angular a little here. The scope no longer has a parent scope at this point, because we just deleted this element.
                // So using a saved parent scope instead, to pass the message along. An emit won't work.

                var data = {};
                data.watchTray = scope.isWatchScreenshot();
                data.index = scope.$parent.$index;
                data.width = zone[0].clientWidth + scope.getWidthExtras();

                scope.savedParentScope.deleteTransitionEnded(data); // deleteTransitionEnded() will cause a slide (left) of the elements to the right
                //scope.$emit('deletedPreviewTransitionEnd'); // won't work because this element has been deleted and no longer has a parent scope.
            }

            // For all zones to the right of the deleted element, move the LEFT position so that a nice slide happens.
            scope.$on('zoneDeleteTransitionEnded', function(event, data) { 
                if ((data.watchTray && scope.isWatchScreenshot()) || (!data.watchTray && !scope.isWatchScreenshot())) {
                    if (data.index <= scope.$parent.$index) {
                        zone.css("left", data.width + "px");
                        
                        // Triple nested timeouts. Yeah, that's right.
                        $timeout(function(){
                            zone.addClass("leftTransition");
                            $timeout(function(){
                                zone.css("left", "0px");
                                $timeout(function(){
                                    zone.removeClass("leftTransition");
                                }, 100); // remove the transition class after the transition has ended.
                            }); 
                        });  
                    }
                }
            });

            img.bind('click', function(e) {
                if ((scope.videoType && !scope.showErrorText()) || !scope.videoType) { // if playable video or not a video
                    scope.showSlideShow = true;
                    scope.showWatchImages = scope.isWatchScreenshot();
                    if (scope.videoType) {
                        scope.currentIndex = -1;
                    }
                    else {
                        scope.currentIndex = scope.$parent.$index;
                    }
                    scope.videoShowing = scope.videoType;
                    scope.$apply();
                }
            });

            // does same thing as the img.bind('click') but assumes this is a scope.videoType is true
            playButton.bind('click', function(e) {
                scope.showSlideShow = true;
                scope.currentIndex = -1;
                scope.videoShowing = true;
                scope.$apply();
            });
          },
        }
    });

}); // end define