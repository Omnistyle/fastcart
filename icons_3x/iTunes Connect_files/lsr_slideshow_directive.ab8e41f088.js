define(['sbl!app'], function (itcApp) {

	itcApp.directive('lsrSlideshow',function($timeout, $sce, ai){
        return {
            restrict: 'A',
            templateUrl: getGlobalPath('/itc/views/directives/lsr_slideshow_template.html'),
            scope: {
                show: "=",
                tokens: "=",
                currentIndex: "=",
                imageServiceUrl: "@"
            }, 
          
            link: function(scope, element, attrs) {
                var mainImg = element.find("img");
                var arrowButtons = element.find(".slideshowArrow");
                var btnContainerRt = element.find(".slideshowButtonContainerRight");
                var btnContainerLt = element.find(".slideshowButtonContainerLeft");
                var mainContent = element.find(".slideshowMainContent");
                var mainContentParent = mainContent.parent();
                
                scope.$watch('imageServiceUrl',function(val) {
                    if (val) {
                        scope.img_url_gen = new ai.imageservice.ImageURLGenerator(scope.imageServiceUrl);
                    }
                });

                // Get the lsr url from the currently selected token.
                scope.getLsrData = function() {

                    var currentImageData = scope.tokens[scope.currentIndex];
                    var format;
                    if (currentImageData.parallax) {
                        format = ai.imageservice.FormatType.LSR;
                    }
                    else {
                        format = ai.imageservice.FormatType.PNG;
                    }

                    var wh = window.innerHeight; 
                    var ww = window.innerWidth;

                    var config = {
                        token: currentImageData.token,
                        //width:128,
                        //height: wh-40, 
                        formatType: format
                    };
                     
                    var url = scope.img_url_gen.generateUrlForToken(config);

                    return { parallax: currentImageData.parallax, url: url };
                }

                scope.initLsrViewer = function() {
                    if (scope.viewer) {
                        scope.updateLsr();
                    }
                    else {
                        var wh = window.innerHeight; 
                        var ww = window.innerWidth;

                        var lsrData = scope.getLsrData();
                        if (lsrData.parallax) {
                            scope.isParallax = true;
                            scope.nonParallaxUrl = null;
                            scope.loadingLsr = true;
                            scope.viewer = new LSRViewer({
                                previewpane: "#lsrViewer",
                                parentel: "#lsrViewerParent",
                                autoplay: true,
                                use_specular_highlight: false,
                                skew_amt: 0,
                                perspective_amt: 900,
                                depth_max: 60,
                                
                                //max_width: ww * .8,
                                
                                lsr: lsrData.url, 
                                onComplete: function(width, height, layers){
                                    //console.log(".lsr file rendered");
                                    scope.loadingLsr = false;
                                    //scope.centerImageSlideshowPanel();
                                    scope.$apply();
                                },
                                track_controls: true
                            });
                        }
                        else { // not a parallax img
                            scope.isParallax = false;
                            scope.nonParallaxUrl = lsrData.url;
                        }
                    }
                    
                }

                scope.$watch('show', function(newVal, oldVal) {
                    if (newVal) {
                        scope.initLsrViewer();
                    }
                });

                scope.$watch('currentIndex', function(newVal, oldVal) {
                    if (!scope.viewer) {
                        if (oldVal !== undefined) {
                            scope.initLsrViewer();
                        }
                        else {
                            return; // if oldVal is undefined, then initLsrViewer() will be called on show.
                        }
                    }
                    
                    if (newVal !== undefined) {
                        scope.updateLsr();
                    }    
                });

                // Updates the lsr to the one at the current index.
                scope.updateLsr = function() {
                    var lsrData = scope.getLsrData();

                    if (lsrData.parallax) {
                        scope.isParallax = true;
                        scope.nonParallaxUrl = null;
                        scope.loadingLsr = true;
                        scope.viewer.view(lsrData.url, function(width, height, layers){

                            scope.loadingLsr = false;
                            scope.$apply();
                            //console.log("LOADED");
                            // Once the element has been loaded, play it (it autoplay is false)
                            /*scope.viewer.play();

                            // Stop the player after five seconds
                            setTimeout(function(){
                                viewer.stop();
                            }, 5000);
                            */
                        });
                    }
                    else {
                        scope.isParallax = false;
                        scope.nonParallaxUrl = lsrData.url;
                    }

                }

                scope.setDimensions = function() {
                    var wh = window.innerHeight; // do we care about non-modern browsers? if so, do this: http://stackoverflow.com/questions/3333329/javascript-get-browser-height
                    var ww = window.innerWidth;
                    
                    var maxHeight = wh - 40;
                    
                    var maxWidth = ww - 40;

                    scope.maxHeight = maxHeight;
                    scope.maxWidth = maxWidth;
                };

            
                
                // Vertically centers slideshowPanel in the lightbox.
                scope.centerImageSlideshowPanel = function() {
                    var lightbox = element.closest('.full-lightbox');
                    var slideshowPanel = element.find('.imageSlideshowPanel');

                    var marginTop = (lightbox.height() - slideshowPanel.height())/2;
                    slideshowPanel.css("margin-top", marginTop);
                };

                // not currently used. needs cleanup.
                scope.adjustContentAndButtonMargins = function() {
                    
                    // make the main content fit between the arrows.
                    //mainContent.width(scope.maxWidth - 214);
                    mainContent.height(scope.maxHeight - 40);

                    var mainContentH = mainContent.height();
                    var mainContentW = mainContent.width();
                    //console.log("mainContent w h: " + mainContentW + ", " + mainContentH);

                    var mainImgWidthOld = mainImg[0].naturalWidth; //mainImg.width();
                    var mainImgHeightOld = mainImg[0].naturalHeight; //.height();
                    mainImg.width(mainImgWidthOld);
                    mainImg.height(mainImgHeightOld);

                    if (mainImgWidthOld > mainContentW) {
                        mainImg.width(mainContentW); // shrink image width to fit content
                        mainImg.height(mainImg.width() * mainImgHeightOld/mainImgWidthOld);
                    }

                    mainImgHeightOld = mainImg.height();
                    mainImgWidthOld = mainImg.width();

                    if (mainImgHeightOld > mainContentH) {
                        mainImg.height(mainContentH);
                        mainImg.width(mainImg.height() * mainImgWidthOld/mainImgHeightOld);
                    }
                    var btn = arrowButtons.first();

                    var h = mainImg.height();
                    if (scope.videoShowing) {
                        vid = element.find("video");
                        h = scope.maxHeight - 40;
                        vid.height(h);
                    }
                    btnContainerRt.height(h);
                    btnContainerLt.height(h);

                    // center mainContent horizontally. pretty ugly but works.
                    var diff; // = mainContentParent.width() - mainContent.width() - (2*btn.width()) - 2*parseInt(btn.css("margin-left"));
                    //mainContent.css("margin-left", diff/2); // nah nevermind. unnecessary

                    // center image vertically
                    var imgMarginTop = 0;
                    if (!scope.videoShowing) {
                        diff = mainContent.height() - mainImg.height();
                        imgMarginTop = diff/2;
                        mainImg.css("margin-top", imgMarginTop);
                    }

                    var marginTop = (btnContainerRt.height() - btn.height())/2;
                    arrowButtons.css("margin-top", marginTop + imgMarginTop);

                    scope.centerImageSlideshowPanel();
                };

                // Resize this drop element if the window is resized.
                /*var resizeAdjustHandler = scope.adjustContentAndButtonMargins();
                $(window).on('resize',resizeAdjustHandler);
                scope.$on("$destroy",function(){
                    $(window).off('resize',resizeAdjustHandler);
                });*/


                scope.onFirstSlide = function() {
                    return scope.currentIndex === 0;
                };

                scope.onLastSlide = function() {
                    if (!scope.tokens) {
                        return true;
                    }
                    return scope.currentIndex === (scope.tokens.length-1);
                };

                scope.slideLeft = function() {
                    scope.currentIndex--;
                }

                scope.slideRight = function() {
                    scope.currentIndex++;
                }

                

            }, // end link

        } // end return
	}); // end itcApp.directive

}); // end define
