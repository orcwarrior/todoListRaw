'use strict';

angular.module('todoListApp')
  .directive('todoTask', function () {
    return {
      templateUrl: 'app/todoTask/todoTask.html',
      restrict: 'EA',
      scope: {
        task: '=task'
      },
      link: function (scope, element, attrs) {
        scope.toggleTaskDone = function () {
          scope.task.completed = !scope.task.completed;
        };
        scope.taskCallendarDay = function (date) {
          return moment(date).calendar();
        }
        scope.toggleNotification = function () {
          scope.task.notification = !scope.task.notification;
        }
        scope.removeTask = function () {
          if (window.confirm("Czy na pewno chcesz usunąć zadanie: "+scope.task.name+"?")) {
            alert("Zadanie usunięte!");
          }
        }
      }
    };
  });
