'use strict';

function userServiceService($localForage, api, $q) {
  var fetchedUser;

  function fetchDBUser(userLocal) {
    return api.user.get({userId: userLocal._id},
      function (dbUser) {
        fetchedUser = dbUser;
        $localForage.setItem('user', dbUser);
        return fetchedUser;
      }).$promise;
  }
  function createDBUser() {
    return api.user.save({name: 'u' + moment().format()},
      function (createdUser) {
        fetchedUser = createdUser;
        $localForage.setItem('user', createdUser);
        return createdUser;
      }).$promise;
  }

  function getUser() {
    if (fetchedUser) return fetchedUser;
    return $localForage.getItem('user').then(function (userLocal) {
      if (userLocal) {
        fetchedUser = fetchDBUser(userLocal);
        return userLocal;//
      }
      else
        return createDBUser();
    })
  }

  return {
    getUser: function () {
      return $q.when(getUser());
    }
  };
}

angular.module('todoListApp')
  .service('userService', userServiceService);
