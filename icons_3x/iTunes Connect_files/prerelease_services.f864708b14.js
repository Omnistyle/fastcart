define(['sbl!app'], function (itcApp) {

    itcApp.factory( 'preReleaseBuildsDataService', function($http){
        return {
            load: function(adamId) {
                return $http.get(global_itc_path + '/ra/apps/'+adamId+'/trains/',{cache:false}).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            save: function(adamId, payload) {
                return $http.post(global_itc_path + '/ra/apps/'+adamId+'/trains/', payload).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            devReject: function(adamId, train, build) {
                return $http.post(global_itc_path + '/ra/apps/'+adamId+'/trains/'+train+'/builds/'+build+'/reject', {}).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            }
        };
    });

    // New version of these services, as of Feb 2015
    itcApp.factory( 'preReleaseTrainsDataService', function($http) {
        return {
            load: function(adamId, params) {
                return $http.get(global_itc_path + '/ra/apps/'+adamId+'/trains/' + getify(params), {cache:false}).then(function (response) {
                    // log("prerelease train data", response.data);
                    return response.data;
                }, function(error) { return error; });
            },
            save: function(adamId, params) {
                var testingType = params.testingType, 
                    payload = params.data;
                return $http.post(global_itc_path + '/ra/apps/'+adamId+'/testingTypes/'+testingType+'/trains/', payload)
                    .then(function (response) { return response.data }
                    ,function(error) { return error });
            },
            devReject: function(adamId, platform, train, build) {
                return $http.post(global_itc_path + '/ra/apps/'+adamId+'/platforms/'+platform+'/trains/'+train+'/builds/'+build+'/reject', {}).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            }
        };
    });

    itcApp.factory( 'buildTestersService', function( $http, $q ){
        return {
            // Accepts an abort option, passed from controller, so we can cancel 
            // the request if needed. For instance, if we receive build data from the server,
            // and discover the build is not beta entitled.
            load: function( adamId, train, build, platform, abort ) {
                var endpoint = global_itc_path + '/ra/apps/'+adamId+( platform ? '/platforms/'+platform : '')+'/trains/'+train+'/builds/'+build+'/testers',
                    abort = abort || $q.defer();
                return $http.get( endpoint, { timeout: abort.promise }).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            loadTestInfo: function( adamId, train, build, platform, abort ) {
                var endpoint = global_itc_path + '/ra/apps/'+adamId+( platform ? '/platforms/'+platform : '')+'/trains/'+train+'/builds/'+build+'/testInformation',
                    abort = abort || $q.defer();
                return $http.get( endpoint, { timeout: abort.promise }).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            saveTestInfo: function( adamId, train, build, platform, testinfodata ) {
                return $http.post(global_itc_path + '/ra/apps/'+adamId+( platform ? '/platforms/'+platform : '')+'/trains/'+train+'/builds/'+build+'/testInformation',testinfodata).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            loadExportInfo: function( adamId, train, build ) {
                return $http.get(global_itc_path + '/ra/apps/'+adamId+'/trains/'+train+'/builds/'+build+'/exportcompliance').then(function (response) {
                    console.log("EXPORT INFO");
                    console.log(response.data);
                    return response.data;
                }, function(error) { return error; });
            },
            saveExportInfo: function( adamId, train, build, exportinfodata ) {
                return $http.post(global_itc_path + '/ra/apps/'+adamId+'/trains/'+train+'/builds/'+build+'/exportcompliance',exportinfodata).then(function (response) {
                    console.log("EXPORT INFO Save");
                    console.log(response.data);
                    return response.data;
                }, function(error) { return error; });
            }
        };
    });



    itcApp.factory( 'preReleaseTestersDataService', function($http){
        return {
            getITCUsers: function() {
                return $http.get(global_itc_path + '/ra/users/pre/int').then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            // INTERNAL TESTERS
            getInternalTesters: function(adamId) {
                return $http.get(global_itc_path + '/ra/user/internalTesters/'+adamId+'/').then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            saveInternalTesters: function(adamId, payload) {
                return $http.post(global_itc_path + '/ra/user/internalTesters/'+adamId+'/', payload).then( function(response) {
                    return response.data;
                }, function (error) { return error; })
            },
            inviteInternalTesters: function(adamId) {
                return $http.post(global_itc_path + '/ra/apps/'+adamId+'/sendInternalInvites/', {}).then( function(response) {
                    return response.data;
                }, function(error) { return error; });
            },
            inviteExternalTesters: function(adamId, build) {
                
                return $http.post(global_itc_path + '/ra/user/externalTesters/'+adamId+'/invite/', build).then( function(response) {
                    return response.data;
                }, function(error) { return error; });
                
                // return "not implemented yet";
                // return $http.get(global_itc_path + '/ra/apps/'+adamId+'/sendExternalInvites/').then( function(response) {
                //     return response.data;
                // }, function(error) { return error; });
            },
            // EXTERNAL TESTERS
            getExternalTesters: function(adamId) {
                return $http.get(global_itc_path + '/ra/user/externalTesters/'+adamId+'/').then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            saveExternalTesters: function(adamId, payload) {
                return $http.post(global_itc_path + '/ra/user/externalTesters/'+adamId+'/', payload).then( function(response) {
                    return response.data;
                }, function (error) { return error; })
            },
            getExistingExternalTesters: function(adamId) {
                return $http.get(global_itc_path + '/ra/user/existingExternalTesters/'+adamId+'/').then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            },
            createExternalTesters: function(payload) { //provider level
                return $http.post(global_itc_path + '/ra/users/pre/create',payload).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            }

        };
    });
    
    // <rdar://problem/21792523> Increase Internal Tester Limits: 25/app from 25/provider
    itcApp.factory( 'testerDataService', function ($http) {
        return {
            getTesters: function(adamId) {
                return $http.get(global_itc_path + '/ra/users/pre/testers').then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            }
        } 
    });
    
    
    // Build: Build Details
    itcApp.factory( 'buildDetailsService', function($http){
        return {
            load: function(adamId, trainVersion, buildVersion, platform) {
                // log(adamId, trainVersion, buildVersion, platform);
                var url = global_itc_path + '/ra/apps/'+adamId+( platform ? '/platforms/'+platform : '')+'/trains/'+trainVersion+'/builds/'+buildVersion+'/details';
                return $http.get(url).then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            }
        };
    });
    
    // Build: Test Information
    itcApp.factory( 'buildTestInformationService', function($http){
        return {
            load: function(adamId, trainVersion, buildVersion) {
                return $http.get(global_itc_path + '/ra/apps/'+adamId+'/trains/'+trainVersion+'/builds/'+buildVersion+'/testInformation').then(function (response) {
                    return response.data;
                }, function(error) { return error; });
            }
        };
    });
    
    // For storing build metadata between Angular views
    /*
    Deprecated - localstorage is not available in private/incognito window
    itcApp.factory( 'currentAppService', function() {
        return {
            setApp: function(data) {
               
            },
            setBuild: function(trainVersion, buildVersion) {
                localStorage.setItem( 'trainVersion', trainVersion);
                localStorage.setItem( 'buildVersion', buildVersion);
                return (trainVersion, buildVersion);
            },
            getTrainVersion: function() {
                return localStorage.getItem('trainVersion') || '';
            },
            getBuildVersion: function() {
                return localStorage.getItem('buildVersion') || '';
            },
        };
    });*/
    
    
    // Versions:
    //    /ra/apps/1000003940/stateHistory?platform=ios
    //    /ra/apps/1000003940/versions/811870346/stateHistory
    // Builds:
    //    /ra/apps/1000003940/buildHistory?platform=ios
    //    /ra/apps/1000003940/trains/1.0/buildHistory?platform=ios

    itcApp.factory( 'appHistoryService', function ($http) {
        return {
            loadVersionHistory: function(adamId, platform) {
                var query = global_itc_path + '/ra/apps/'+adamId+'/stateHistory?platform='+platform;
                return $http.get( query ).then(
                    function (response) { return response.data; },
                    function (error)    { return error }
                );
            },
            loadVersion: function(adamId, platform, versionId) {
                var query = global_itc_path + '/ra/apps/'+adamId+'/versions/'+versionId+'/stateHistory?platform='+platform;
                return $http.get( query ).then(
                    function (response) { return response.data; },
                    function (error)    { return error }
                );
            },
            loadTrainHistory: function(adamId, platform) {
                var query = global_itc_path + '/ra/apps/'+adamId+'/buildHistory?platform='+platform;
                return $http.get( query ).then(
                    function (response) { return response.data; },
                    function (error)    { return error }
                );
            },
            loadTrain: function(adamId, platform, trainVersion) {
                var query = global_itc_path + '/ra/apps/'+adamId+'/trains/'+trainVersion+'/buildHistory?platform='+platform;
                return $http.get( query ).then(
                    function (response) { return response.data; },
                    function (error)    { return error }
                );
            }
        };
    });

    //submit for beta review service
    itcApp.factory('submitForBetaReviewService',function($http){
        return {
            submitForReview: function(adamId,trainVersion,buildVersion,buildSubmission) {
                var promise;
                if (buildSubmission !== undefined) {
                    promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/trains/'+
                    trainVersion +'/builds/'+ buildVersion +'/submit/start',buildSubmission).then(function(response) {
                        return response.data;
                    },function(reason) {
                        return reason;
                    });
                } else {
                    promise = $http.get(global_itc_path + '/ra/apps/' + adamId + '/trains/'+
                    trainVersion +'/builds/'+ buildVersion +'/submit/start',{cache:false}).then(function(response) {
                        return response.data;
                    },function(reason) {
                        return reason;
                    });
                }
                return promise;
            },
            // This is the submit for review for the new XC flow for use in external testing, to be used instead of (1) submitForReviewByPlatform and (2) finalizeSubmitForReviewByPlatform
            // /apps/{adamId:Long}/platforms/{platform:String}/trains/{trainVersion:String}/builds/{buildVersion:String}/review/submit
            submitForReviewNewXC: function(adamId,trainVersion,buildVersion,platform,buildSubmission) {
                var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/platforms/' + platform + '/trains/'+
                    trainVersion +'/builds/'+ buildVersion +'/review/submit',buildSubmission).then(function(response) {
                    log("new submit for review response: ", response.data);
                    return response.data;
                },function(reason) {
                    return reason;
                });
                // Return the promise to the controller
                return promise;
            },
            // /apps/{adamId:Long}/platforms/{platform:String}/trains/{trainVersion:String}/builds/{buildVersion:String}/submit/start
            submitForReviewByPlatform: function(adamId,trainVersion,buildVersion,platform,buildSubmission) {
                if (buildSubmission !== undefined) {
                    return $http.post(global_itc_path + '/ra/apps/' + adamId + '/platforms/' + platform + '/trains/'+
                        trainVersion +'/builds/'+ buildVersion +'/submit/start',buildSubmission).then(function(response) {
                        return response.data;
                    },function(reason) {
                        return reason;
                    });
                } else {
                    return $http.get(global_itc_path + '/ra/apps/' + adamId + '/platforms/' + platform + '/trains/'+
                    trainVersion +'/builds/'+ buildVersion +'/submit/start', {cache: false }).then(function(response) {
                        return response.data;
                    },function(reason) {
                        return reason;
                    });
                }
            },
            finalizeSubmitForReview: function(adamId,trainVersion,buildVersion,buildSubmission) {
                var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/trains/'+
                    trainVersion +'/builds/'+ buildVersion +'/submit/complete',buildSubmission).then(function(response) {
                    return response.data;
                },function(reason) {
                    return reason;
                });
                // Return the promise to the controller
                return promise;
            },
            // /apps/{adamId:Long}/platforms/{platform:String}/trains/{trainVersion:String}/builds/{buildVersion:String}/submit/complete
            finalizeSubmitForReviewByPlatform: function(adamId,trainVersion,buildVersion,platform,buildSubmission) {
                var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/platforms/' + platform + '/trains/'+
                    trainVersion +'/builds/'+ buildVersion +'/submit/complete',buildSubmission).then(function(response) {
                    return response.data;
                },function(reason) {
                    return reason;
                });
                // Return the promise to the controller
                return promise;
            }
        };
    });


    itcApp.factory( 'betaStateResolver', [ '$rootScope', function( $rootScope ) {
        return {
            // 0 = red, 1 = yellow, 2 = green   (-1 = blank status (grey))
            dict: {
                'active': 2,
                'approved': 2,
                'approvedInactive': 1,
                'deleted': 0,
                'devRejected': 0,
                'developerRemovedFromSale': 0,
                'inactive': -1,
                'inExtendedReview': 1,
                'inReview': 1,
                'invalidBinary': 0,
                'metadataRejected': 0,
                'missingScreenshot': 1,
                'parking': 1,
                'pendingContract': 1,
                'pendingDeveloperRelease': 1,
                'prepareForUpload': 1,
                'processing': 1,
                'readyForSale': 2,
                'readyToTest': 2,
                'rejected': 0,
                'removedFromSale': 1,
                'replaced': 1,
                'uploadReceived': 1,
                'submitForReview': 1,
                'waiting': 1,
                'waitingForExportCompliance': 1,
                'waitingForReview': 1,
                'waitingForUpload': 1
            },
            // receives key, and returns localized string
            translate: function( l10n, state ) {
                if (!l10n) return state;
                var text = l10n['ITC.apps.universal.buildStatus.'+state] || l10n['ITC.apps.status.'+state];
                if (text && text !== 'none') return text;
                return ' ';
            },
            // receives key, and returns CSS class
            getIconClass: function( state ) {
                var value = this.dict[state];
                switch (value) {
                   case -1:  return '';          // grey
                    case 0:  return 'bad';       // red
                    case 1:  return 'neutral';   // yellow
                    case 2:  return 'good';      // green
                    default: return 'no-status'; // 
                }
            }
        }
    }]);


    itcApp.factory( 'betaSoftwareServices', function() {
        return {
            
            // Invoked upon a build when it first arrives from the server.
            // Adds helpful values for interpreting + processing a build, such as whether or not it has variants, etc.
            parseBuild: function( build ) {
                
                var b = build;
                
                // if 'sizesInBytes' is present and populated, we know the build has device variants
                if ( b.hasVariants === undefined ) {
                     b.hasVariants = (typeof b.sizesInBytes === 'object' && _.size(b.sizesInBytes) > 0) || null;
                }
                
                // Make sure a build's platform is available as 'platform' (sometimes it arrives as 'appPlatform')
                if ( b.appPlatform && b.platform !== b.appPlatform ) {
                    b.platform = String( b.appPlatform )
                }
                
                if ( b.processingState === 'invalidBinary' || b.processingState === 'processingFailed' ) {
                    b.hasFatalErrors = true;
                }
                
                   
                return b;
            },

            ensureThingHasTO: function( thing, key ) {
                
                key = key || 'internalTesting';
                
                thing[ key ] = thing[ key ] || {
                    errorKeys: null,
                    isEditable: true,
                    isRequired: false,
                    value: false
                }
                
                return thing;
            },
            
            isBuildBetaEntitled: function( build ) {
                var b = build;
                if (b.processing) return null;
                if (b.betaEntitled !== undefined && b.betaEntitled === true) return true;
                var statuses = [ b.internalState, b.externalState, b.externalStatus ].join('');
                if (/noBetaEntitlement/i.test(statuses)) return false;
                return false;
            },
            
            doesBuildHaveFatalError: function( build ) {
                if (!build) return;
                if (build.processingState === 'invalidBinary') return true;
                if (build.processingState === 'processingFailed') return true;
                return false;
            },
            
            // Accepts an array of train objects, and sorts them by versionString
            // e.g. trainObject.sort( betaSoftwareServices.sortTrains )  --->  returns sorted "trainObject"
            sortTrains: function(v1,v2) {
            
                var s1 = v1.versionString,
                    s2 = v2.versionString;
                
                var v1parts = (typeof s1.split === 'function') ? s1.split('.') : [ toString(s1) ],
                    v2parts = (typeof s2.split === 'function') ? s2.split('.') : [ toString(s2) ];

                function isValidPart(x) {
                    return (/^\d+$/).test(x);
                }

                if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                    return NaN;
                }

                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);

                for (var i = 0; i < v1parts.length; ++i) {
                    if (v2parts.length == i)            return 1;
                    if (v1parts[i] == v2parts[i])       continue;
                    else if (v1parts[i] > v2parts[i])   return 1;
                    else return -1;
                }

                if (v1parts.length != v2parts.length) {
                    return -1;
                }

                return 0;
            },
            sortBuilds: function(v1,v2) {
            
                var s1 = v1.buildVersion,
                    s2 = v2.buildVersion;
                
                var v1parts = (typeof s1.split === 'function') ? s1.split('.') : [ toString(s1) ],
                    v2parts = (typeof s2.split === 'function') ? s2.split('.') : [ toString(s2) ];

                function isValidPart(x) {
                    return (/^\d+$/).test(x);
                }

                if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                    return NaN;
                }

                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);

                for (var i = 0; i < v1parts.length; ++i) {
                    if (v2parts.length == i)            return 1;
                    if (v1parts[i] == v2parts[i])       continue;
                    else if (v1parts[i] > v2parts[i])   return 1;
                    else return -1;
                }

                if (v1parts.length != v2parts.length) {
                    return -1;
                }

                return 0;
            }
            
        } 
    });

});
