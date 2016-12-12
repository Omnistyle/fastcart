define(['sbl!app'], function (itcApp) {

    /* Example:
    <div media-image class="animate-repeat previewZone" 
        ng-repeat="previewImage in previewImages" 
        data="previewImage"
        video-showing='snapshotInfo.videoShowing' 
        current-index="snapshotInfo.currentIndex" 
        show-slide-show="snapshotInfo.showSlideShow" 
        device="{{device}}" 
        save-error="previewImage.error" 
        loc-file="locFile" 
        video-exists="previewVideos.length>0"
        images-editable="imagesEditable">
    </div>  
    */
    /* for ss */
	itcApp.directive('mediaImage', function($animate, $sce, $timeout, getLocKeyFromRootAndDevice) {
        return {
          restrict: 'A',
          //replace: true,
          templateUrl: getGlobalPath('/itc/views/directives/media_image_template.html'),
          scope: {
            data: "=",
            allImagesInDropWell: "=",
            allVideosInDropWell: "=",
            isVideo: "=",
            showGrabber: "=",
            appPreviewDropped: "=",
            appPreviewSnapshotShowing: "=",
            mediaData: "=",
            isMsgsMedia: "=", // optional, true if this media is an iMessage screenshot

            // these 4 are for passing data to the slideshow
            clickedDevice: "=",
            videoShowing: "=",
            currentIndex: "=",
            showSlideShow: "=",
            
            device: "@",
            localeCode: "@",
            isPrimLang: "=",
            locFile: "=",
            cantPlayVideo: "=",
            
            videoEditable: '=',
            imagesEditable: '=',
            duError: '=',
            videoLoaded: '='
          }, 
          
          link: function(scope, element, attrs) {
            $animate.enabled(element, false); // disable animation on this element until it's visible.
            //$animate.enabled(true);

            // remove animation from the container, or the last screenshot deletion will delete after the text instructinos appear.
            var container = element.closest(".appTrailersContainer2").find(".vertAlignBaseline");
            $animate.enabled(container, false);

            scope.tempPageContent = {};

            //console.log("previewZone LINK");
            scope.hovered = false;
            //console.log("this is videoPreview #" + scope.$parent.$index);
            var zone = element.find(".zone");
            // ***** if replace is true: var zone = element; 
            var img = zone.find("img");
            var playButton = element.find(".playButton");
            var dropTray = element.closest(".dropTray");
            //zone.attr("draggable", scope.imagesEditable);

            // Returns true if to show banner at bottom saying where this media inherits from
            scope.showScaledText = function() {
                if (scope.mediaData) {
                    if (scope.isPrimLang) {
                        return scope.mediaData.scaleImages;
                    }
                    else { // non-prim lang
                        if (scope.isVideo) {
                            return false;
                        }
                        else {
                            return scope.mediaData.scaleImages;
                        }
                    }
                }
                else {
                    return false;
                }
            }

            scope.getScaledText = function() {
                if (scope.mediaData) {
                    var group = scope.mediaData.groupToInheritFromIfScaled;
                    if (group) {
                        var locDevice = scope.locFile.interpolate('ITC.apps.deviceFamily.long.inSentence.' + group.dev);
                        if (scope.localeCode.toLowerCase() === group.loc.toLowerCase() && scope.isPrimLang) {
                            var locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.ScreenshotText.withoutLang.', group.dev);   
                            return scope.locFile.interpolate(locKey, {'device': locDevice});
                        }
                        else {
                            var locLang = scope.locFile.interpolate('ITC.locale.' + group.loc.toLowerCase());
                            var locKey = getLocKeyFromRootAndDevice('ITC.apps.ss.ScreenshotText.withLang.', group.dev);
                            return scope.locFile.interpolate(locKey, {'device': locDevice, 'language': locLang});
                        }
                    }
                }
                return "";
            }

            //
            scope.$watch('mediaData.groupToInheritFromIfScaled', function(newVal, oldVal) {
                if (newVal !== undefined) {
                    if (scope.mediaData.scaleImages) {
                        //scope.scaled = true;
                    }
                    else {
                        //scope.scaled = false;
                    }
                }
            });

            // for video
            scope.$watch('data', function(newVal, oldVal) {   
                // if a new preview image was selected
                if (scope.isVideo && oldVal && newVal && oldVal.previewTimestamp !== newVal.previewTimestamp) {
                    log("newVal allVideosInDropWell[0]: ", newVal);
                    log("oldVal allVideosInDropWell[0]: ", oldVal);

                    scope.setVideoPreview();
                }
            }, true);   

            // for images. Called whenever an image is added/changed.
            scope.$watch('data', function(newVal, oldVal) {
                if (newVal) {
                    //log("data changed: ", scope.data);

                    if (!scope.isVideo) {
                        scope.setImageLoaded(false);
                        
                        if (scope.data.thumbnailData.startsWith("blob")) {
                            scope.previewImgSrc = scope.data.thumbnailData; 
                        }
                        else {
                            scope.previewImgSrc = scope.data.thumbnailData +'?' + new Date().getTime(); // adding time dummy param prevents load from not being triggered a 2nd time.
                        }
                    }
                }
            });

            // Sets an image to loaded (or not) within a particular dropwell. It might be loaded in one device but not yet in another.
            scope.setImageLoaded = function(loaded) {
                if (!scope.data.imageLoaded) {
                    scope.data.imageLoaded = {};
                }
                scope.data.imageLoaded[scope.device] = loaded;
            }


            scope.$watch('allVideosInDropWell', function(newVal, oldVal) {

                // if this is the media_image_directive for the video that was just added to allVideosInDropWell
                if (scope.isVideo && newVal && newVal.length === 1 && scope.data === newVal[0]) { 
                    log("allVideosInDropWell.length went to 1: ", scope.allVideosInDropWell);
                    log("data: ", scope.data);

                    scope.setVideoPreview();

                    // Doing totalPreviewWidthChanged broadcast ahead of time because this is what triggers
                    // the drop zone to shrink. Want it to shrink FIRST, to make room for the video snapshot
                    // that's about to appear in 500 ms.
                    /*
                    var totalWidth = $scope.getTotalPreviewImagesWidth(false);
                    var data = {};
                    data.total = totalWidth + 436; // TBD: remove hardcoding!
                    data.fakeNoDropZone = ($scope.previewImages.length===$scope.numImages); // force drop zone to shrink away if it needs to (ie. if all images are filled)
                    $scope.$broadcast('totalPreviewWidthChanged', data); 
                    $scope.updateDropTrayMinWidth(data, false);
                    $timeout(function() {
                         $scope.previewVideos.push(dataPlusImageInfo);
                         $scope.$apply(); // important
                         $scope.$broadcast('setVideoPreview', $scope.previewVideos.length-1); 
                    }, 500); // 500 - just enough time for the drop zone to shrink and make way for this snapshot.
                    */
                }
            });

            // if this image has an error, don't open dropzone errors. Just show this image's errors.
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
                return scope.data.error || scope.loadError || scope.duError;
            }

            scope.getErrorMessage = function() {
                if (scope.data.error) {
                    return scope.data.error;
                }
                else if (scope.loadError) {
                    return scope.loadError;
                }
                else if (scope.duError) {
                    return scope.duError;
                }
            };

            // returns true if there's a video error
            scope.showErrorText = function() {
                var showErrorText = scope.cantPlayVideo || scope.data.processingVideo || scope.data.videoError;
                if (showErrorText === undefined) {
                    showErrorText = false;
                }
                return showErrorText;
            };

            scope.allowDelete = function() {
                // no longer check if video is editable, as per <rdar://problem/17906747>
                //return scope.hovered && ((scope.videoType && scope.videoEditable) || (!scope.videoType && scope.imagesEditable));
                return scope.hovered && (scope.isVideo || (!scope.isVideo && scope.imagesEditable)) && !scope.mediaData.scaleImages;
                //return true;
            };

            scope.showPlayButton = function() {
                return scope.isVideo && scope.videoLoaded && !scope.showErrorText(); // show play button only if there's no error text
            }

            scope.showAppPreviewLoader = function() {
                var ret = scope.isVideo && !scope.videoLoaded && !scope.hasError() && (scope.mediaData && !scope.mediaData.scaleImages);
                return ret;
            }

            scope.showImageError = function() {
                return !scope.isVideo && scope.imageError;
            }

            scope.allowPosterFrameEdits = function() {
                if (scope.hovered && scope.isVideo && scope.videoEditable) {
                    var hasAnError = scope.showErrorText();
                    return !hasAnError;
                } else {
                    return false;
                }
            };

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

            scope.$watch('isVideo',function(value){
                scope.updateVideoSelectableness();
            });

            scope.updateVideoSelectableness = function() {
                if (scope.isVideo) {
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

            scope.$watch('cantPlayVideo',function(value){
                scope.setErrorText(); 
                scope.updateVideoSelectableness();
                scope.setMask();
            });

            scope.$watch('data.processingVideo',function(value){
                scope.setErrorText(); 
                scope.setMask();
                //log("processingVideo: ", scope.data.processingVideo);
            });

            scope.$watch('data.videoError',function(value){
                scope.setErrorText(); 
                scope.setMask();
            });

            scope.setErrorText = function() {
                //log("setErrorText");
                if (scope.data.processingVideo) {
                    scope.titleText = scope.locFile['ITC.AppVersion.Media.ProcessingVideo']; 
                    scope.textDetail = scope.locFile['ITC.AppVersion.Media.ProcessingVideoDetail'];
                }
                else if (scope.data.videoError) {
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

            scope.setVideoPreview = function() {
                scope.data.videoLoaded = false;
                scope.previewImgSrc = scope.data.thumbnailData;
            }

            element.bind('mouseenter', function() {
                scope.hovered = true;
                scope.$apply();
            });
            element.bind('mouseleave', function() {
                scope.hovered = false;
                scope.$apply();
            });

            scope.setZoneDimensions = function() {
                //var index = scope.$parent.$index;

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
                                    
                //data.imgIndex = index;
                data.isVideo = scope.isVideo;
                data.isWatchScreenshot = scope.isWatchScreenshot();
                
                // tbd: make sure this works for watch.
                scope.data.imgWidth = data.imgWidth; // save the image width
                scope.data.imgHeight = data.imgHeight; 
                scope.data.actualImgHeight = data.actualImgHeight; 
                scope.data.actualImgWidth = data.actualImgWidth; 

                scope.updateDropwellWidth();

                zone.css("height", zoneHeight + "px");
                zone.css("width", zoneWidth + "px");
                if (data.actualImgHeight === 0 || data.actualImgWidth === 0) { // happens if image cannot be loaded
                    img.css("height", "0px"); 
                    img.css("width", "0px");
                }else {
                    img.css("height", "100%");
                    img.css("width", "100%");
                }

                scope.setOrientationClasses();
                
                // center playbutton
                //var playButton = element.find(".playButton");

                var centerHeight = (zoneHeight - playButton.height())/2 + "px";
                playButton.css("top", centerHeight);

                // center loader
                var loader = element.find(".appTrailerLoader");
                loader.css("top", centerHeight);

                //log("playButton height: " + playButton.height());
                //log("loader height: " + loader.height());

                // wait 1/2 a second after drop zone shrinks to show this snapshot (otherwise the drop zone hasn't shrunk yet, 
                // causing this snapshot to temporarily appear BELOW the drop zone because there isn't room for it on same row)
                //$timeout(function(){
                    $animate.enabled(element, true); // enable animation on this element
                    scope.show = true; 
                    scope.$apply();
                    // Here's where appPreviewSnapshotShowing should be set to true
                    if (scope.isVideo) {
                        //scope.show = true; 
                        scope.appPreviewSnapshotShowing = true;
                        scope.appPreviewDropped = false;
                        scope.data.videoLoaded = true;
                    }
                    else {
                        scope.setImageLoaded(true);
                        
                    }
                    scope.$apply();
                //}, 500); 
            };

            scope.updateDropwellWidth = function() { 
                var total = scope.getTotalPreviewImagesWidth();
                scope.updateDropTrayMinWidth(total);
            }; 

            scope.getTotalPreviewImagesWidth = function() {
                var totalWidth = 0;
                var imgWidth;

                if (scope.allImagesInDropWell) {
                    for (var i = 0; i < scope.allImagesInDropWell.length; i++) {
                        imgWidth = scope.allImagesInDropWell[i].imgWidth;
                        if (imgWidth !== undefined) { // if dropping a few at a time, some will be undefined initially. 
                            totalWidth += imgWidth;
                        }
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

            scope.updateDropTrayMinWidth = function(total) {
                var dropTray = element.closest(".dropTray");
                var parent = dropTray.find('.appTrailersContainer2');
                parent.css("min-width", total + "px"); 
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

            scope.$watch('data.error',function(value){            
                if (value) {
                    zone.addClass("saveError");
                }
            }); 

            scope.addRemoveLoadError = function() {
                if (scope.loadError || scope.duError || scope.data.error) {
                    zone.addClass("loadError"); 
                    scope.showErrorBriefly();
                }
                else {
                    zone.removeClass("loadError");
                }
            };

            img.bind('error', function(e) {
                log("There was some error with the image at: " + img[0].src);
                if (!scope.isVideo) { // for now, ignore video image errors. will fix when have more time to work on video.
                    //scope.imageError = true;
                    scope.loadError = scope.locFile['ITC.AppVersion.Media.ErrorMessages.ImageNotLoaded']; 
                    //scope.data.error = scope.locFile['ITC.AppVersion.Media.ErrorMessages.ImageNotLoaded'];
                }
                scope.setZoneDimensions();
                scope.$apply();
            });

            var resetPreviewButton = element.find(".bottomButton");
            resetPreviewButton.bind('click', function() {
                scope.showGrabber = true;
                scope.$apply();
            });

            // To show a tooltip if the button text is shortened with ellipses
            img.bind('mouseenter', function(){
                if (scope.allowPosterFrameEdits() && !scope.mediaData.scaleImages) {
                    var $this = $(this);

                    var button = resetPreviewButton[0];

                    if(button.offsetWidth < button.scrollWidth && (!resetPreviewButton.attr('title') || resetPreviewButton.attr('title').length===0)) {
                        resetPreviewButton.attr('title', resetPreviewButton.text().trim());
                    }
                    else {
                        resetPreviewButton.attr('title', "");
                    }
                }
            });

            // To show a tool tip on the bottomMask if text is shortened with ellipses
            element.find(".bottomMask").bind('mouseenter', function(){
                if (scope.mediaData.scaleImages) {
                    var $this = $(this);

                    if (this.offsetWidth < this.scrollWidth && (!$this.attr('title') || $this.attr('title').length===0)) {
                        var str = this.innerHTML.trim();
                        
                        // replace <br>s with spaces
                        var regex = /<br\s*[\/]?>/gi;
                        str = str.replace(regex, " ");
                        
                        // replace $nbsp;'s
                        //var re = new RegExp(String.fromCharCode(160), "g"); // does not work because at this point it's just text.
                        str = str.replace(new RegExp("&nbsp;", 'g'), " ");

                        $this.attr('title', str);
                    }
                    else {
                        $this.attr('title', "");
                    }
                }
            });

            var deleteButton = element.find(".deleteButton");
            deleteButton.bind('click', function() {
                // note: setting scope.previewImgSrc to the empty string does not clear the src attribute as expected
                // It needs to be cleared so that if the same video is selected after deletion, the load event fires.
                scope.previewImgSrc = "ignore"; 
                var data = {};
                data.index = scope.$parent.$index;
                data.isVideo = scope.isVideo;
                data.device = scope.device;
                data.isMsgsMedia = scope.isMsgsMedia;
                
                if (scope.isVideo) {
                    data.parentArray = scope.allVideosInDropWell;
                }
                else {
                    data.parentArray = scope.allImagesInDropWell;
                }

                // save the parent scope for later use after the transition end.
                scope.savedParentScope = scope.$parent.$parent;
                // Listen for a transitionend so that only once this snapshot is DONE disappearing, we adjust the drop zone width.
                element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', scope.deleteTransitionEnded);

                scope.mediaData.errorInPopup = false;
                scope.$emit('deletePreview2', data);
            });

            scope.deleteTransitionEnded = function(e) {
                // Cheating on Angular a little here. The scope no longer has a parent scope at this point, because we just deleted this element.
                // So using a saved parent scope instead, to pass the message along. An emit won't work.

                var data = {};
                data.watchTray = scope.isWatchScreenshot();
                data.index = scope.$parent.$index;
                data.width = zone[0].clientWidth + scope.getWidthExtras();
                data.containerID = element.closest('.appTrailersContainer2').attr('id');

                scope.updateDropwellWidth();
                scope.savedParentScope.deleteTransitionEnded(data); // deleteTransitionEnded() will cause a slide (left) of the elements to the right
                
                // doesnt work from here
                //scope.$broadcast('zoneDeleteTransitionEnded', data); // makes the following zones slide left
                
                //scope.$emit('deletedPreviewTransitionEnd'); // won't work because this element has been deleted and no longer has a parent scope.
            }

            // For all zones to the right of the deleted element, move the LEFT position so that a nice slide happens.
            scope.$on('zoneDeleteTransitionEnded', function(event, data) { 
                // make sure we're only dealing with other images in this container
                var containerID = element.closest('.appTrailersContainer2').attr('id');
                
                if (!scope.isVideo && (data.index <= scope.$parent.$index) && containerID === data.containerID) {
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
            });

            img.bind('click', function(e) {
                if ((scope.isVideo && !scope.showErrorText()) || !scope.isVideo) { // if playable video or not a video
                    scope.clickedDevice = scope.device;
                    scope.$apply();

                    scope.showSlideShow = true;
                    
                    if (scope.isVideo) {
                        scope.currentIndex = -1;
                    }
                    else {
                        scope.currentIndex = scope.$parent.$index;
                    }
                    scope.videoShowing = scope.isVideo; 
                    scope.$apply();
                }
            });

            // does same thing as the img.bind('click') but assumes this is a scope.videoType is true
            playButton.bind('click', function(e) {
                scope.clickedDevice = scope.device;
                scope.$apply();
                scope.showSlideShow = true;
                scope.currentIndex = -1;
                scope.videoShowing = true;
                scope.$apply();
            });
          },
        }
    });

}); // end define