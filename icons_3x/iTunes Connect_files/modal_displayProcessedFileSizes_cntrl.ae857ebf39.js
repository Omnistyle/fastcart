'use strict';

define(['sbl!app' ], function ( itcApp ) {
    
    itcApp.register.controller( 'showProcessedFileSizesModalController', [ '$scope', '$rootScope', '$filter', '$timeout', 'ITC', 'buildDetailsService'
    ,function(  $$, $rootScope, $filter, $timeout, ITC, buildDetailsService ) {
        
        // Reset the state of this modal
        var resetModal = function() {
            $$.areFileSizesRetrieved = false;
            $$.fileSizesForBuild = undefined;
            $$.oneOrMoreVariantsExceedSizeLimit = false;
        };
        
        // Retrieve the build object from $scope, otherwise fetch it using details provided.
        // (Sometimes this modal is invoked from a context where we haven't loaded file sizes for the build)
        var getBuildSizes = function( buildFromServer ) {
            
            resetModal();
            
            // If referenceData is unavailable, defer this function call until it's available
            if (!$$.isLoaded || !$$.referenceData) {
                var unwatchPageLoad = $$.$on('pageIsLoaded', function() {
                    getBuildSizes( buildFromServer );
                    unwatchPageLoad();
                });
            }
            
            // Use "buildForFileSizeModal" from parent scope, if provided.
            var build = ( buildFromServer ) ? buildFromServer.data : angular.copy( $$.buildForFileSizeModal );
            
            // If no build, or if it's missing the processed sizes, fetch it from the server.
            if ( !build || !build.sizesInBytes ) {
                loadBuildData();
            }
            
            // Render the sizes onto the modal.  
            else {
                $$.fileSizesForBuild = mapSizesForDisplay( build.sizesInBytes );
                $$.areFileSizesRetrieved = true;
            }
        };
        
        var loadBuildData = function( ) {
            return buildDetailsService
                .load( 
                    $$.adamId, 
                    $$.buildForFileSizeModal.trainVersion, 
                    $$.buildForFileSizeModal.buildVersion, 
                    $$.buildForFileSizeModal.platform
                )
                .then( getBuildSizes );
        };
        
        // Prepare the sizes for display on UI
        var mapSizesForDisplay = function( sizes ) {
            
            if ( !sizes ) return [];
            
            var fileSizeList = [];
            
            _.each( sizes, function( sizeInBytes, deviceName ) {
                
                var variantExceedsLimit = false;
                
                // Only show Download Size warnings for iOS
                if ( $$.buildForFileSizeModal.platform === 'ios' ) {
                    
                    // Determine which variant sizes exceed the limit, if any
                    variantExceedsLimit = ( sizeInBytes.compressed > $$.referenceData.processedFileSizeLimitInBytes );
                    
                    // Show warning message at top of modal if any variants are too large
                    if (variantExceedsLimit) $$.oneOrMoreVariantsExceedSizeLimit = true;
                }
                
                fileSizeList.push({
                    deviceType:             deviceName,
                    fileSizeCompressed:     ITC.file.bytesToReadableSize( sizeInBytes.compressed ),
                    fileSizeUncompressed:   ITC.file.bytesToReadableSize( sizeInBytes.uncompressed ),
                    sizeForSortingPurposes: sizeInBytes.compressed,
                    // Display a warning icon if compressed size exceeds the allowed amount (100 MB as of this writing)
                    sizeExceedsLimit:       variantExceedsLimit
                });
            });
            
            fileSizeList = _.sortBy( fileSizeList, 'sizeForSortingPurposes' ).reverse();
            
            return fileSizeList;
        };
        
        // Prepare the modal data as soon as we detect that it's being shown.
        $$.$watch( 'modals.displayProcessedFileSizes', function( isModalBeingShown, wasModalBeingShown ) {
            if (isModalBeingShown) { getBuildSizes(); }
        });
        
    }]);
});