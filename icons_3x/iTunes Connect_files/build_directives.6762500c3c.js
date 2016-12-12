define(['sbl!app'], function (itcApp) {
    
    // Directive to display a build icon, with appropriate placeholder fallbacks, for either iOS or tvOS
    //       Usage: <span display-icon-for-build="build"></span>  # if 'build' contains the requisite 'iconUrl' and 'platform' parameters
    
    // Optionally, you can specify each of those parameters yourself. Note: these will override anything retrieved from the build object:
    //              <span display-icon-for-build 
    //                    build-icon-url="<url>" 
    //                    build-platform="<platformString>"></span>
    // Notes:
    // -- If 'iconUrl'  is missing or falsy, it will display a placeholder icon (a wireframe in the shape of app icon)
    // -- If 'platform' is missing or falsy, it will assume 'ios' as the platformString
    // -- It's recommended to add an 'ng-if' on the directive if you're waiting for data from an asynchronous source
    itcApp.directive( 'displayIconForBuild', [ '$timeout', '$q', function( $timeout, $q ) {
        return {
            
            restrict: 'A',
            
            scope: {
                'buildObject': '=displayIconForBuild',
                'buildPlatform': '=?',
                'buildIconUrl': '=?',
                'delayRender': '=?',
                'mask': "@"
            },
            
            templateUrl: getGlobalPath('/itc/templates/prerelease/show-build-icon.html'),
            
            link: function( scope, el, attrs ) {
                
                var build, 
                    iconUrl, 
                    platform, 
                    data, 
                    DEFAULTS = { iconUrl: null, platform: 'ios' };
                
                function collectAttributes() {
                    
                // Ideally, we've supplied a 'build' object with the necessary data.
                    if ( scope.buildObject ) {
                        build    = scope.buildObject;
                        iconUrl  = build.iconUrl;
                        platform = build.platform;
                    }
                    
                // If iconURL or platform have been manually specified, they'll take precedence
                    if (scope.buildIconUrl)  iconUrl = scope.buildIconUrl;
                    if (scope.buildPlatform) platform = scope.buildPlatform
                    
                // If we still don't have the required values, fallback to defaults
                    iconUrl  = iconUrl  || DEFAULTS.iconUrl;
                    platform = platform || DEFAULTS.platform;
                    
                    return({ iconUrl: iconUrl, platform: platform });
                }
                
                function renderIcon() {
                    data = collectAttributes();
                    
                // Apply data to the directive scope, for rendering
                    if (build) scope.build = build;
                    scope.iconUrl  = data.iconUrl;
                    scope.platform = data.platform;
                }

                // if the buildIconUrl changes, re-render it. 
                scope.$watch('buildIconUrl', function(newVal, oldVal) {
                    renderIcon();
                });

                scope.getMask = function() {
                    if (scope.mask && scope.mask.length > 0) {
                        return scope.mask;
                    }
                    else {
                        return "";
                    }
                }
                
                $timeout( renderIcon );
            }
        }
    }]);
    
    
    
    // Include next to a build. It'll show a roll-up of testing-related warnings related to that build, if any exist.
    // <span  build-warning-list-icon  build-object="build"  loc-object="l10n" ></span>
    // Optionally, show only certain warnings with: < ... warnings-to-show="warning1,warning2">
    //      ^ It detects ALL warnings by default. Typically this is not desired.
    itcApp.directive( 'buildWarningListIcon', [ '$timeout', '$state', 'ITC', '$rootScope', 'betaSoftwareServices', '$sce', function( $timeout, $state, ITC, $rootScope, betaSoftwareServices, $sce) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                l10n:  '=locObject',
                build: '=buildObject'
                // warningsToShow: '=warningsToShow'
            },
            template: '<span class="ibvm hasPopOver" ng-show="build.hasWarnings && !build.hasFatalError && !build.processing == true">'
                     +'   <a href="javascript:void(0)" class="inline-ico ico-warning build-warning-icon"></a>'
                     +'   <div class="centerPopRight padded" style="width: 320px">'
                     +'     <ul class="tooltip-list hasTextLinks" ng-class="{\'single-item\': numWarnings == 1 }" style="white-space: normal">'
                     +'         <li ng-repeat="message in messages" ng-bind-html="renderHtml( message )"></li>'
                     +'     </ul>'
                     +'   </div>'
                     +'</span>'
            ,
            link: function( scope, el, attrs ) {
                
                scope.renderHtml = $sce.trustAsHtml;

                var execute = function( $$, el, attrs ) {
                    
                    var config = {
                        catchWhitelistErrors: true,
                        // catchBetaEntitlementErrors: true,
                        catchExportComplianceErrors: true,
                        catchFileSizeErrors: $rootScope.referenceData.showVariantSizesEnabled // Property protected for now
                    };

                    var build = $$.build,
                        l10n  = $$.l10n || $rootScope.l10n,
                        adamId = $$.adamId || $$.$parent.adamId || $$.$parent.$parent.adamId,
                        refData = $$.referenceData || $$.$parent.referenceData || $rootScope.referenceData;
                        
                    $$.numWarnings = 0;    
                    $$.messages = [];
                    
                    var tooltip_trigger = $(el).find('.ico-warning'),
                        tooltip_itself  = $(el).find('.centerPopRight');
                    
                    tooltip_trigger.on( 'click', function() {
                        $('.open').not( tooltip_itself ).removeClass('open');
                        tooltip_itself.toggleClass('open');
                        if (tooltip_itself.height() % 2 !== 0) {
                            tooltip_itself.css({ paddingBottom: '19px' });
                        }
                    });
                    
                    // Allow us to ignore certain "warnings", depending on the context
                    function shouldShowWarning( warning ) {
                        return (new RegExp( warning ).test( attrs.warningsToShow ));
                    }
                    
                    // Determine which warnings to check for (varies by the context in which we're displaying a build)
                    if ( attrs.warningsToShow && typeof attrs.warningsToShow === 'string' ) {
                        config.catchWhitelistErrors = shouldShowWarning( 'whitelist' );
                        config.catchExportComplianceErrors = shouldShowWarning( 'exportCompliance' );
                        config.catchFileSizeErrors = shouldShowWarning( 'fileSize' ) && refData.showVariantSizesEnabled;
                    }

                    var platform = build.platform || build.appPlatform || null;
                    
                    if (build.processingState === 'processing') {
                        return false;
                    }
                    
                    // Never show size warnings for tvOS builds
                    if ( platform && platform !== 'ios' ) {
                        config.catchFileSizeErrors = false;
                    }
                    
                    // Injects new warnings into the list, and maintains a count thereof.
                    // if numWarnings > 1, then we style the tooltip as a list (with bullet points)
                    function addWarning( message ) {
                        build.hasWarnings = true;
                        $$.numWarnings++;
                        $$.messages.push( message )
                    }
                    
                    //////////////////////////////////////////////
                    // WARN: Build generated with invalid version of Xcode
                    if ( config.catchWhitelistErrors && build.sdkBuildWhitelisted === false ) {
                        addWarning( l10n.interpolate('ITC.apps.builds.warnings.nonSDKWhitelist') )
                    }
                    
                    //////////////////////////////////////////////
                    // WARN: Build is missing the beta entitlement
                    //if (config.catchBetaEntitlementErrors && !betaSoftwareServices.isBuildBetaEntitled( build )) {
                    //    addWarning( 
                    //        l10n.interpolate('ITC.apps.preReleaseBuild.warnings.betaEntitlement', { 'devGuideURL': 'https://developer.apple.com/library/ios/documentation/LanguagesUtilities/Conceptual/iTunesConnect_Guide/Chapters/BetaTestingTheApp.html#//apple_ref/doc/uid/TP40011225-CH35-SW4' })
                    //    )
                    //}
                    
                    //////////////////////////////////////////////
                    // WARN: Build has export compliance warnings
                    if (config.catchExportComplianceErrors) {
                        
                        var ecState = build.exportComplianceState,
                            encryptionUrl = $state.href('app_overview.features.encryption', { adamId: adamId });
                            
                        if (ecState === 'declined') {
                            addWarning(l10n.interpolate('ITC.apps.builds.tooltips.buildRejected', { devGuideURL: 'https://developer.apple.com/app-store/Testflight/'}));
                        }
                   else if (ecState === 'invalid') {
                            addWarning(l10n.interpolate('ITC.apps.builds.tooltips.buildInvalid', { devGuideURL: 'https://developer.apple.com/app-store/Testflight/'}));
                            // log('added EC warning for invalid');
                            // log($$.numWarnings)
                        }
                   else if (ecState === 'expired') {
                            addWarning(l10n.interpolate('ITC.apps.builds.tooltips.buildExpired', { encryptionUrl: encryptionUrl }))
                        }
                    }
                    
                    //////////////////////////////////////////////
                    // WARN: Build exceeds the allowed file size limit (app slimming)
                    if ( config.catchFileSizeErrors && build.exceededFileSizeLimit === true ) {
                        
                        var fileSizeLimit = build.fileSizeLimitInBytes || 100000000,
                            fileLimitReadable = ITC.file.bytesToReadableSize( fileSizeLimit ),
                            fileSizeInfoText = 'ITC.apps.universal.appSlimming.buildExceededSize.tooltip.text';

                        var message = l10n.interpolate( fileSizeInfoText, { 
                            'buildNum': build.buildVersion,
                            'fileSizeLimit': fileLimitReadable
                        });
                        
                        message = message + ' ' + l10n.interpolate( 'ITC.apps.universal.appSlimming.buildExceededSize.tooltip.link' );
                            
                        addWarning( message );
                    }

                    // Activate ng-click on any necessary localized text
                    $timeout( function() { detectClickables( $$, el, attrs, build ) }, 100 );
                };
                
                // Special cases where the tooltip contains a link that must execute Angular code
                // - currently the only scenario is 'View App Store File Sizes'
                var detectClickables = function( $$, el, attrs, build ) {
                    $( el ).on( 'click', '#showProcessedSizesModal', function () {
                        $$.$emit( 'displayProcessedFileSizeModal', { build: build });
                    });
                };
                
                // Delay execution until builds are available
                $timeout( function() { execute( scope, el, attrs ) } );
            }
        
        }
        
    }]);

    ////////////////////////////////////////////////////////////
    // Included in the 'showBuildWithMetadata' directive below.
    itcApp.directive( 'buildErrorIcon', [ '$timeout', '$sce', 'ITC', '$rootScope', '$state', 'betaSoftwareServices', function( $timeout, $sce, ITC, $rootScope, $state, betaSoftwareServices ) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                l10n:  '=locObject',
                build: '=buildObject',
                hideErrors: '=?'
            },
            template: '<span class="ibvm hasPopOver" ng-show="build.hasFatalError">'
                     +'   <a href="javascript:void(0)" class="inline-ico error ico-warning build-warning-icon"></a>'
                     +'   <div tooltip-message class="{{ tooltipClass }} padded" style="{{ tooltipStyle }}">'
                     +'     <p ng-bind-html="renderHtml( message )"></p>'
                     +'   </div>'
                     +'</span>',
            
            link: function( scope, el, attrs ) {
                
                scope.renderHtml   = $sce.trustAsHtml;
                
                if (attrs.tooltipClass && attrs.tooltipClass === 'centerPopUp') {
                    scope.tooltipClass = 'centerPopUp pop-over trueCenter';
                    scope.tooltipStyle = 'width: '+ ( attrs.tooltipWidth || '300px' );
                } else {
                    scope.tooltipClass = 'centerPopRight';
                    scope.tooltipStyle = 'width: '+ ( attrs.tooltipWidth || '300px' );
                };

                var execute = function( $$, el, attrs ) {
                    
                    var build = $$.build,
                        l10n  = $$.l10n || $rootScope.l10n;
                        
                    scope.message = '';
                    
                    var config = {
                        showImportErrors: true,
                        showBetaEntitlementErrors: false
                    };
                    
                    if (build.processingState === 'processing') {
                        return false;
                    }
                    
                    // Allow us to ignore certain "errors", depending on the context
                    function shouldShowError( err ) {
                        return (new RegExp( err ).test( attrs.errorsToShow ));
                    }
                    
                    // Determine which warnings to check for (varies by the context in which we're displaying a build)
                    if ( attrs.errorsToShow && typeof attrs.errorsToShow === 'string' ) {
                        config.showImportErrors = shouldShowError( 'importErrors' );
                        config.showBetaEntitlementErrors = shouldShowError( 'betaEntitlement' );
                    }
                    
                    /////////////////
                    
                    var tooltip_trigger = $(el).find('.ico-warning'),
                        tooltip_itself  = $(el).find('[tooltip-message]');
                    
                    tooltip_trigger.on( 'click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $('.open').not( tooltip_itself ).removeClass('open');
                        tooltip_itself.toggleClass('open');
                        if (tooltip_itself.height() % 2 !== 0) {
                            tooltip_itself.css({ paddingBottom: '19px' });
                        }
                    });
                    
                    tooltip_itself.on( 'click', function(e) { e.stopPropagation() });
                    
                    // Exit if there are no errors to display
                    // if (!build || !build.processingState) return;
                    
                    function displayError( msg ) {
                        build.hasFatalError = true;
                        scope.message = msg;
                    }
                    
                    // When showing errors on the Internal Testing page, the copy is different.
                    // We refer to "The latest build..." rather than "This build..."
                    var keySuffix = "";
                    if (attrs.isOnInternalTestingPage) keySuffix += '.internalTesting';
                    
                    // ERROR: Processing Failed
                    if ( config.showImportErrors && build.processingState === 'processingFailed' ) {
                        var activityPageLink = $state.href('app_overview.activity.builds', { platform: build.platform });
                        displayError($$.l10n.interpolate('ITC.apps.preReleaseBuild.errors.processingFailed'+keySuffix, { linkToActivityPage: activityPageLink }));
                    
                    // ERROR: Invalid Binarry
                    } else if ( config.showImportErrors && build.processingState === 'invalidBinary' ) {
                        displayError( $$.l10n.interpolate('ITC.apps.preReleaseBuild.errors.invalidBinary'+keySuffix) );
                        
                    // ERROR: Missing Beta Entitlement (by default this isn't checked for)
                    } else if ( config.showBetaEntitlementErrors && !build.hasFatalError && !betaSoftwareServices.isBuildBetaEntitled(build) ) {
                        displayError( $$.l10n.interpolate('ITC.apps.preReleaseBuild.warnings.betaEntitlement'+keySuffix, {
                            'devGuideURL': 'https://developer.apple.com/library/ios/documentation/LanguagesUtilities/Conceptual/iTunesConnect_Guide/Chapters/BetaTestingTheApp.html#//apple_ref/doc/uid/TP40011225-CH35-SW4' 
                        }));
                    }
                };
                
                // Delay execution until builds are available
                $timeout( function() { execute( scope, el, attrs ) } );
            }
        
        }
        
    }]);



    function buildIsProcessing( build ) {
        return( build && (build.processing === true || build.processingState === 'processing'));
    }

    // If build wasn't imported correctly, show a red alert icon, with tooltip if possible.
    // Errors of this type supersede any warnings that might have otherwise have been displayed.
    function buildHasFatalErrors( build ) {
        if (!build) return undefined;
        if (build.processingState === 'processingFailed') return true;
        if (build.processingState === 'invalidBinary') return true;
        return false;
    }

    itcApp.directive( 'showBuildWithMetadata', [ '$timeout', '$rootScope', 'ai', function( $timeout, $rootScope, ai ) {
        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            scope: {
                'build': '=showBuildWithMetadata',
                'pageContext': '@pageContext' // Unused at present, but will allow customization per-page
            },
            templateUrl: getGlobalPath('/itc/templates/prerelease/build-row-item.html'),
            link: function( scope, el, attrs ) {
                
                function execute() {
                
                    var build = scope.build;
                    
                    scope.l10n = scope.l10n || $rootScope.l10n;
                    
                    // Initial values.
                    scope.showDetailsLink    = true;    // Show link to Build Details?
                    scope.showProcessingText = false;   // (Processing)
                    scope.hasWarnings        = false;   // Warning icon - for non-fatal issues
                    scope.hasFatalError      = false;   // Alert icon - for failed uploads
                    
                    scope.msgs = {
                        processingLabel: $rootScope.l10n['ITC.apps.builds.isProcessing.infoText'] // (Processing)
                    };
                    
                    // Check to see if build is processing
                    if (buildIsProcessing( build )) {
                        scope.showProcessingText = true;
                        // Disable the link if we don't have build details
                        if (!build.hasBuildDetail) scope.showDetailsLink = false;
                    }
                    
                    // Check for errors last, to ensure we override any previous states.
                    if (buildHasFatalErrors( build )) {
                        scope.hasFatalError = true;
                        scope.showProcessingText = false;
                        scope.showDetailsLink = false;
                    }
                }

                scope.useMessagesIcon = function() {
                    return scope.build.launchProhibited && scope.build.hasMessagesExtension;
                }

                scope.getBuildIconUrl = function() {
                    var token;
                    if (scope.useMessagesIcon()) {
                        token = scope.build.messagesIconAssetToken;
                    }
                    else {
                        token = scope.build.iconAssetToken;
                    }
                    
                    if (!token) {
                        return null;
                    }
                    return scope.getUrlFromToken(token);
                }

                scope.getUrlFromToken = function(token) {
                    if (scope.urlFromToken) {
                        return scope.urlFromToken;
                    }

                    var ht = 75; 
                    var config = {
                        token: token, 
                        height: ht, 
                        width: 9999,
                        formatType: ai.imageservice.FormatType.PNG 
                    };
                    var url = scope.img_url_gen.generateUrlForToken(config);
                    
                    scope.urlFromToken = url; // memoize it
                    return url;
                }

                scope.getBuildIconMask = function() {
                    if (scope.useMessagesIcon()) {
                        return "iMessageIcon";
                    }
                    else {
                        return "appIcon";
                    }
                }

                scope.img_url_gen = new ai.imageservice.ImageURLGenerator($rootScope.referenceData.imageServiceBaseUrl);

                $timeout( function() { execute( scope, el, attrs ) } );
            }
        };
    }]);
    
    
});
