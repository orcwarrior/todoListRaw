'use strict';

angular.module('todoListApp')
  .config(function($stateProvider) {
    $stateProvider.state('main', {
      url: '/',
      templateUrl: 'app/main/main.html'
    });
  });
