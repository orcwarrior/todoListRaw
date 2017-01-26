'use strict';

function userServiceService(localStorageService, api, $q) {
  var user;
  function getUser() {
    if (user) return user;
    var localStorageUser = localStorageService.get('user');
    if (localStorageUser) {
      user = api.user.get({userId: localStorageUser._id},
        function (dbUser) {
          user = dbUser;
          localStorageService.set('user', dbUser);
          return dbUser;
        });
      return localStorageUser;
    }
    else
      return api.user.save({name: 'u' + moment().format()},
        function (createdUser) {
          user = createdUser;
          localStorageService.set('user', createdUser);
          return createdUser;
        });
  }
  return {
    getUser: function () {
      var placeholderPromise = $q.when(getUser())
        .then(function (user) {
          placeholderPromise = _.extend(placeholderPromise, user);
          return user;
        });
      return placeholderPromise;
    }
  };
}

angular.module('todoListApp')
  .service('userService', userServiceService);
