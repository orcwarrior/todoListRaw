'use strict';

function apiService($resource) {
 function composeUsersResource() {
    var userResource = $resource('/api/users/:userId',
      {userId: '@_id'});
    delete userResource.prototype.$query; // cannot list user.
    return userResource;
  }
  function composeTasksResource() {
    var taskResource = $resource('/api/tasks/:taskId', {taskId: '@_id'},
    { update: {method: 'PUT'}});
    return taskResource;
  }
  return {
    task: composeTasksResource(),
    user: composeUsersResource()
  }
}

angular.module('todoListApp')
  .service('api', apiService);
