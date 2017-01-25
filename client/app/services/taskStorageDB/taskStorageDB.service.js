'use strict';

function taskStorageDBService(api) {
  return {
    create: function (task) {
      return api.task.save(task).$promise; },
    read: function (taskId) {
      return api.task.get({_id: taskId}).$promise; },
    update: function (task) {
      return api.task.update(task).$promise; },
    delete: function (task) {
      return api.task.delete(task).$promise; },
    list: function (userId, filters) {
      return api.task.query(_.extend(filters, {_userId: userId})).$promise; }
  }
}

angular.module('todoListApp')
  .service('taskStorageDB', taskStorageDBService);
