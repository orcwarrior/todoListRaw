'use strict';

angular.module('todoListApp')
  .directive('todoTask', function (taskService) {
    return {
      templateUrl: 'app/todoTask/todoTask.html',
      restrict: 'EA',
      scope: {
        task: '=task'
      },
      link: function (scope, element, attrs) {
        scope.isUnsyncTask = function () {
          return scope.task._unsyncAction;
        }
        scope.toggleTaskDone = function () {
          scope.task.completed = !scope.task.completed;
          updateTask();
        };
        scope.taskCallendarDay = function (date) {
          return moment(date).calendar();
        }
        scope.toggleNotification = function () {
          scope.task.notification = !scope.task.notification;
          updateTask();
        }
        scope.removeTask = function () {
          if (window.confirm("Czy na pewno chcesz usunąć zadanie: "+scope.task.name+"?")) {
            taskService.delete(scope.task);
            alert("Zadanie usunięte!");
          }
        }
        function updateTask() {
          taskService.update(scope.task);

        }
      }
    };
  });
