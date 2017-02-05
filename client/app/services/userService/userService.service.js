'use strict';

function userServiceService(localStorageService, api, $q) {
  var fetchedUser;

  function fetchDBUser(localStorageUser) {
    return api.user.get({userId: localStorageUser._id},
      function (dbUser) {
        fetchedUser = dbUser;
        localStorageService.set('user', fetchedUser);
        return fetchedUser;
      }).$promise;
  }
  function createDBUser() {
    return api.user.save({name: 'u' + moment().format()},
      function (createdUser) {
        fetchedUser = createdUser;
        localStorageService.set('user', createdUser);
        return createdUser;
      }).$promise;
  }
  function getLocalStorageUser() {
    return localStorageService.get('user');
  }

  function getUser() {
    if (fetchedUser) return fetchedUser;
    var localStorageUser = getLocalStorageUser();
    if (localStorageUser) {
      fetchedUser = fetchDBUser(localStorageUser);
      return localStorageUser;
    }
    else
      return createDBUser();
  }

  return {
    getUser: function () {
      return $q.when(getUser());
    }
  };
}

angular.module('todoListApp')
  .service('userService', userServiceService);
