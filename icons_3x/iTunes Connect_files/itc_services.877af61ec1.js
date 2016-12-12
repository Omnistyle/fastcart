define(['sbl!app'], function (itcApp) {

    itcApp.factory( 'ITC' , function( $rootScope, $filter ) {
        
        // Ensure inbound data is a Unix timestamp. Avoids issues with Moment objects.
        function toUnix( thing ) {
            if ( !thing || isNaN(thing))  return false;
            if ( thing._isAMomentObject ) return thing.unix() * 1000;
            return thing;
        };
        
        
        var services = {
            
            validate: {
                email: function( address ) {
                    // Basic test, catches most invalid cases, including consecutive dots
                    if (!/^(?!.*\.{2})([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test( address ))
                        return false;
                    // Check for leading/trailing dots in address/hostname portions
                    var parts = address.split('@');
                    if (parts[0].slice(0,1) === '.' || parts[0].slice(-1) === '.') return false;
                    if (parts[1].slice(0,1) === '.' || parts[1].slice(-1) === '.') return false;
                    
                    return true;
                }
            },
            
            url: {
              
                // Returns true if all of the provided strings exist in the URL
                // e.g. $scope.ITC.url.contains('ios','builds')
                contains: function () {
                    if (arguments.length > 0) {
                        var url = window.location.href;
                        for (var i = 0; i < arguments.length; i++) {
                            if (url.indexOf(arguments[i]) < 0) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                
            },
            
            number: {
                
                // Display 0 instead of the supplied value, if it's less than zero
                enforcePositiveOrZero: function( num ) {
                    return ( num >= 0 ) ? num : 0;
                }
                
            },
            
            text: {
                // Returns upper-cased text, but leaves product names intact (e.g. 'iOS')
                toUpperCase: function( text ) {
                    if (!text || text === '') return '';
                    function upperCaseExcept( sourceText, preservedWord ) {
                        return _.map( sourceText.split( preservedWord ), function (chunk) {
                            if (chunk === '') return preservedWord;
                            return chunk.toUpperCase()
                        }).join('');
                    }
                    
                    // Dupe this line with any additional strings that shouldn't be capitalized
                    if (/iOS/i.test(text)) return upperCaseExcept( text, 'iOS' );
                    
                    return text.toUpperCase();
                }
            },
            
            time: {
                
                // TO-DO: Actually convert to UTC. Still unsure if this will ever be required.
                convertToUTC: function(t) { return t; },
                
                // "longDate" e.g. "January 12, 2015"
                showFullDate: function( input ) {
                    var timestamp = toUnix(input);
                    if (!timestamp) return false;
                    
                    return $filter('date')( timestamp, 'longDate' );
                },
                
                // "mediumDate" e.g. "Jan 12, 2015"
                showAbbreviatedDate: function( input ) {
                    var timestamp = toUnix(input);
                    if (!timestamp) return false;
                    
                    return $filter('date')( timestamp, 'mediumDate' );
                },

                // "mediumDate" e.g. "Jan 12, 2015"
                showUTCAbbreviatedDate: function( input ) {
                    //var timestamp = toUnix(input);
                    if (!input) return false;
                    
                    return $filter('date')( input, 'mediumDate' );
                },
                
                // DEPRECATED: We now favor 'showDateAtTime' over this format.
                // e.g. "Jan 12, 2015 12:30 PM"
                showDateAndTime: function( timestamp ) {
                    
                    var l10n = $rootScope.l10n;
                    
                    if (l10n === undefined || isNaN(timestamp)) return false;
                    
                    var date = $filter('date')( timestamp, 'mediumDate'),  // Apr 11, 2014
                        time = $filter('date')( timestamp, 'shortTime');   // 5:15
                    
                    return l10n.interpolate( 'ITC.date.dateAndTime', {
                        date: date,
                        time: time
                    });
                },
                
                // e.g. "Jan 12, 2015 at 12:30 PM"
                showDateAtTime: function( timestamp ) {
                    
                    var l10n = $rootScope.l10n;
                    
                    if (l10n === undefined || isNaN(timestamp)) return false;
                    
                    var date = $filter('date')( timestamp, 'mediumDate'),  // Apr 11, 2014
                        time = $filter('date')( timestamp, 'shortTime');   // 5:15
                    
                    return l10n.interpolate( 'ITC.date.dateAtTime', {
                        date: date,
                        time: time
                    });
                },

                // e.g. "Jan 12, 2015 at 12:30 PM"
                showTime: function( timestamp ) {
                    
                    var l10n = $rootScope.l10n;
                    
                    if (l10n === undefined || isNaN(timestamp)) return false;
                    
                    var time = $filter('date')( timestamp, 'shortTime');   // 5:15
                    
                    return l10n.interpolate( 'ITC.date.time', {
                        time: time
                    });
                },

                // mnt is a moment.js object
                // Note: no longer using this for now.
                showUTCDateAtTime: function(mnt) {
                    var l10n = $rootScope.l10n;     
                    if (l10n === undefined) return false;

                    var utc_mmt = mnt.utc(); // the magic

                    //var currLocale = utc_mmt.locale(); // returns en
                    var locale = l10n.interpolate('ITC.current.locale.metadata');
                    
                    // if using moment_with_locales.min.js
                    //var strInput = utc_mmt.locale(locale).format(l10n.interpolate( 'ITC.date.dateFormat'));
                    //var strInputTime = utc_mmt.locale(locale).format(l10n.interpolate( 'ITC.date.timeFormat'));
                    var strInput = utc_mmt.format("MMM D, YYYY");
                    var strInputTime = utc_mmt.format("h:mm a"); 

                    var date = $filter('date')( strInput, 'mediumDate'), 
                        time = $filter('date')( strInputTime, 'shortTime'); 

                    return l10n.interpolate( 'ITC.date.dateAtTime.wUTC', {
                        date: date,
                        time: time
                    });
                },
                
                getExpiryString: function( timestamp ) {
                    
                    var l10n = $rootScope.l10n;
                    if (l10n === undefined || isNaN(timestamp)) return false;
                    timestamp = toUnix(timestamp);
                    
                    // Show time remaining in days, hours, or minutes.
                    // We always round down: 12.999 days = 12 days        
                    var getTimeRemaining = function(endDate, namespace) {
                        
                        var unit_namespace = namespace || "ITC.expiresInX.";
                        
                        var units = {
                            months: { 
                                plural:   unit_namespace + 'month.plural',
                                singular: unit_namespace + 'month.singular'
                            },
                            days: { 
                                plural:   unit_namespace + 'day.plural',
                                singular: unit_namespace + 'day.singular'
                            },
                            hours: { 
                                plural:   unit_namespace + 'hour.plural',
                                singular: unit_namespace + 'hour.singular'
                            },
                            minutes: { 
                                plural:   unit_namespace + 'minute.plural',
                                singular: unit_namespace + 'minute.singular'
                            }
                        };
                                        
                        var oneMonth  = 2592000000, // 1000 * 60 * 60 * 24 * 30
                            oneDay    = 86400000, // 1000 * 60 * 60 * 24
                            oneHour   = 3600000, // 1000 * 60 * 60
                            oneMinute = 60000; // 1000 * 60
                            
                        var now = new Date(),
                            end = new Date(endDate),
                            numRemaining,
                            unit,
                            unitString;
                        
                        // Time difference in milliseconds
                        var timeDiff = end.getTime() - now.getTime();

                        // Expiry date is in the past. Show "Expired May 1, 2015".
                        if (timeDiff <= 0) {
                            return (l10n['ITC.apps.betaStatus.expired'] +' '+ $filter('date')(timestamp, 'MMM d, y'));
                        }
                       
                       
                       if (timeDiff >= oneDay) {
                            numRemaining = Math.ceil( timeDiff / oneDay );
                            unit = units.days;
                            
                        } else if (timeDiff >= oneHour) {
                            numRemaining = Math.ceil( timeDiff / oneHour );
                            unit = units.hours;
                            
                        } else {
                            numRemaining = Math.ceil( timeDiff / oneMinute );
                            unit = units.minutes;
                        }
                        
                        // 0 minutes = 1 minute
                        numRemaining = (numRemaining <= 1) ? 1 : $filter('number')( numRemaining );
                        
                        // e.g. "Day" or "Days" ?
                        unitString = (numRemaining <= 1) ? unit.singular : unit.plural;
                        
                        // e.g. "29 Days"
                        // return (numRemaining + ' ' + unitString);
                        return l10n.interpolate( unitString, { num: numRemaining });
                    };
                    
                    return getTimeRemaining( timestamp );
                }
            },
            
            file: {
                
                // Converts bytes (e.g. 2465504) to a readable string (e.g. '2.47 MB')
                bytesToReadableSize: function( bytes ) {
                    
                    if ( !bytes || bytes === 0 ) return '0 bytes';
                    
                    var l10n = $rootScope.l10n;
                    if (!l10n) return;
                    
                    var k = 1000,
                        sizes = [ 'bytes', 'KB', 'MB', 'GB', 'TB' ],     // size tiers (also used for the l10n key suffix)
                        i = Math.floor( Math.log(bytes) / Math.log(k) ), // calculate which suffix to use (e.g. 'MB' or 'KB')
                        sizeUnit = sizes[i];                             // grab that size unit from the sizes array
                    
                    var numericSize   = ( bytes / Math.pow(k, i) ).toPrecision(3); // calculate size to 3 significant figures
                        localizedSize = $filter('number')( numericSize );          // localize the value from previous line
                    
                    return l10n.interpolate( 'ITC.fileSizeReadable.' + sizeUnit, { size: localizedSize });
                },
                
                // Creates a download link for a file containing 'content',
                // to be used thusly <a download="{filename}" href="{blobURL}">
                createBlobURL: function( content, mime ) {
                    
                    mime = mime || 'text/plain';
                    content = (Array.isArray(content)) ? content : [ content ];
                    
                    var blob = new Blob( content , { type : mime });
                    return(( window.URL || window.webkitURL ).createObjectURL( blob ));
                }
                
            },
            
            object: {
                // Set all properties of an object to false 
                // (for instance: to clear all pageErrors, or hide all modals)
                setAllToFalse: function( target ) {
                    if (typeof target === 'object' && !Array.isArray( target )) {
                        for ( var prop in target ) { target[prop] = false; }
                    }
                    return target;
                }
                
            }
            
            
        };
        
        // Alternate method of accessing ITC time utilities.
        // use ITC.date * or * ITC.time
        services.date = services.time;
        
        return( services );
        
    });
    
});
