'use strict';

function NavbarController(notificationManager, $scope) {
  $scope.menu = [{
    'title': 'Home',
    'state': 'main'
  }];
  $scope.isCollapsed = true;
  var notificationsOn = "/assets/images/icons/app-notifications-on.svg";
  var notificationsOff = "/assets/images/icons/app-notifications-off.svg";
  $scope.notificationsIcon = notificationsOff;


  $scope.toggleNotifications = function () {
    if (notificationManager.notificationsEnabled()) {
      notificationManager.unsubscribe();
    } else {
      notificationManager.subscribe();
    }
  }
  notificationManager.on('notificationManager:stateChange', function (notificationsEnabled) {
    $scope.$apply(function () {
      $scope.notificationsIcon = (notificationsEnabled) ? notificationsOn : notificationsOff;
    })
  });
}

angular.module('todoListApp')
  .controller('NavbarController', NavbarController);
