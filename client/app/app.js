'use strict';

angular.module('todoListApp', ['todoListApp.constants', 'ngCookies', 'ngResource', 'ngSanitize',
    'ui.router', 'ui.bootstrap', 'LocalStorageModule'
  ])
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('todoApp');
  })
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('todoApp');
  })
  .run(function () {
    moment.locale(navigator.language || navigator.userLanguage);
  });
