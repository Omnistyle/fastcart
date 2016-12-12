'use strict';

define([global_itc_path+'/wa/LCHomePage/serverInit'], function (serverInit) {

    var angularRequires = [
        'ui.router',
        'routeResolverServices',
        'angularFileUpload',
        'ai-imageservice',
        'global_services',
        'global_directives',
        'global_filters',
        'form_elements',
        'ngAnimate',
        'ngResource',
        'ngCookies',
        'ngSanitize',
        'pasvaz.bindonce',
        'ui.sortable',
        'angular.filter',
        'infinite-scroll',
        'its-footer-nav',
        'itc-app-switcher',
        'its-top-nav',
        'its-angular-logger',
        'itc-timings'
    ];

    serverInit.initAngularRequires(angularRequires);

    window.itcApp = angular.module('itcApp', angularRequires);

    itcApp.config([
        '$stateProvider', '$urlRouterProvider','routeResolverProvider',
         '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$httpProvider','$locationProvider','$cookiesProvider', '$sceDelegateProvider',
        function ($stateProvider, $urlRouterProvider,routeResolverProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider,$locationProvider,$cookiesProvider, $sceDelegateProvider) {

            $httpProvider.interceptors.push('authHttpResponseInterceptor');

            $locationProvider.html5Mode({
              enabled: true,
              requireBase: false
            });

            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'https://itc.mzstatic.com/itc/**'
                // 'blob:*'
            ]);

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

            var route = routeResolverProvider;

            itcApp.register =
            {
                controller: $controllerProvider.register,
                directive:  $compileProvider.directive,
                filter:     $filterProvider.register,
                factory:    $provide.factory,
                service:    $provide.service,
                constant:   $provide.constant
            };

            //redirects...
            $urlRouterProvider.when('/app/:adamId/prerelease', '/app/:adamId/pre/builds');

            serverInit.initUrlRouterProvider($urlRouterProvider);
            $urlRouterProvider.otherwise("/");

            serverInit.initStateProvider($stateProvider, route);
        }
    ]);

    itcApp.factory('authHttpResponseInterceptor',['$q','$injector', function($q, $injector){
        return {
            response: function(response) {
                return response || $q.when(response);
            },
            responseError: function(rejection) {
                // ignore 401s when requesting the session because in that case we're in the midst of checking session already
                if (!rejection.config || !rejection.config.url || !rejection.config.url.match(/\/v1\/session$/) ) {
                    // can't inject state normally because of circular references; if this causes problems with unit tests we may need to revisit
                    /*var $state = $injector.get('$state');
                    if ($state.$current.data && $state.$current.data.authenticated) {
                        $state.go('login');
                    }*/
                    if(rejection.status === 401) {
                        window.location = global_itc_path;
                    } else if(rejection.status === 403) {
                        window.location = global_itc_path;
                    } else if (rejection.status === 404) {
                        window.location = global_itc_path + "/wa/defaultError";
                    }
                }
                return $q.reject(rejection);



            }
        }
    }]);


    // Configure our JavaScript error logger.
    itcApp.run([ 'its-angular-logger.defaultConfig', function( logger ) {
        logger.enabled = true;
        serverInit.initLogger(logger);
        logger.loggingEndpoint = global_itc_path + '/ra/ui/log';
    }]);

    itcApp.run(['$resource','TimingMarker', function($resource,TimingMarker) {
       TimingMarker.setUrl(global_itc_path + '/ra/ui/stats');

       // To Disable
       //TimingMarker.marker.send = function(onComplete){
       // onComplete(this.timed_marks);
       // this.timed_marks = [];
       //};

       // To Enable
        TimingMarker.sendPerformanceTiming();
    }]);

    return itcApp;
});
