'use strict';

angular.module('todoListApp')
  .directive('todoTaskForm', function (taskService) {
    return {
      templateUrl: 'components/todoTaskForm/todoTaskForm.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.form = {
          tags: [],
          date: moment().add(1, 'hour').startOf('hour').toDate()
        };
        scope.addTag = addTag;
        scope.removeTag = removeTag;
        scope.saveTask = saveTask;

        function addTag(event, tag) {
          if (!tag) return;
          if (!scope.form.tags.indexOf(tag) !== -1)
            scope.form.tags.push(tag);
          scope.newTag = "";
          event.preventDefault();
        }
        function removeTag(tagIdx) {
          scope.form.tags.splice(tagIdx, 1);
        }
        function saveTask() {
          taskService.create(scope.form);
        }
      }
    };
  });
