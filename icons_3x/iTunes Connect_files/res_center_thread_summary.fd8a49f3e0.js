define(['sbl!app'], function (itcApp) {

    /*
        A res center thread summary - goes in the left list in res center.
    */

	itcApp.directive('resCenterThreadSummary',function($sce, $timeout, ITC){
		return {
            restrict: 'A',
            templateUrl: getGlobalPath('/itc/views/directives/res_center_thread_summary.html'),
            scope: {
                thread: "=",
                selected: "=",
                selectedType: "=", 
                type: "@",
                l10n: "=",
                latestTimestamp: "="
            }, 

            link: function(scope, element, attrs) {
               
                scope.threadClicked = function () {    
                    scope.selected = scope.thread;
                    scope.selectedType = scope.type;
                };
            
                scope.$watch('thread', function(newVal, oldVal) {
                    if (newVal) { 
                        // sort messages by date
                        scope.sortedMessages = _.sortBy(newVal.messages,function(message) {
                                                return -message.date;
                                            });
                    }
                });

                scope.getThreadTitle = function() {
                    var preReleaseBuildVersion = "";
                    if (scope.type === "betaNotes") {
                        preReleaseBuildVersion = " (" + scope.thread.preReleaseBuildVersion + ")";
                    }

                    var rejectedText = scope.l10n.interpolate('ITC.apps.resolutionCenter.rejectionType.binary');
                    if (scope.type === "appNotes" && scope.thread.metadataRejected) {
                        rejectedText = scope.l10n.interpolate('ITC.apps.resolutionCenter.rejectionType.meta');
                    }
                    else if (scope.type === "appMessages") {
                        if (scope.thread.type === "ARC") {
                            rejectedText = scope.l10n.interpolate('ITC.apps.resolutionCenter.rejectionType.ARC');    
                        }
                        else if (scope.thread.type === "ARB") {
                            rejectedText = scope.l10n.interpolate('ITC.apps.resolutionCenter.rejectionType.ARB');    
                        }
                        else if (scope.thread.type === "Communications Team") {
                            rejectedText = scope.l10n.interpolate('ITC.apps.resolutionCenter.rejectionType.devComm');    
                        }
                    }
                    return scope.thread.version + preReleaseBuildVersion + " " + rejectedText; 
                }

                scope.getThreadDate = function() {
                    if (scope.sortedMessages) {
                        var firstMessage = scope.sortedMessages[0];
                        var timestamp = firstMessage.date;
                        var niceDate = moment(timestamp).format('MMMM D, YYYY');
                        var withTime = moment(timestamp).format('MMMM D, YYYY [at] h:mm A'); // just for debugging
                        var niceLocalizedDate = ITC.time.showAbbreviatedDate(timestamp);
                        
                        // Make sure the thread with the latest timestamp'ed message gets selected. This method (getThreadDate())
                        // gets called repeatedly by the digest loop, but only want to set latestTimestamp once, the first time.
                        if (!scope.gotThreadDate) {
                            //console.log("setting thread date: " + timestamp + " (" + withTime + ")");
                            $timeout(function(){ // don't ask. necessary.
                                if (timestamp > scope.latestTimestamp) {
                                        scope.latestTimestamp = timestamp;
                                        scope.threadClicked(); // select this thread
                                }
                            });
                            scope.gotThreadDate = true;
                        }

                        return niceLocalizedDate;
                    }
                    else {
                        return "";
                    }
                }

                scope.getMessageSummary = function() {
                    var strLength = 140;
                    if (scope.sortedMessages) {
                        var firstMessage = scope.sortedMessages[0];
                        if (firstMessage.body) {
                            if (firstMessage.body.length > strLength) {
                                var str = scope.htmlToPlaintext(firstMessage.body);
                                var substr = str.substring(0, strLength);
                                return substr.substring(0, substr.lastIndexOf(" "));

                            }
                            else {
                                return scope.htmlToPlaintext(firstMessage.body);
                            }
                        }
                        else {
                            return "";
                        }
                    }
                    else {
                        return "";
                    }
                }

                scope.htmlToPlaintext = function(text) {
                    // replace any <brs> with spaces.
                    var brsReplaced = text.replace(/<BR\/>/gm, ' ');
                    brsReplaced = brsReplaced.replace(/<BR>/gm, ' ');
                    brsReplaced = brsReplaced.replace(/<br>/gm, ' ');
                    brsReplaced = brsReplaced.replace(/<br\/>/gm, ' ');

                    // remove any other html tags.
                    return String(brsReplaced).replace(/<[^>]+>/gm, '');
                }

                // When this element finally shows, set the header width. All for ellipsis shortening.
                scope.$watch(attrs.oaShow, function(value) {

                    $timeout(function(){ // takes a sec for all the elements within this element to show
                        var topLine = element.find(".threadTopLine");
                        var header = topLine.find(".threadTitle");
                        var date = topLine.find(".threadDate");
                        var topLineW = topLine.width();
                        var dateW = date.width();
                        var newHeaderW = topLineW - dateW - 10; // 10 so it's not so tight
                        header.width(newHeaderW + "px");
                    });
                    
                });

                // To show a tooltip if the title is shortened with ellipses
                element.find(".threadTitle").bind('mouseenter', function(){
                    var $this = $(this);

                    if(this.offsetWidth < this.scrollWidth && (!$this.attr('title') || $this.attr('title').length===0)) {
                        $this.attr('title', $this.text());
                    }
                    else {
                        $this.attr('title', "");
                    }
                });

                
            } // end link
        };

    })

});