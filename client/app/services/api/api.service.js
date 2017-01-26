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
  function composePingResource() {
    var pingResource = $resource('/api/ping');
    delete pingResource.prototype.$query; // cannot list user.
    delete pingResource.prototype.$save; // cannot list user.
    delete pingResource.prototype.$delete; // cannot list user.
    delete pingResource.prototype.$remove; // cannot list user.
    return pingResource;
  }
  return {
    task: composeTasksResource(),
    user: composeUsersResource(),
    ping: composePingResource()
  }
}

angular.module('todoListApp')
  .service('api', apiService);
