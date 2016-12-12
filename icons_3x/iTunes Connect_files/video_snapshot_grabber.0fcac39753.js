define(['sbl!app'], function (itcApp) {
    /* for ss */
	itcApp.directive('videoSnapshotGrabber',function($timeout, $sce){
        return {
            restrict: 'A',
            templateUrl: getGlobalPath('/itc/views/directives/video_grabber_template.html'),
            scope: {
                show: "=",
                data: "=",
                allVideosInDropWell: "=",
                allVideos: "=",
                mediaErrors: "=",
                mediaData: "=",
                data2: "=", // video drop data
                refresh: "=",
                totalNumVideos: "=",
                appPreviewSnapshotShowing: "=",
                error: "=",
                locFile: "=",
                imageValidationData: "=",
                device: "@",
                localeCode: "@", 
                cantPlayVideo: "=", 
                previewPlayAllowed: "@",
                setVideoLoadingErrorFunc: "&", // removed use of this but keeping it around just in case
                grabHasHappenedBefore: "=" // gets reset to false every time screenshots/video are refreshed
            }, 
          
            link: function(scope, element, attrs) {

                log("videoSnapshotGrabber link() for " + scope.device);
                
                //var v, jqV; // Set this once the video element is created.
                var c = element.find('canvas')[0];
                var hiddenCanvas;
                scope.noChange = true;

                var DATA_PREFIX = 'data:';

                // data2 is video drop data: tempPageContent.mediaData[currentLoc][currentDevice].videoDropData
                scope.$watch('data2', function(newVal, oldVal) {
                    if (newVal) {
                        log("dataFromVideoDrop: ", scope.data2);
                        scope.setVideoURL2();
                        scope.data2 = null; // reset it.
                    }
                });

                // data (in the case of video) is the data in the json: versionInfo.details.yadayadayada
                scope.$watch('data', function(newVal, oldVal) {
                    if (newVal === null) { // watch for when video is deleted
                        hiddenCanvas = null; 
                    }
                });

                // called when scope.refresh is set to true. Reloads video preview.
                scope.$watch('refresh', function(newVal, oldVal) {
                    if (newVal) {
                        scope.refresh = false; // reset it.

                        if (scope.mediaData && scope.mediaData.scaleImages) {
                            log("not refreshing for dev: " + scope.device);
                            return;
                        }

                        if (scope.allVideos.initialized("ALL LANGUAGES", scope.device) && scope.allVideos.getGroup("ALL LANGUAGES", scope.device).length > 0) { // one video for ALL languages
                            
                            scope.allVideosInDropWell = scope.allVideos.getGroup("ALL LANGUAGES", scope.device); // one video for ALL languages
                            
                            if(!scope.$parent.$$phase) {
                                scope.$apply();
                            }

                            if (scope.allVideosInDropWell.length === 1) {
                                var video = scope.allVideosInDropWell[0];
                                // THOUGHT: if video.data already exists (which it does if switching to a device that already has a video)
                                // there is no need to have setVideoURL do the copyPreview once video loads. We already have the image data!

                                var data = {};
                                if (video.videoFile) {
                                    scope.appPreviewSnapshotShowing = false;  
                                    if(!scope.$parent.$$phase) {
                                        scope.$apply();
                                    }
                                    scope.setVideoURL2(); 
                                }
                                else { // if no file (ie. if the video was from the server) 
                                    var data = {};
                                    data.data = video.data;
                                    data.previewImage = video.data; 
                                    data.thumbnailData = video.data;
                                    if (data.previewImage.indexOf(DATA_PREFIX) === 0) { // it is possible that the video will be from the server but the preview image is new
                                        data.previewImageFromServer = false;    
                                    }
                                    else {
                                        data.previewImageFromServer = true;
                                    }
                                    data.previewTimestamp = video.previewTimestamp;
                                    data.isPortrait = (video.imgHeight > video.imgWidth); 
                                    data.upload = false;
                                    //$scope.copyPreview(data, false); // NO. Need to setVideoURL in the last case below.

                                    if (video.processingVideo) { // if video is processing
                                        data.processingVideo = true;
                                        data.cantPlayVideo = true;
                                        scope.updateVideoModel(data, false);
                                    }
                                    else if (video.videoError) { // if video error
                                        data.videoError = true;
                                        data.cantPlayVideo = true;
                                        scope.updateVideoModel(data, false);
                                    }
                                    else { // if video is good and ready --- TBD: test this scenario
                                        if (video.videoUrlFromServer) {
                                            data.videoUrlFromServer = video.videoUrlFromServer;
                                            data.processingVideo = false;
                                            scope.appPreviewSnapshotShowing = false;  
                                            if(!scope.$parent.$$phase) {
                                                scope.$apply();
                                            } 
                                            scope.setVideoURL2();
                                        }
                                        else { // shouldn't happen
                                            log("Woops - video.videoUrlFromServer was null.");
                                        }
                                    }   
                                }   
                            }        
                        }
                        else {
                            if (!scope.allVideos.initialized("ALL LANGUAGES", scope.device)) {
                                //scope.allVideos.initializeGroup("ALL LANGUAGES", scope.device);
                                scope.allVideosInDropWell = scope.allVideos.initializeGroup("ALL LANGUAGES", scope.device);
                            }
                            
                            if(!scope.$parent.$$phase) {
                                scope.$apply();
                            }

                            if (scope.data) { //  the data is the data in the json
                                if (scope.data.videoStatus === "Done" && scope.data.videoUrl) { // Video is ready
                                    scope.appPreviewSnapshotShowing = false; 
                                    scope.setVideoURL2();
                                }            
                                else if (scope.data.videoStatus === "Running" || !scope.data.videoUrl 
                                    || scope.data.videoStatus === "Error") { // Video is processing or there's an error
                                    var data = {};
                                    data.data = scope.data.fullSizedPreviewImageUrl;
                                    data.thumbnailData = scope.data.previewImageUrl;
                                    if (!scope.data.fullSizedPreviewImageUrl) {
                                        // not sure yet how to handle this or if it's ever an issue
                                        log("preview image url does not exist yet: " + scope.data.previewImageStatus);
                                    }
                                    data.previewImage = scope.data.fullSizedPreviewImageUrl;
                                    data.previewImageFromServer = true;
                                    data.previewTimestamp = "00:00:" + scope.data.previewFrameTimeCode;
                                    data.isPortrait = scope.data.isPortrait;
                                    data.upload = false;
                                    data.cantPlayVideo = true;

                                    if (scope.data.videoStatus === "Running" || !scope.data.videoUrl) {
                                        data.processingVideo = true;
                                    }
                                    else if (scope.data.videoStatus === "Error") { // shouldn't happen anymore. Backend no longer returns Error.
                                        data.videoError = true;
                                    }

                                    scope.updateVideoModel(data, false);
                                }
                            }

                            else { // happens on devices with no video (ie. iphone35)
                                log("scope.data is undefined.");
                            }
                        }

                    }
                });

                // Determines if it's playable in the browser and grabs the preview image. The end result is to add or modify scope.allVideosInDropWell[0].
                // - If it is playable, sets the source on the video element, which triggers onVideoLoadedFunc,
                // which either uses the preview timestamp or grabs the image at 5 seconds and calls copyPreview on that, which adds/modifies scope.allVideosInDropWell[0].
                // - If not playable, calls copyPreview with the existing previewImage from the json, which adds/modifies scope.allVideosInDropWell[0].
                scope.setVideoURL2 = function() { 

                    if (scope.mediaData && scope.mediaData.scaleImages) {
                        log("not calling setVideoURL2() for dev: " + scope.device);
                        return;
                    }

                    log("setVideoURL2: ", scope.allVideosInDropWell);
                    var videoData;
                    if (scope.allVideosInDropWell) {
                        videoData = scope.allVideosInDropWell[0];
                    }
                    //console.info('setVideoURL: ', data);
                    //scope.videoURL = data.url; // so that videoSnapshotTemplate.html gets the right value. 
                    var fileType, sourceEl, url;
                    // if got a file
                    if (scope.data2) { // if just uploaded
                        scope.file = scope.data2.file; //data.file; // save for later
                        url = scope.data2.url;
                        fileType = scope.file.type; //data.file.type;
                        sourceEl = '<source type="' +  fileType + '">';
                        if (fileType === "video/quicktime") {
                            sourceEl += '<source type="video/mp4">'; // makes .mov movie work in chrome
                        }     
                    }
                    else if (videoData && videoData.videoFile) { // if uploaded but changed tabs back and forth.
                        /* videoData looks like:
                                actualImgHeight: 1242
                                actualImgWidth: 2208
                                cantPlayVideo: undefined
                                data: "data:image/jpeg;base64,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…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"
                                imgHeight: 260
                                imgWidth: 481
                                isNewVideo: true
                                isPortrait: false
                                previewTimestamp: "00:00:05:00"
                                processingVideo: undefined
                                thumbnailData: "data:image/jpeg;base64,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…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"
                                uploaded: true
                                videoError: undefined
                                videoFile: File
                                videoType: true
                                videoUrlFromServer: undefined

                        */
                        scope.file = videoData.videoFile;
                        //url = videoData.????
                        //data.file = video.videoFile;
                        //data.previewImage = video.data; // the preview image blob!
                        //data.thumbnailData = video.data;
                        //data.previewImageFromServer = false;
                        var videoFile = URL.createObjectURL(scope.file);
                        url = $sce.trustAsResourceUrl(videoFile);   // this does seem necessary.

                        //data.previewTimestamp = video.previewTimestamp;
                        //data.upload = false; // don't upload. it's already been uploaded (on drop)

                        fileType = scope.file.type; //data.file.type;
                        sourceEl = '<source type="' +  fileType + '">';
                        if (fileType === "video/quicktime") {
                            sourceEl += '<source type="video/mp4">'; // makes .mov movie work in chrome
                        }   
                    }
                    else { // if got a url from server
                        fileType = "application/x-mpegurl";
                        sourceEl = '<source type="' +  fileType + '">'; // add src in ajax call
                    }

                    // This is how we're getting video source to change - reinserting a video element altogether.
                    // This is all because of an Angular bug with setting ng-src on a video's, source's src.
                    element.find(".videoHolder").html('<video crossorigin="anonymous" controls="" class="video" name="media">' + sourceEl + '</video>'); 

                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 

                    var canPlayIt = false;
                    if ( v.canPlayType ) {
                        canPlayIt = "" !== v.canPlayType(fileType);
                        if (fileType === "video/quicktime" && !canPlayIt) {
                            canPlayIt = "" !== v.canPlayType("video/mp4"); // for chrome
                        }
                    }
                    
                    if (!scope.cantPlayVideo) { // only change scope.cantPlayVideo if it was previously set to false (if it was playable according to the properties)
                                                // if the properties say we can't play it, don't override the properties. 
                        scope.cantPlayVideo = !canPlayIt; 
                    }
                    if (scope.previewPlayAllowed === "false") {
                        canPlayIt = false;
                    } 
                    if (!canPlayIt) {
                        // just copy the preview image to the snapshot zone    
                        scope.copyPreviewExistingImage(scope.data.previewImageUrl, "00:00:" + scope.data.previewFrameTimeCode, scope.data.videoUrl);
                    }
                    else {
                        if (scope.file) {
                            // set up listeners before we add the source url to the src attribute
                            jqV.on("loadeddata", 
                                {data: scope.data2},
                                scope.onVideoLoadedFunc); 
                            jqV.on("error", 
                                {data: scope.data2},
                                scope.onVideoLoadingErrorFunc);
                            jqV.on("seeked", 
                                {data: scope.data2},
                                scope.onVideoSeekedFunc);
                            jqV.on("ended", 
                                {data: scope.data2},
                                scope.onVideoEndedFunc);

                            jqV.find("source").attr("src", url);
                            v.load();
                        }
                        // if we have a video url from the server, we need to tweak the source url so that
                        // it's not from a different domain, or we end up tainting the canvas and getting 
                        // DOM security errors when we try to save a new poster frame.
                        else if (scope.data.videoUrl) { // if got a url from server

                            // set up listeners before we add the source url to the src attribute
                            jqV.on("loadeddata", 
                                {data: scope.data},
                                scope.onVideoLoadedFunc); 
                            jqV.on("error", 
                                {data: scope.data},
                                scope.onVideoLoadingErrorFunc);
                            jqV.on("seeked", 
                                {data: scope.data},
                                scope.onVideoSeekedFunc);
                            jqV.on("ended", 
                                {data: scope.data},
                                scope.onVideoEndedFunc);

                            $.ajax({
                                type: 'get',
                                url : scope.data.videoUrl,
                                crossDomain: 'true',
                                success: function(vidData) {
                                    // get a base64 version of the video!
                                    var base64 = window.btoa(vidData);
                                    // get a new url!
                                    var newURL = DATA_PREFIX + 'application/x-mpegurl' + ';base64,' + base64; // holy crap this works

                                    jqV.find("source").attr("src", newURL);
                                    //log("loading vid for " + scope.device + ": ", v);
                                    v.load();
                                },
                                error: function(vidData) { 
                                    console.log('Error: failed to get video data: ' + vidData.responseText);
                                    scope.upload = false;
                                    scope.grabExistingImage(scope.data.fullSizedPreviewImageUrl, true); //data.previewImageFromServer);
                                    scope.copyPreviewExistingImage(scope.data.previewImageUrl,  "00:00:" + scope.data.previewFrameTimeCode, scope.data.videoUrl, true);

                                    // To get the error in a red bubble instead:
                                    //scope.setVideoLoadingErrorFunc(); // calls setGenericVideoLoadingError in app_version_ctrl
                                }
                            });
                    
                        }
                    }   
                   
                };
                
                scope.$watch('show', function(newVal, oldVal) {
                    if (!newVal) { // if hiding 
                        scope.stopVideo();

                        var jqV = element.find(".videoHolder video");
                        var v = jqV[0]; 

                        // reset time to start for next opening of this dialog.
                        if (v) {
                            v.currentTime = 0;
                        }
                    }      
                    else { // if showing
                      //c.style.marginTop = (c.parentNode.offsetHeight - c.height)/2 + "px";
                      scope.noChange = true;
                      scope.copyPosterFrameToCanvas(0);
                    }
                });

                // get poster frame dimensions that will pass DU
                scope.getGoodPosterFrameDimensions = function(width, height) {
                    var dimensions = {};
                    dimensions.width = 0;
                    dimensions.height = 0;
                    if (scope.imageValidationData) {
                        var isPortrait = (height>width);
                        var validSizesForDevice = scope.imageValidationData[scope.device].geos;
                        if (validSizesForDevice.indexOf(width + 'x' + height) > -1) {
                            dimensions.width = width;
                            dimensions.height = height;
                        }
                        else {
                            var expectedW, expectedH, expectedDimensionsArr;
                            var smallestW = 10000000;
                            var smallestH = 10000000;
                            for (var i = 0; i < validSizesForDevice.length; i++) {
                                expectedDimensionsArr = validSizesForDevice[i].split("x");
                                expectedW = parseInt(expectedDimensionsArr[0]); 
                                expectedH = parseInt(expectedDimensionsArr[1]); 
                                // get the first width/height at the same orientation that we can scale down to.
                                if ((width > height && expectedW > expectedH) || (width < height && expectedW < expectedH)) { // if landscape or portrait
                                    smallestW = Math.min(smallestW, expectedW);
                                    smallestH = Math.min(smallestH, expectedH);
                                    if (expectedW < width && expectedH < height) { // if scaling down
                                        dimensions.width = expectedW;
                                        dimensions.height = expectedH;
                                        break;
                                    }
                                }
                            }

                            if (dimensions.width === 0 && dimensions.height === 0) {
                                dimensions.width = smallestW;
                                dimensions.height = smallestH;
                            }
                        }
                    }
                    else {
                        console.log("UH OH. imageValidationData not set yet!");
                    }
                    return dimensions;
                };

                scope.onVideoLoadingErrorFunc = function() {
                    console.log("loading error");
                };

                // Called on this modal showing. Just copies the already saved poster frame to teh canvas (not the hidden canvas).
                scope.copyPosterFrameToCanvas = function(indexInParentArray) {
                    var previewImgSrc = scope.allVideosInDropWell[0].data;

                    /* Would call grabExistingImage but that copies the image to the hidden canvas, which
                    is unneccessary here.
                    var previewImageFromServer = true;
                    if (previewImgSrc.indexOf("data:") === 0) {
                        previewImageFromServer = false; 
                    }
                    scope.grabExistingImage(previewImgSrc, previewImageFromServer); 
                    */

                    // create a temporary dummy image element just to draw it on the canvas
                    var img = new Image;      // First create the image...
                    img.onload = function(){  // ...then set the onload handler...
                        var context = c.getContext('2d');   
                        context.drawImage(img, 0, 0, c.width, c.height);
                        // No need to copy to the hidden canvas. This is just for show, not for saving. In fact the 'done'
                        // button is disabled at this point.
                        //var hiddenContext = hiddenCanvas.getContext('2d');
                        //hiddenContext.drawImage(img, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
                    };
                    img.onerror = function() { // shouldn't happen.
                        console.log("copyPosterFrameToCanvas image loading error.");
                    };
                    img.src = previewImgSrc;
                };
                    
                scope.cancel = function() {
                    scope.show = false;
                };

                scope.copyPreview = function(event) {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0];

                    var isUserGrab = false;
                    if (event && event.data && event.data.userGrab) {
                        isUserGrab = true;
                        scope.upload = true; // if it's a user grab, we'll need to upload the new poster frame.
                    }

                    var data = {};

                    data.data = hiddenCanvas.toDataURL("image/jpeg"); // grabbing the bigger image from the hiddenCanvas

                    data.file = scope.file;
                    data.previewTimestamp = scope.formatTime(v.currentTime);
                    data.isPortrait = (c.height > c.width);

                    if (scope.upload === undefined) { 
                        scope.upload = true; // default is to upload
                    }
                    data.upload = scope.upload;

                    scope.updateVideoModel(data, isUserGrab);
                };

                // Given a float, seconds, returns a string of the format "hh:mm:ss:ms".
                scope.formatTime = function(seconds) {
                    var origSeconds = seconds;
                    var prefix = "00:";
                    var minutes = Math.floor(seconds / 60);
                    minutes = (minutes >= 10) ? minutes : "0" + minutes;
                    var seconds = Math.floor(seconds % 60);

                    var remainingMs = (origSeconds - seconds) * 1000 * 100; // * 100 to get rid of the decimal point
                    var ms = Math.round(remainingMs / 3600);

                    seconds = (seconds >= 10) ? seconds : "0" + seconds;
                    ms = (ms >= 10) ? ms : "0" + ms;

                    return prefix + minutes + ":" + seconds + ":" + ms;
                };

                scope.forward = function() {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 
                    v.pause();
                    v.currentTime += 1; //1/30; 
                };

                scope.back = function() {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 
                    v.pause(); // first pause the video, then advance the frame.
                    v.currentTime -= 1; //1/30; 
                };

                // Does the grab. If fakeIt param is true, just draw onto the hidden canvas.
                scope.grab = function (fakeIt) {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0];

                    // grab a smaller version for display
                    var context = c.getContext('2d');       

                    if (!fakeIt) { // to fake it, skip this. to really do a grab (ie. not fake it), do drawImage onto c.
                        context.drawImage(v, 0, 0, c.width, c.height);
                    }
                    
                    // and a bigger version (from a hidden canvas) for file creation later in scope.copyPreview
                    var hiddenContext = hiddenCanvas.getContext('2d');
                    hiddenContext.drawImage(v, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
                };

                scope.grabExistingImage = function (dataURL, imageIsFromServer) {
                    var img = new Image;      // First create the image...
                    img.onload = function(){  // ...then set the onload handler...
                        // grab a smaller version for display
                        var context = c.getContext('2d');              
                        context.drawImage(img, 0, 0, c.width, c.height);

                        // and a bigger version (from a hidden canvas) for file creation later in scope.copyPreview
                        var hiddenContext = hiddenCanvas.getContext('2d');
                        hiddenContext.drawImage(img, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
                    };

                    img.onerror = function(e, a, b) {
                        console.info("error loading poster frame! ", e);
                    }

                    // This taints the canvas.
                    //img.src = dataURL;   

                    // It is possible for the imageIsFromServer to wrongly be set to true if the video url is from the server but the
                    // poster frame image is newly grabbed. In that case, set the imageIsFromServer to false.
                    if (dataURL.indexOf(DATA_PREFIX) === 0) {
                        imageIsFromServer = false; 
                    }

                    if (imageIsFromServer) {
                        $.ajax({
                            type: 'get',
                            url : dataURL,
                            crossDomain: 'true',
                            //dataType: "image/jpeg",
                            success: function(data) {
                                // simple as this:
                                img.src = data;          
                            },
                            error: function() {
                                console.log('Error: failed to ajax GET image.');
                            }
                        });
                    }
                    else {
                        img.src = dataURL;
                    }
                };

                // Grabs an image twice. 
                scope.grab2x = function() {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 

                    var wasPaused = v.paused;

                    if (!scope.grabHasHappenedBefore) { // if we need to do a fake grab
                        v.pause(); 
                        scope.grab(true); // fake grab
                        $timeout(function() {
                            //console.log("real grab");
                            scope.grab(); // real grab
                            if (!wasPaused) { // if was previously playing, play it again.
                                v.play();
                            }
                            scope.grabHasHappenedBefore = true;
                            scope.noChange = false;
                        }, 700);  
                    }
                    else { // real grab
                        scope.grab(); // real grab
                        scope.noChange = false;
                    }
                };

                scope.restoreDefault = function() {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 

                    scope.grabHasHappenedBefore = false;
                    v.pause();
                    v.currentTime = 5; 
                    scope.grab2x();
                }

                scope.stopVideo = function(){
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 

                    if (v) {
                        v.pause();
                        var context = c.getContext('2d');
                        context.clearRect (0, 0, c.width, c.height);
                    }
                };

                scope.validateVideo = function() {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 

                    if (v.videoHeight === 0 && v.videoWidth === 0) { // happens for prores videos in chrome
                        scope.error = scope.locFile['ITC.AppVersion.Media.ErrorMessages.GenericVideoLoadingError'];
                    }
                    else if (v.duration < 14.5) {
                        scope.error = scope.locFile['ITC.AppVersion.Media.ErrorMessages.VideoTooShort'];
                    }
                    else if (v.duration > 30.5) {
                        scope.error = scope.locFile['ITC.AppVersion.Media.ErrorMessages.VideoTooLong'];
                    }

                    if (scope.error) {
                        scope.$apply();
                        return false;
                    }
                    else {
                        return true;
                    }
                };


                /* A good way to tell what's supported in the current browser. Keeping for possible later use.
                if ( v.canPlayType ) {
                    // Check for MPEG-4 support
                    mpeg4 = "" !== v.canPlayType( 'video/mp4; codecs="mp4v.20.8"' );

                    // Check for h264 support
                    h264 = "" !== ( v.canPlayType( 'video/mp4; codecs="avc1.42E01E"' )
                        || v.canPlayType( 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' ) );

                    // Check for Ogg support
                    ogg = "" !== v.canPlayType( 'video/ogg; codecs="theora"' );

                    // Check for Webm support
                    webm = "" !== v.canPlayType( 'video/webm; codecs="vp8, vorbis"' );
                }
                */

                // Clear the hiddenCanvas if the video is deleted
                /*scope.$on('videoPreviewDeleted', function(event, data) { 
                    hiddenCanvas = null; 
                });*/

                scope.onVideoSeekedFunc = function(e) {
                    var jqV = element.find(".videoHolder video");
                    var v = jqV[0]; 

                    var forward = element.find(".stepperForward");
                    var back = element.find(".stepperBackward");
                    var lastSecond = Math.floor(v.duration);
                    var currentTimeFloored = Math.floor(v.currentTime);

                    forward.removeClass("inactive");
                    back.removeClass("inactive");
                    if (v.ended || currentTimeFloored === lastSecond) { // disable right scrubber
                        forward.addClass("inactive");
                    }
                    else if (v.currentTime === 0) { // disable left scrubber
                        back.addClass("inactive");
                    }
                };

                scope.onVideoEndedFunc = function(e) {
                    var forward = element.find(".stepperForward");
                    forward.addClass("inactive");
                };

                // video height and with become available here... unless it's a prores file.
                scope.onVideoLoadedFunc = function(e) {
                        log("onVideoLoadedFunc: " + scope.device);
                        if (scope.validateVideo()) { // comment this out to test DU error handling.

                            var jqV = element.find(".videoHolder video");
                            var v = jqV[0]; 

                            v.crossOrigin = "Anonymous"; // just in case!!!

                            // create a dummy canvas (only once) for a real sized poster frame image
                            if (!hiddenCanvas) {
                                hiddenCanvas = document.createElement("canvas");
                            }
                            hiddenCanvas.width = v.videoWidth;
                            hiddenCanvas.height = v.videoHeight;

                            // SCALE DOWN HERE! 
                            var goodDimensions = scope.getGoodPosterFrameDimensions(v.videoWidth, v.videoHeight);
                            hiddenCanvas.width = goodDimensions.width;
                            hiddenCanvas.height = goodDimensions.height;

                            var portrait = (v.videoHeight > v.videoWidth);
                            var videoDivs = element.find(".videoDiv");
                            var containingModal = element.closest(".modal-dialog");
                            var panel = element.find(".videoSnapshotPanel");
                            if (portrait) {
                                videoDivs.addClass("portrait");
                            }
                            else {
                                videoDivs.removeClass("portrait");
                            }
            
                            var vidShrunkWidth = $(v).width();

                            var paddingRt = parseInt(panel.css("padding-right"));
                            var paddingLt = parseInt(panel.css("padding-left"));

                            containingModal.width(vidShrunkWidth*2 + paddingRt + paddingLt + paddingRt); // adding an equal amount of padding to part between vids

                            var shrinkRatio = vidShrunkWidth/v.videoWidth;
                            var shrunkHeight = shrinkRatio * v.videoHeight;

                            v.parentElement.style.height = shrunkHeight + "px";
                            v.style.height = shrunkHeight  + "px";
                            c.parentElement.style.height = shrunkHeight  + "px";

                            c.width = vidShrunkWidth;
                            c.height = shrunkHeight;

                            scope.upload = true; // default is to upload
                            //log("in loaded func: ", scope.data);
                            /* scope.data looks like:
                                contentType: null
                                descriptionXML: null
                                fullSizedPreviewImageUrl: "https://isq08.mzstatic.com/image/thumb/PurpleVideo1/v4/65/58/97/6558976e-8c02-bfa2-7944-17a5b373053a/Job16899380-d2fc-4840-8750-c3c5bc92760a-90217726-PreviewImage_AppTrailer_m4v-Time1423564972915.png/1920x1080ss-80.png"
                                isPortrait: false
                                pictureAssetToken: null
                                previewFrameTimeCode: "00:05"
                                previewImageUrl: "https://isq08.mzstatic.com/image/thumb/PurpleVideo1/v4/65/58/97/6558976e-8c02-bfa2-7944-17a5b373053a/Job16899380-d2fc-4840-8750-c3c5bc92760a-90217726-PreviewImage_AppTrailer_m4v-Time1423564972915.png/500x500bb-80.png"
                                videoAssetToken: null
                                videoStatus: "Done"
                                videoUrl: "https://apptrailers-ssl.assets.itunes.com/apple-itms8-assets-us-std-000001/PurpleVideo3/v4/d0/a3/46/d0a34697-6f50-a75b-5b37-7254ab892850/P36566813_default.m3u8"
                            */
                            
                            log("onVideoLoadedFunc: allVideosInDropWell[0]: ", scope.allVideosInDropWell[0]); 
                            var vid = scope.allVideosInDropWell[0];
                            // tbd: do something different depending if scope.allVideosInDropWell[0] exists or not???
                            if (vid) { // && vid.uploaded) { // if a video was uploaded, tab changed, then changed back.
                                scope.grabExistingImage(vid.data, !vid.uploaded);
                                //scope.copyPreviewExistingImage(vid.data, vid.previewTimestamp, scope.data.videoUrl); // No need to do this.
                            }
                            else if (scope.data && scope.data.previewImageUrl && scope.data.previewFrameTimeCode) { // if a video was not touched
                                scope.grabExistingImage(scope.data.fullSizedPreviewImageUrl, true);
                                scope.copyPreviewExistingImage(scope.data.previewImageUrl, "00:00:" + scope.data.previewFrameTimeCode, scope.data.videoUrl);
                            }
                            else { // must have drop data in scope.data2
                                // get a snapshot 5 seconds in, or however many seconds in we previously set it to.
                                v.currentTime = 5; 
                                if (e.data && e.data.data) {
                                    // tbd: what if there's already previewTimestamp was changed?
                                    /*if (e.data.data.previewTimestamp !== undefined) {
                                        v.currentTime = e.data.data.previewTimestamp;
                                    }
                                    if (e.data.data.upload !== undefined && !e.data.data.upload) {
                                        scope.upload = false;
                                    } */
                                }
                                scope.grab(); 
                                $timeout(function() {
                                    scope.grab(); 
                                    scope.copyPreview();
                                    v.currentTime = 0; 
                                }, 500);  
                            } 
                        }        
                };

                scope.copyPreviewExistingImage = function(previewImageURL, timestamp, videoUrlFromServer, hasError) {
                    //var isNewVideo = false;
                    var isUserGrab = false;
                    
                    var data = {};
                    data.data = previewImageURL; //hiddenCanvas.toDataURL("image/jpeg"); // grabbing the bigger image from the hiddenCanvas
                    data.file = scope.file;
                    data.previewTimestamp = timestamp;
                    data.isPortrait = (c.height > c.width);
                    data.videoUrlFromServer = videoUrlFromServer;
                    data.videoError = hasError;

                    scope.upload = false;
                    data.upload = scope.upload;

                    scope.updateVideoModel(data, isUserGrab);
                };

                // Adds or modifies a video to scope.allVideosInDropWell.
                scope.updateVideoModel = function(dataWithFile, isUserGrab) { 
                    scope.show = false;

                    var data = dataWithFile.data;
                    var videoFile = dataWithFile.file;

                    // if there's already a video, we're just grabbing another snapshot from that video
                    if (scope.allVideosInDropWell && scope.allVideosInDropWell.length === scope.totalNumVideos) {
                        var d = scope.allVideosInDropWell[scope.totalNumVideos-1];
                        d.data = data; // image jpg data  -- this change will cause the media-image directive to update.
                        d.thumbnailData = data;
                        d.videoType = true; 
                        d.previewTimestamp = dataWithFile.previewTimestamp;
                        d.isUserGrab = isUserGrab;

                        scope.appPreviewSnapshotShowing = true;
                        if(!scope.$parent.$$phase) {
                            scope.$apply(); // necessary
                        }

                        // instead of doing this - listen for previewVideo.data changes in media_image_directive then call setVideoPreview there.
                        //$scope.$broadcast('setVideoPreview', $scope.previewVideos.length-1);
                    }

                    // if not, we're adding a video to previewVideos.
                    else {

                        var dataPlusImageInfo = {};
                        dataPlusImageInfo.data = data; // image jpg data
                        dataPlusImageInfo.thumbnailData = data; // image jpg data
                        dataPlusImageInfo.videoType = true;
                        //dataPlusImageInfo.videoFile = videoFile; // ang 1.5 does not like this.
                        dataPlusImageInfo.previewTimestamp = dataWithFile.previewTimestamp;
                        dataPlusImageInfo.isPortrait = dataWithFile.isPortrait;
                        dataPlusImageInfo.processingVideo = dataWithFile.processingVideo;
                        dataPlusImageInfo.videoError = dataWithFile.videoError;
                        dataPlusImageInfo.cantPlayVideo = dataWithFile.cantPlayVideo;
                        dataPlusImageInfo.videoUrlFromServer = dataWithFile.videoUrlFromServer;
                        dataPlusImageInfo.uploaded = dataWithFile.upload;
                        dataPlusImageInfo.isUserGrab = isUserGrab;

                        // instead of doing the below - listen for previewVideos length changes (0->1) in media_image_directive then call setVideoPreview there.
                        scope.allVideosInDropWell.push(dataPlusImageInfo);

                        if (!dataPlusImageInfo.uploaded) {
                            var loaded = scope.mediaErrors.getErrorValue('ALL LANGUAGES', scope.device, "videoLoaded"); 
                            if (loaded === undefined || loaded === null) { // if it equals FALSE, don't set it to true.
                                scope.mediaErrors.setErrorValue('ALL LANGUAGES', scope.device, "videoLoaded", true); // otherwise loader will show on video preview
                            }
                        }

                        if(!scope.$parent.$$phase) {
                            scope.$apply(); // necessary
                        }
                    }

                    var videoAddedData = {};
                    videoAddedData.device = scope.device;
                    videoAddedData.videoFile = videoFile;
                    scope.$emit('videoAddedOrPosterFrameChanged', videoAddedData);
                };

                // using click instead of ng-click because i want to manually call $apply in app.js
                // right before broadcasting "setPreview"
                element.find(".doneButton").bind("click", {userGrab: true}, scope.copyPreview);


            }, // end link
        } // end return
	}); // end itcApp.directive

}); // end define
