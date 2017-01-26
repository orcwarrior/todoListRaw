'use strict';

function taskStorageDBService(api) {
  return {
    create: function (task) {
      return api.task.save(task).$promise; },
    read: function (taskId) {
      return api.task.get({taskId: task._id}).$promise; },
    update: function (task) {
      return api.task.update(task).$promise; },
    delete: function (task) {
      return api.task.delete({taskId: task._id}).$promise; },
    list: function (userId, filters) {
      var filters =_.extend({}, filters, {_userId: userId});
      return api.task.query(filters).$promise;
    }
  }
}

angular.module('todoListApp')
  .service('taskStorageDB', taskStorageDBService);
