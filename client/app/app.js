'use strict';

angular.module('todoListApp', ['todoListApp.constants', 'ngCookies', 'ngResource', 'ngSanitize',
    'ui.router', 'ui.bootstrap', 'LocalForageModule'
  ])
  .config(function ($localForageProvider) {
    $localForageProvider.config({
      driver      : 'localStorageWrapper',
      name        : 'todo_list',
      storeName   : 'keyvaluepairs',
    });
  })
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(function () {
    moment.locale(navigator.language || navigator.userLanguage);
  });
