'use strict';

define([], function() {

     var routeResolver = function() {
         
        this.$get = function() {
             return this;
         };
         
         /**
         * resolve() returns a deferred function that executes when we load a route.
         * It accepts a list of dependencies, and optionally a configuration object with additional instructions.
         *
         * @param <String|Array> requirables
         * @param <Object> config
         *
         * @return <Promise> defer.promise
         */
        this.resolve = function( requirables, config ) {
             
            var resolver = { 
                 
                 myCtrl: [ '$q', function ( $q ){
                 
                    var defer = $q.defer();
 
                     var trackingConfig,
                         useDefaultPath = true,
                         controllerpath = 'sbl!/itc/js/ng-app/controllers/',
                                 suffix = '.js';
                     
                     // Apply configurable route options, if present
                     if ( typeof config === 'object' ) {
                         if ( typeof config.useDefaultPath === 'boolean' ) useDefaultPath = config.useDefaultPath;
                         if ( typeof config.trackingConfig === 'object' ) trackingConfig = config.trackingConfig;
                     }
                     
                     // Always update tracking data (even if it's blank) to avoid
                     // erroneously recording page hits for previous states
                     applyTrackingMetadata( trackingConfig );
                     
                    if ( useDefaultPath === false ) {
                        controllerpath = '';
                        suffix = '';
                    }
                    
                     if ( typeof requirables === 'string' ) {
                         requirables = [ requirables ];
                     }
                     
                     var dependencies = _.map( requirables, function( path ) {
                         return getGlobalPath( controllerpath + path + suffix );
                     });
                     
                     // Load the dependencies, and resolve when done ( async )
                    require( dependencies, defer.resolve );
                     
                     // Return the promise
                    return defer.promise;
                }]
            };
             
             
             // Using the pageName / channel defined in each route, set these on
             // the global Omniture object "s" before we resolve the route.
             // If these parameters are not provided, then reset those values to "".
             function applyTrackingMetadata( trackingMetadata ) {
 
                 var c = trackingMetadata;
 
                 if (c === undefined) c = {};
                 
                 window.s.pageName = (c.pageName !== undefined) ? c.pageName : ''; // e.g. "App - Summary"
                 window.s.channel  = (c.channel  !== undefined) ? c.channel  : ''; // e.g. "Manage Your App"
                 window.s.hier5    = constructHier(c.hier5); // e.g. "appleitmsitcdev"
                 
                 // DEBUG: to confirm that vars were set
                 // if ( window.s.pageName.length > 0 ) { log('%c"'+window.s.pageName+'" ('+window.s.channel+') ' +window.s.hier5, 'color: #ff7200') }
                 // else { log("%cNo data for this route, might be { 'abstract': true }", 'color: #aaa') }
                 return trackingMetadata;
             };
             
             
             // Hier5 tells Omniture which "bucket" to place this pageview under (in the Omniture dashboard)
             // this function receives an integer, and returns a complete hier5 string.
             // Examples:
             //      ""   -> "appleitmsitcdev"     "01" -> "appleitmsitc01dev,appleitmsitcdev"
             function constructHier( val ) {
                 var val = val || '', 
                     hierString = '',
                     isProd = (location.hostname === "itunesconnect.apple.com") ? true : false;
                     
                 if (val !== '') hierString += 'appleitmsitc' + val + ((isProd)?'':'qa') + 'dev,';
                 
                 hierString += 'appleitmsitc' + ((isProd)?'':'qa') + 'dev';
                 
                 return hierString;
             };
             
             
             return resolver;
        };
     };
  
     var servicesApp = angular.module('routeResolverServices', []);

    //Must be a provider since it will be injected into module.config()    
    servicesApp.provider('routeResolver', routeResolver);
});
