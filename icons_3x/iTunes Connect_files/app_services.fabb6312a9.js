define(['sbl!app'], function (itcApp) {
    var base = global_itc_path + '/ra';

  /*
  USAGE: get and set...
  For creating a new app (appType = ios)
  */
  itcApp.factory('createAppService',function($http, TimingMarker){
    var myService = {
      load: function(appType) {
        var promise = $http.get(global_itc_path + '/ra/apps/create/?appType='+appType,{ cache: false}).then(function (response) {
          log("CREATE APP - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },
      loadV2: function(appType) {
        TimingMarker.marker.start("service.createAppService.loadV2");
        var promise = $http.get(global_itc_path + '/ra/apps/create/v2/?platformString=' + appType, {cache: false}).then(function (response) {
          log("CREATE APP - LOAD DATA (v2)");
          log(response.data);
          TimingMarker.marker.end("service.createAppService.loadV2");
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },
      create: function(appType, appDetails) {
          var promise = $http.post(global_itc_path + '/ra/apps/create/?appType=' + appType, appDetails).then(function(response) {
            log("CREATE APP - SAVE DATA");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
      },
      createV2: function(appType, appDetails) {
          TimingMarker.marker.start("service.createAppService.createV2");
          var promise = $http.post(global_itc_path + '/ra/apps/create/v2/', appDetails).then(function(response) {
            log("CREATE APP - SAVE DATA (v2)");
            log(response.data);
            TimingMarker.marker.end("service.createAppService.createV2");
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
    };
    return myService;
  });

  /*
  USAGE: get and set...
  For getting and setting res center data

    for getting:
    @Path("/apps/{adamId:Long}/platforms/{platform}/versions/{versionId:Long:\\d+}/resolutionCenter")

    for setting: leave out the versions/{version}
  */
  itcApp.factory('resCenterService',function($http){
    var myService = {
      load: function(appOrBundle, adamId, ver, platform) {
        var addVersion = "";
        var addPlatform = "";
        if (ver) {
          if (platform) {
            addVersion = "/versions/" + ver;
          }
          else {
            addVersion = "?v=" + ver;
          }
        }
        if (platform) {
          addPlatform = "/platforms/" + platform;
        }
        var url;
        if (!appOrBundle || appOrBundle.toLowerCase() === "app") {
          if (platform) {
            url = global_itc_path + '/ra/apps/' + adamId + addPlatform + addVersion + '/resolutionCenter';
          }
          else {
            url = global_itc_path + '/ra/apps/' + adamId + '/resolutionCenter' + addVersion;
          }
        }
        else if (appOrBundle.toLowerCase() === "bundle") {
          url = global_itc_path + '/ra/appbundles/' + adamId + addPlatform + '/resolutionCenter';
        }
        var promise = $http.get(url).then(function (response) {

          log("Res center service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      send: function(appOrBundle, adamId, ver, platform, data) {
            var addVersion = "";
            var addPlatform = "";
            if (ver) {
              if (platform) {
                addVersion = "/versions/" + ver;
              }
              else {
                addVersion = "?v=" + ver;
              }
            }
            if (platform) {
              addPlatform = "/platforms/" + platform;
            }
            var url;
            if (!appOrBundle || appOrBundle.toLowerCase() === "app") {
              if (platform) {
                url = global_itc_path + '/ra/apps/'+adamId + addPlatform + '/resolutionCenter';
              }
              else {
                url = global_itc_path + '/ra/apps/' + adamId + '/resolutionCenter' + addVersion;
              }
            }
            else if (appOrBundle.toLowerCase() === "bundle") {
              url = global_itc_path + '/ra/appbundles/'+adamId + addPlatform + '/resolutionCenter';
            }
            var promise = $http.post(url, data).then(function(response) {

            log("Sending message....");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
    };
    return myService;
  });

  /*
  USAGE: get and set...
  For getting and setting export compliance data

    GET: /apps/{adamId}/exportcompliances
    POST: /apps/{adamId}/exportcompliances
  */
  itcApp.factory('exportComplianceService',function($http){
    var myService = {
      load: function(adamId) {
        var url = global_itc_path + '/ra/apps/' + adamId + '/exportcompliances';
        var promise = $http.get(url).then(function (response) {

          log("Export compliance service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      send: function(adamId, data) {
            var url = global_itc_path + '/ra/apps/' + adamId + '/exportcompliances';
            var promise = $http.post(url, data).then(function(response) {

            log("Sending message....");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
    };
    return myService;
  });

  /*
  USAGE: get and set...
  For getting and setting test information data

    GET and POST: /apps/{adamId:Long}/testInformation
  */
  itcApp.factory('testInformationService',function($http){
    var myService = {
      load: function(adamId) {
        var url = global_itc_path + '/ra/apps/' + adamId + '/testInformation';
        var promise = $http.get(url).then(function (response) {

          log("Export compliance service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      send: function(adamId, data) {
            var url = global_itc_path + '/ra/apps/' + adamId + '/testInformation';
            var promise = $http.post(url, data).then(function(response) {

            log("Sending message....");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
    };
    return myService;
  });


  /*
  USAGE: get and set...
  For getting and setting promo art data

    GET: /WebObjects/iTunesConnect.woa/ra/apps/adamid/promoarts/all
    POST: /WebObjects/iTunesConnect.woa/ra/apps/adamid/promoarts/{anID}
  */
  itcApp.factory('promoArtService',function($http){
    var myService = {
      load: function(adamId) {
        var url = global_itc_path + '/ra/apps/' + adamId + '/promoarts/all';
        var promise = $http.get(url).then(function (response) {

          log("Promo Art service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      send: function(adamId, requestId, data) {
            var url = global_itc_path + '/ra/apps/' + adamId + '/promoarts/' + requestId;
            var promise = $http.post(url, data).then(function(response) {

            log("Sending message....");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
    };
    return myService;
  });

  itcApp.factory('pricingService',function($http){
    var myService = {
      getIntervals: function(adamId) {
        // /apps/{adamId:Long}/pricing/intervals
        var url = global_itc_path + '/ra/apps/'+adamId+'/pricing/intervals';

        var promise = $http.get(url).then(function (response) {

          log("Pricing service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      // gets tiers for a given country. If countryCode is not set, the default is US.
      // countryCode is optional.
      getTiers: function(adamId, countryCode) {
        // /ra/apps/1000095418/pricing/tiersByCountry?countryCode=DE
        var optionalParam = "";
        if (countryCode) {
          optionalParam = "?countryCode=" + countryCode;
        }
        var url;
        if (adamId) {
          url = global_itc_path + '/ra/apps/'+adamId+'/pricing/tiersByCountry' + optionalParam;
        }
        else {
          url = global_itc_path + '/ra/apps/pricing/tiersByCountry' + optionalParam;
        }

        var promise = $http.get(url).then(function (response) {

          log("Pricing tier service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      // gets one tier (all countries) by tierStem
      getTierByStem: function(adamId, tierStem) {
        // /ra/apps/1000095418/pricing/tiersByStem?tierStem=0
        var url = global_itc_path + '/ra/apps/'+adamId+'/pricing/tiersByStem?tierStem=' + tierStem;

        var promise = $http.get(url).then(function (response) {

          log("Pricing tier stem service - " + tierStem);
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      getMatrix: function(adamId) {
        // /apps/{adamId:Long}/pricing/matrix
        var url;
        if (!adamId) {
          url = global_itc_path + '/ra/apps/pricing/matrix';
        }
        else {
          url = global_itc_path + '/ra/apps/'+adamId+'/pricing/matrix';
        }
        //var url = global_itc_path + '/ra/apps/'+adamId+'/pricing/matrix';

        var promise = $http.get(url).then(function (response) {

          log("Pricing matrix service - LOAD DATA");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },

      getCountries: function() {
        // /ra/apps/pricing/supportedCountries
        var url = global_itc_path + '/ra/apps/pricing/supportedCountries';

        var promise = $http.get(url).then(function (response) {

          //log("Pricing country service--");
          //log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      },
      getCountriesSource: {},
      getCountriesKeyed: {},

      setIntervals: function(adamId, data) {
            var url = global_itc_path + '/ra/apps/'+adamId+'/pricing/intervals';

            var promise = $http.post(url, data).then(function(response) {

            log("Sending message....");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
    };
    return myService;
  });

  itcApp.factory('updateAppService',function($http){
    var myService = {
      load:function(adamId) {
        var promise = $http.get(global_itc_path + '/ra/apps/'+adamId+'/update').then(function (response) {
          return response.data;
        });
        return promise;
      },
      save:function(adamId,appdata) {
        var promise = $http.post(global_itc_path + '/ra/apps/'+adamId+'/update',appdata).then(function (response) {
          return response.data;
        });
        return promise;
      }
    }
    return myService;
  });

  /**
   * Validate screened words.
   * returns an array of strings with the warnings or an empyy array if nothing
   */
  itcApp.factory('validateScreenedWordsService',function($http){
    var myService = {
      validate:function(text, fieldName, adamId) {
            var req = {};
            req["text"] = text;
            req["adamId"] = adamId;
            req["fieldName"] = fieldName;
            var promise = $http.post(global_itc_path + '/ra/apps/validate/screened/words',  req).then(function(response) {
                if (response.data && response.data.data) {
                    return response.data.data;
                }
               return [];
            });
        return promise;
      }
    }
    return myService;
  });

  /*
  USAGE: create new version
  */
    itcApp.service('createAppVersionService',function($http){
      var myService = {
        create: function(adamId, versionNum) {
          var promise = $http.post(global_itc_path + '/ra/apps/version/create/' + adamId, versionNum).then(function(response) {
            log("CREATE APP Version");
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        }
      };
      return myService;
    });

   /*
    USAGE: Delete an app
    */
    itcApp.service('deleteAppService',function($http){
      var myService = {
        delete: function(link) {
          var promise = $http.post(link).then(function(response) {
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise;
        }
    };
      return myService;
    });

    /*
    USAGE: Dev reject an app
    */
    itcApp.service('devRejectAppService',function($http){
      var myService = {
        reject: function(adamId,versionId) {
          var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/versions/' + versionId + '/reject').then(function(response) {
            log(response.data);
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise;
        }
    };
      return myService;
    });

  /*
  USAGE: two functions:
  async(adamId) -> get all IAPs associated with given App AdamId
  excludedIap(adamId) -> get all IAPs from provider not associated to a particular App (AdamId)
  */
  itcApp.factory('iapDataService', function($http) {
    var myService = {
      async: function(adamId) {
        var promise = $http.get(global_itc_path + '/ra/addons/list?appAdamId='+adamId).then(function (response) {
          log("IAP DATA SERVICE RESPONSE >>>>");
          log(response.data);
          return response.data;
        },function(reason){
          //error handling
          return reason;
        });
        // Return the promise to the controller
        return promise;
      },
      excludedIap: function(adamId) {
        var promise = $http.get(global_itc_path + '/ra/addons/list').then(function (response) {
          //response.data
          var excludedData = [];
          log(response.data);
          angular.forEach(response.data.data, function(value){
              var include = true;
              angular.forEach(value.purpleSoftwareAdamIds, function(value){
                  if (value===adamId) {
                      include = false;
                  }
              });
              if (include) {
                  excludedData.push(value);
              }
          });
          log("IAP DATA SERVICE (EXCLUSION) RESPONSE >>>>");
          log(excludedData);
          return excludedData;
        });
        return promise;
      },
      iapDetails: function(addonAdamId) {
        var promise = $http.get(global_itc_path + '/ra/addon/detail/'+addonAdamId).then(function (response) {
          //log("IAP DETAILS DATA SERVICE RESPONSE >>>>");
          //log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      }
    };
    return myService;
  });

  /*
  USAGE: async(adamId) -> Returns app summary data for app AdamID
  */
  itcApp.factory('appSummaryService',function($http){
    var myService = {
      async: function(adamId) {
        var promise = $http.get(global_itc_path + '/ra/apps/summary/'+adamId).then(function (response) {
          log("APP SUMMARY SERVICE RESPONSE >>>>");
          log(response.data);
          return response.data;
        },function(reason){
          return reason;
        });
        // Return the promise to the controller
        return promise;
      }
    };
    return myService;
  });

  /*
    Usage: Save Version Details - (note to Karen) this is for screenshots and trailer only
  */
  itcApp.service('gameCenterService', function($http){
    var gcService = {
      summary: function(adamId) {
        var promise = $http.get(global_itc_path + '/ra/apps/' + adamId + '/gamecenter').then(function(response) {
          // log("GAME CENTER SUMMARY RESPONSE >>>");
          // log(response.data);
          return response.data;
        },function(reason) {
          return reason;
        });
        // Return the promise to the controller
        return promise
      },
      save: function(adamId, gameCenterDetails) {
        var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/gamecenter', gameCenterDetails)
          .success(function(response) {
            // log("SAVE GAME CENTER RESPONSE >>>>");
            // log(response.data);
            return response.data;
          }).
          error(function(response) {
            // log("SAVE GAME CENTER RESPONSE FAIL >>>>");
            // log(response);
            return response;
          });
        // Return the promise to the controller
        return promise
      },
      deleteTestData: function(adamId) {
        var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/gamecenter/wipeLeaderboards')
          .success(function(response) {
            // log("deleteTestData GAME CENTER RESPONSE >>>>");
            // log(response.data);
            return response.data;
          }).
          error(function(response) {
            // log("deleteTestData GAME CENTER RESPONSE FAIL >>>>");
            // log(response);
            return response;
          });
        // Return the promise to the controller
        return promise
      },
      removeAllDisplaySets: function(adamId) {
        var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/gamecenter/removeAllDisplaySets')
          .success(function(response) {
            // log("removeAllDisplaySets GAME CENTER RESPONSE >>>>");
            // log(response.data);
            return response.data;
          }).
          error(function(response) {
            // log("removeAllDisplaySets GAME CENTER RESPONSE FAIL >>>>");
            // log(response);
            return response;
          });
        // Return the promise to the controller
        return promise
      },
      getMultiplayerCompatibilityList: function(adamId) {
        return $http.get(global_itc_path + '/ra/apps/'+adamId+'/gamecenter/compatibility/candidates',{cache:false}).then(function (response) {
        return response.data;
        }, function(error) { return error; });
      },
      validateVersionInfo: function(adamId, gameCenterDetails) {
        var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/gamecenter/validateVersionInfo', gameCenterDetails)
          .success(function(response) {
            return response.data;
          }).
          error(function(response) {
            return response;
          });
        return promise
      }
    };

    return gcService;
  });

  /*
  USAGE: three functions
  async(adamId) -> Returns app detail data for app AdamID **ONLY APP OVERVIEW**
  versionInfo(adamId,[true/false/null(blank)]) -> return version info if second parameter is not included - version returned will be either inFlightVersion if it exists, or live version if no inFlightVersion exists
  getBuildCandidates -> returns list of available build candidates to attach to an app version
  */
  itcApp.factory('appDetailsService',function($http){
    var myService = {
        async: function(adamId) {
            var promise = $http.get(global_itc_path + '/ra/apps/detail/'+adamId,{cache:false}).then(function (response) {
                // log("APP DETAIL SUMMARY SERVICE RESPONSE >>>>");
                // log(response.data);
                return response.data;
            },function(reason){
                return reason;
            });
            // Return the promise to the controller
            return promise;
        },
        debugInfo: function(adamId) {
            var promise = $http.get(global_itc_path + '/ra/debug/apps/'+adamId+'/qainfo',{cache:false}).then(function (response) {
                return response.data;
            },function(reason){
                return reason;
            });
            // Return the promise to the controller
            return promise;
        },
        versionInfo: function(adamId,isLive) {
            var requestLive = "";
            if (isLive !== undefined && isLive) {
                requestLive = "?v=live";
            }
            var promise = $http.get(global_itc_path + '/ra/apps/version/'+adamId+requestLive,{cache:false}).then(function (response) {
                    // log("APP VERSION INFO SERVICE RESPONSE >>>>");
                    // log(response.data);
                    return response.data;
                },function(reason){
                    return reason;
            });
            // Return the promise to the controller
            return promise;
        },
        getBuildCandidates: function(adamId,versionId) {
            var promise = $http.get(global_itc_path + '/ra/apps/' + adamId + '/versions/' + versionId + '/candidateBuilds').then(function(response) {
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        },
        getBundlesForAppList: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/'+adamId+'/appbundles',{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        getStoreFrontLangs: function() {
          return $http.get(global_itc_path + '/ra/apps/storePreview/regionCountryLanguage',{cache:false}).then(function (response) {
          return response.data;
          }, function(error) { return error; });
        }
    };
    return myService;
  });

  /*
  USAGE: async(adamId) -> Returns addon details addon AdamID
  */
  itcApp.factory('iapDetailService',function($http){
    var myService = {
      async: function(adamId) {
        var promise = $http.get(global_itc_path + '/ra/addon/detail/'+adamId).then(function (response) {
          log("IAP DETAIL SERVICE RESPONSE >>>>");
          log(response.data);
          return response.data;
        });
        // Return the promise to the controller
        return promise;
      }
    };
    return myService;
  });

  /*
  USAGE: async() -> Returns app trailer reference data
   */
  itcApp.factory('appVersionReferenceDataService', function($http) {
    var myService = {
      async: function() {
        var promise = $http.get(global_itc_path + '/ra/apps/version/ref').then(function (response) {
          // log("APP VERSION REFERENCE DATA SERVICE RESPONSE >>>>");
          // log(response.data);
          return response.data;
        },function(reason){
          return reason;
        });
        // Return the promise to the controller
        return promise;
      }
    };
    return myService;
  });

  /*
    Usage: Save Version Details - (note to Karen) this is for screenshots and trailer only
  */
  itcApp.service('saveVersionDetailsService',function($http){
    var myService = {
      async: function(adamId, versionDetails) {
        var promise = $http.post(global_itc_path + '/ra/apps/version/details/save/' + adamId, versionDetails).then(function(response) {
          log("SAVE VERSION DETAILS SERVICE RESPONSE >>>>");
          log(response.data);
          return response.data;
        },function(reason) {
          return reason;
        });
        // Return the promise to the controller
        return promise
      }
    };
	    return myService;
	  });

    /*
      Usage: Save Version - and submit for review
    */
    itcApp.service('saveVersionService',function($http){
      var myService = {
        async: function(adamId, versionDetails,isLive) {
          var requestLive = "";
          if (isLive !== undefined && isLive) {
              requestLive = "?v=live";
          }
          var promise = $http.post(global_itc_path + '/ra/apps/version/save/' + adamId+requestLive, versionDetails).then(function(response) {
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise
        },
        submitForReview: function(adamId,versionDetails) {
          var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/version/submit/start', versionDetails).then(function(response) {
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise;
        },
        finalizeSubmitForReview: function(adamId,versionId,versionDetails) {
          var promise = $http.post(global_itc_path + '/ra/apps/' + adamId + '/versions/' + versionId + '/submit/complete', versionDetails).then(function(response) {
            return response.data;
          },function(reason) {
            return reason;
          });
          // Return the promise to the controller
          return promise;
        },
        releaseVer:function(adamId) { //deprecating....
          var promise = $http.post(global_itc_path + '/ra/apps/'+adamId+'/releaseToStore',adamId).then(function(response) {
            return response.data;
          });
          return promise;
        },
        releaseVerToStore:function(adamId,versionid) {
          var promise = $http.post(global_itc_path + '/ra/apps/'+adamId+'/versions/'+versionid+'/releaseToStore',adamId).then(function(response) {
            return response.data;
          });
          return promise;
        }
    };
      return myService;
    });


  /*
  USAGE: async() -> Returns manage apps summary data
  */
  itcApp.factory('loadManageAppsDataService', function($http, TimingMarker){
    var manageAppsService = {
      async: function() {
        var promise = $http.get(global_itc_path + '/ra/apps/manageyourapps/summary').
          success(function (data, status, headers, config) {
            log(">>> loadManageAppsDataService: ", data);
            return data;
          }).
          error(function (data, status, headers, config) {
            return data;
          });
        return promise;
      },

      summaryV2: function() {
        // For Services need to Start and end them
        TimingMarker.marker.start("service.loadManageAppsDataService.summaryV2");
        var promise = $http.get(global_itc_path + '/ra/apps/manageyourapps/summary/v2').
          success(function (data, status, headers, config) {
            // log(">>> loadManageAppsDataService (v2): ", data);
            TimingMarker.marker.end("service.loadManageAppsDataService.summaryV2");
            return data;
          }).
          error(function (data, status, headers, config) {
            return data;
          });
        return promise;
      }
    };
    return manageAppsService;
  });

  itcApp.service('bundleDataService',function($http){
    var bundleService = {
      approvedAppList: function() {
        var promise = $http.get(global_itc_path + '/ra/apps/approved/list?appType=ios').
          success(function (data, status, headers, config) {
            log(">>> bundleDataService approvedAppList: ", data);
            return data;
          }).
          error(function (data, status, headers, config) {
            return data;
          });
        return promise;
      },

      reference: function(adamIdList) {
        var promise = $http.get(global_itc_path + '/ra/appbundles/metareference', {params: {adamIds: adamIdList }}).
          success(function (data, status, headers, config) {
            log(">>> bundleDataService reference: ", data);
            return data;
          }).
          error(function (data, status, headers, config) {
            return data;
          });
        return promise;
      },

      create: function(bundleData) {
        var promise = $http.post(global_itc_path + '/ra/appbundles/createOrUpdate', bundleData).then(function(response) {
          // log('posting to /ra/appbundles/createOrUpdate:', bundleData);
          // log(JSON.stringify(bundleData))
          log(">>> bundleDataService create: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      },
      submit: function(bundleAdamId) {
        var promise = $http.post(global_itc_path + '/ra/appbundles/submit/' + bundleAdamId).then(function(response) {
          log(">>> bundleDataService submit: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      },
      remove: function(bundleAdamId) {
        var promise = $http.post(global_itc_path + '/ra/appbundles/devreject/' + bundleAdamId).then(function(response) {
          log(">>> bundleDataService devreject: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      },
      detail: function(bundleAdamId) {
        var promise = $http.get(global_itc_path + '/ra/appbundles/metadetail/' + bundleAdamId).then(function(response) {
          log(">>> bundleDataService detail: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      },
      icon: function(bundleAdamId) {
        var promise = $http.get(global_itc_path + '/ra/appbundles/icon/' + bundleAdamId).then(function(response) {
          log(">>> bundleDataService icon: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      },
      pricing: function(selectedPriceTier) {
        var promise = $http.get(global_itc_path + '/ra/appbundles/pricetier/' + selectedPriceTier).then(function(response) {
          log(">>> bundleDataService pricing: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      },
      contentStatus: function(bundleAdamId) {
        var promise = $http.get(global_itc_path + '/ra/appbundles/status/' + bundleAdamId).then(function(response) {
          log(">>> bundleDataService contentStatus: ", response);
          return response;
        },function(reason) {
          return reason;
        });
        return promise
      }
    };
    return bundleService;
  });

  itcApp.factory('manageAppsStateService', ['$rootScope', function ($rootScope) {

    var service = {

      selectedType: 'All Types',
      selectedStatus: 'all',

      SaveState: function () {
        sessionStorage.manageAppsStateService.type = service.selectedType;
        sessionStorage.manageAppsStateService.status = service.selectedStatus;
      },

      RestoreState: function () {
        service.selectedType = sessionStorage.manageAppsStateService.type;
        service.selectedStatus = sessionStorage.manageAppsStateService.status;
      }

    };

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;
  }]);

itcApp.factory('newsstandServices',function($http){
    var myService = {
        getNewsstandInfo: function(adamId) {
            return $http.get(global_itc_path + '/ra/apps/'+adamId+'/newsstand',{cache:false}).then(function (response) {
                return response.data;
            }, function(error) { return error; });
        },
        updateAtomFeed: function(adamId,atomfeedinfo) {
            return $http.post(global_itc_path + '/ra/apps/'+adamId+'/newsstand/atomfeed/update',atomfeedinfo).then(function (response) {
                return response.data;
            }, function(error) { return error; });
        },
        addUpdateIssue: function(adamId,issueinfo) {
            return $http.post(global_itc_path + '/ra/apps/'+adamId+'/newsstand/issue/update',issueinfo).then(function (response) {
                return response.data;
            }, function(error) { return error; });
        }
    };
    return myService;
});

itcApp.factory('iapServices',function($http, TimingMarker){
    var myService = {
        getAppIapList: function(adamId, params) {
            return $http.get(global_itc_path + '/ra/apps/'+adamId+'/iaps',{cache:false, params: params}).then(function (response) {
                return response.data;
            }, function(error) { return error; });
        },
        submitAppIapsForReview: function(appAdamId, iaplist) {
            return $http.post(global_itc_path + '/ra/apps/'+appAdamId+'/iaps/submission',iaplist).success(function(data, status, headers, config) {
              return headers();
          }).error(function(data, status) {
              return status;
          });
        },
        deleteAppAddon: function(adamId, iapAdamId) {
            return $http.delete(global_itc_path + '/ra/apps/' + adamId + '/iaps/'+iapAdamId).then(function (response) {
                return response.data;
            }, function(error) { return error; });
        },
        generateSharedSecret: function() {
          TimingMarker.marker.start("service.iapServices.generateSharedSecret");
          return $http.post(global_itc_path + '/ra/addons/sharedSecret/').then(function (response) {
              TimingMarker.marker.end("service.iapServices.generateSharedSecret");
              return response.data;
          }, function(error) { return error; });
        },
        getSharedSecret: function() {
          TimingMarker.marker.start("service.iapServices.getSharedSecret");
          return $http.get(global_itc_path + '/ra/addons/sharedSecret/',{cache:false}).then(function (response) {
              TimingMarker.marker.end("service.iapServices.getSharedSecret");
              return response.data;
          }, function(error) { return error; });
        },
        iapRefData: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/ref',{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        iapRefDataSource: {data: {} },
        createIapStart: function(adamId,iapType) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/' + iapType +'/template',{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        getIapDetails: function(adamId,iapAdamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/' + iapAdamId,{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        getPricingTiers: function(adamId,tier) {
          var tierspecific;
          if (tier === undefined) {
            tierspecific = "";
          } else {
            tierspecific = "?tierStem=" + tier +"&storeOnlyCountries"
          }
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/pricing/matrix' + tierspecific,{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        addonPricingTierSource: {data: {} },
        getRecurringTiers: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/pricing/matrix/recurring',{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        recurringAddonPricingTierSource: {data:{} },
        equalizePrices: function(adamId,iapAdamId,currencyCode,tier,countries) {
          if (countries !== undefined && countries !== "") {
            countries = "?countryCodes="+countries; //should be countries comma seperated ie. USA,BEL
          } else {
            countries = "";
          }
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/' + iapAdamId + '/pricing/equalize/' + currencyCode + '/' + tier + countries,{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        createNewAddon: function(adamId,iapdata) {
          return $http.post(global_itc_path + '/ra/apps/' + adamId + '/iaps',iapdata).success(function(data, status, headers, config) {
              return headers();
          }).error(function(data, status) {
              return status;
          });
        },
        updateAddon: function(adamId,iapAdamId,iapdata) {
          return $http.put(global_itc_path + '/ra/apps/' + adamId + '/iaps/' + iapAdamId,iapdata).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        submitAddonForReview: function(adamId,iapAdamId) {
            return $http.post(global_itc_path + '/ra/apps/' + adamId + '/iaps/' + iapAdamId + '/submission').success(function(data, status, headers, config) {
              return headers();
          }).error(function(data, status) {
              return status;
          });
        },
        getFamilyList: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/families',{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        getFamilyTemplate: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/family/template',{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        createFamily: function(adamId,familydata) {
          return $http.post(global_itc_path + '/ra/apps/' + adamId + '/iaps/family/',familydata).success(function(data, status, headers, config) {
              return headers();
          }).error(function(data, status) {
              return status;
          });
        },
        getFamilyDetails: function(adamId,familyId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/family/' + familyId,{cache:false}).then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },
        updateFamilyDetails: function(adamId,familyId,familydata) {
          return $http.put(global_itc_path + '/ra/apps/' + adamId + '/iaps/family/' + familyId,familydata).success(function(data, status, headers, config) {
              return headers();
          }).error(function(data, status) {
              return status;
          });
          /*return $http.put(global_itc_path + '/ra/apps/' + adamId + '/iaps/family/' + familyId,familydata).then(function (response) {
            return response.data;
          }, function(error) { return error; });*/
        },
        /*getAppReviewNotes: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/appReviewNotes').then(function (response) {
            return response.data;
          }, function(error) { return error; });
        },*/
        getIAPSubmissionStatus: function(adamId) {
          return $http.get(global_itc_path + '/ra/apps/' + adamId + '/iaps/submissionStatus').then(function (response) {
            return response.data;
          }, function(error) { return error; });
        }
    };
    return myService;
});

    itcApp.factory( 'promoCodeService', function( $http, $q ) {
        return {
            // GET: Returns eligible versions (for the "Generate Codes" tab)
            getVersions: function( adamId ) {
                return $http.get( base + '/apps/' +adamId +'/promocodes/versions' )
                .then(
                    function( response ) { return response.data },
                    function( error )    { return error }
                )
            },
            // GET: Returns a list of previous promo code requests (for the "History" tab)
            getHistory: function( adamId ) {
                return $http.get( base + '/apps/' +adamId +'/promocodes/history' )
                .then(
                    function( response ) { return response.data },
                    function( error )    { return error }
                )
            },
            // GET: Returns a list of previous promo code requests (for the "History" tab)
            getIAPHistory: function( adamId ) {
               return $http.get( base + '/apps/' +adamId +'/promocodes/iap/history' )
                   .then(
                      function( response ) { return response.data },
                      function( error )    { return error }
                  )
            },
            // POST: Attempt to generate new promo codes for iaps
            // promoCodeRequest schema
            //  [
            //      {
            //          numberofCodes  : <INTEGER>,
            //          adamId : <Long>
            //      },
            //      {
            //          numberofCodes  : <INTEGER>,
            //          adamId : <Long>
            //      },
            //  ]
            requestCodesForApp: function( adamId, promoCodeRequests ) {
              var uri = base + '/apps/'+adamId+'/promocodes/versions/';
              return $http.post( uri, promoCodeRequests )
                  .then(
                      function( response ) { return response.data },
                      function( error )    { return error }
                  )
            },
            // POST: Attempt to generate new promo codes for versions for an app
            // promoCodeRequest schema
            //  [
            //      {
            //          numberofCodes  : <INTEGER>,
            //          versionId : <Long>,
            //      },
            //      {
            //          numberofCodes  : <INTEGER>,
            //          versionId : <Long>,
            //      },
            //  ]
            requestCodesForIAP: function( adamId, promoCodeRequests ) {
                var uri = base + '/apps/'+adamId+'/promocodes/iaps';
                return $http.post( uri, promoCodeRequests )
                  .then(
                      function( response ) { return response.data },
                      function( error )    { return error }
                  )
            },

        }
    });

  itcApp.factory('ratingsServices',function($http){
    var myService = {

      loadSummary: function(adamId, myPlatform, myVersion) {
        return $http.get(global_itc_path + '/ra/apps/' + adamId + '/reviews/summary', {cache:false, params: {platform: myPlatform, versionId: myVersion}}).then(function (response) {
          return response.data;
        }, function(error) { return error; });
      },

      loadReviews: function(adamId, myPlatform, myStorefront, myVersion) {
        return $http.get(global_itc_path + '/ra/apps/' + adamId + '/reviews', {cache:false, params: {platform: myPlatform, storefront: myStorefront, versionId: myVersion}}).then(function (response) {
          return response.data;
        }, function(error) { return error; });
      }

    };
    return myService;
  });

});
