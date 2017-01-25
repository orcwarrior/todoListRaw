'use strict';

angular.module('todoListApp')
  .directive('todoTaskForm', function (taskService, userService) {
    return {
      templateUrl: 'components/todoTaskForm/todoTaskForm.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.form = {
          tags: [],
          date: moment().seconds(0).milliseconds(0).toDate()
        };
        scope.addTag = addTag;
        scope.removeTag = removeTag;
        scope.saveTask = saveTask;

        function addTag(tag) {
          if (!tag) return;
          if (!scope.form.tags.indexOf(tag) !== -1)
            scope.form.tags.push(tag);
          scope.newTag = "";
        }

        function removeTag(tagIdx) {
          scope.form.tags.splice(tagIdx, 1);
        }

        function saveTask() {
          userService.getUser()
            .then(function (user) {
              if (!scope.form._userId) scope.form._userId = user._id;
              taskService.create(scope.form);
            });
        }
      }
    };
  });
