define(['sbl!app'], function (itcApp) {
	itcApp.factory('univPurchaseService',function($http){
	    var myService = {
			appOverviewInfo: function(adamId) {
				return $http.get(global_itc_path + '/ra/apps/'+adamId+'/overview',{cache:false}).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},
			appOverviewInfoDataSource: {data: null },

			appInfo: function(adamId) {
				return $http.get(global_itc_path + '/ra/apps/'+adamId+'/details',{cache:false}).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},
			updateAppInfo: function(adamId,appinfo) {
				return $http.post(global_itc_path + '/ra/apps/'+adamId+'/details',appinfo).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},

			appVersionInfo: function(adamId,platform,version) {
				return $http.get(global_itc_path + '/ra/apps/'+adamId+'/platforms/'+platform+'/versions/'+version,{cache:false}).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},
			updateAppVersionInfo: function(adamId,platform,version,versioninfo) {
				return $http.post(global_itc_path + '/ra/apps/'+adamId+'/platforms/'+platform+'/versions/'+version,versioninfo).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},

			createNewVersion: function(adamId,platform,versionstring) {
				return $http.post(global_itc_path + '/ra/apps/'+adamId+'/platforms/'+platform+'/versions/create/',versionstring).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},
			submitSummary: function(adamId) {
				return $http.get(global_itc_path + '/ra/apps/'+adamId+'/details/submit/summary',{cache:false}).then(function (response) {
				return response.data;
				}, function(error) { return error; });
			},
			submitSummaryDataSource: {data: null },

/*			getBuildList: function(adamId,version) {
				return $http.get(global_itc_path + '/ra/apps/'+adamId+'/version/'+version+'/candidateBuilds',{cache:false}).then(function (response) {
					return response.data;
				}, function(error) { return error; });
			},*/

			submitForReviewStepOne: function(adamId,version) {
				return $http.get(global_itc_path + '/ra/apps/'+adamId+'/versions/'+version+'/submit/summary',{cache:false}).then(function (response) {
					return response.data;
				}, function(error) { return error; });
			},
			getSortList: function() {
				return ['ios','appletvos','appletvtemplate','osx'];
			},
			hasSeenUniversalIntro: function() {
				return $http.post(global_itc_path + '/ra/users/features/universalIntroComplete').then(function (response) {
					return response.data;
				}, function(error) { return error; });
			},
			deletePlatform: function(adamId,platform) {
				return $http.delete(global_itc_path + '/ra/apps/'+adamId+'/'+platform).then(function(response){
					return response;
				}, function(error) { return error; });
			}


	    };
	    return myService;
	 });
});
