'use strict';

function notificationManagerService(userService) {
  // vars
  var notifactionsEnabled; // Change only whith _setNotifications!
  var vapidPublicKey;

  function init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
          console.log('Notifications aren\'t supported.');
          return Promise.reject();
        }
        if (Notification.permission === 'denied') {
          console.log('The user has blocked notifications.');
          return Promise.reject();
        }
        if (!('PushManager' in window)) {
          console.log('Push messaging isn\'t supported.');
          return Promise.reject();
        }

        // Czy użytkownik ma już subskrypcje dla powiadomień:
        return serviceWorkerRegistration.pushManager.getSubscription();
      }).then(function (subscription) {
        if (!subscription) return _setNotifications(false);

        // Wyślij najnowszą subskrypcję dla zachowania aktualności:
        _sendSubscriptionToServer(subscription);
        _setNotifications(true);
      }).catch(function (err) {
        console.log('Error during getSubscription()', err);
      });
    }
  }  init();

// public
  var evtEmitter = new EventEmitter();
  var manager = _.extend(evtEmitter, {
    unsubscribe: function () {
      return navigator.serviceWorker.ready.then(function (swRegistration) {
        return swRegistration.pushManager.getSubscription();
      }).then(function (pushSubscription) {
        // Check we have a subscription to unsubscribe
        if (!pushSubscription) {
          _setNotifications(false);
          return Promise.resolve();
        }
        return pushSubscription.unsubscribe();
      }).then(function () {
        _setNotifications(false);
        return _sendUnsubscribeToServer();
      }).catch(function (e) {
        console.log('Error thrown while unsubscribing from ' +
          'push messaging.', e);
      });
    },
    subscribe: function () {
      var swRegistration;
      return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        swRegistration = serviceWorkerRegistration;
        return _getServerPublicKey();
      }).then(function (vapid) {
        return swRegistration.pushManager
          .subscribe({userVisibleOnly: true, applicationServerKey: vapid.convertedVapidKey});
      }).then(function (subscription) {
        _setNotifications(true);
        return _sendSubscriptionToServer(subscription, true);
      }).catch(function (e) {
        if (Notification.permission === 'denied') {
          console.log('Permission for Notifications was denied');
        } else {
          console.log('Unable to subscribe to push.', e);
        }
      });
    },
    notificationsEnabled: function () { return notifactionsEnabled; }
  });
  return manager;

// private
  function _setNotifications(state) {
    notifactionsEnabled = state;
    evtEmitter.emit('notificationManager:stateChange', state);
  }
  function _getServerPublicKey() {
    // VAPID key already fetched
    if (vapidPublicKey) return new Promise.resolve(vapidPublicKey);

    var fetchConfig = { headers: new Headers({
        'Content-Type': 'application/json'
      }), method: 'GET'
    };
    return fetch('/api/notifications/publicKey', fetchConfig).then(function (response) {
      if (response.ok)
        return response.json().then(function (bodyJson) {
          // https://github.com/web-push-libs/web-push#using-vapid-key-for-applicationserverkey
          bodyJson.convertedVapidKey = _urlBase64ToUint8Array(bodyJson.publicKey);
          vapidPublicKey = bodyJson;
          return bodyJson;
        })
    }).catch(function (err) {
      return console.warn("Notifaction config fetch err: " + err);
    })
  }

  function _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  function _sendSubscriptionToServer(subscription, showNotification) {
    return new Promise(function (resolve) {
      console.log('Sending subscription to server: ', subscription);
      return userService.getUser().then(function (user) {
        // DK: subscription is read only !!!
        var extendedPayload = {notify: showNotification, userId: user._id, subscription: subscription};
        var payloadStr = JSON.stringify(extendedPayload);
        var registerConfig = {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
          body: payloadStr
        };
        return fetch('/api/notifications/subscribe', registerConfig);
      })
    })
  }
  function _sendUnsubscribeToServer() {
    return _sendSubscriptionToServer(undefined, false);
  }
}
  angular.module('todoListApp')
    .service('notificationManager', notificationManagerService);
