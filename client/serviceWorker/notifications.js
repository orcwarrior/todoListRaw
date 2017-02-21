/**
 * Created by Dariusz on 2017-02-18.
 */
//noinspection JSAnnotator
return (function () {
  var notifyEvt = {};

  notifyEvt.push = function (event) {
    console.log('Received a push message', event);

    const title = 'Yay a message.';
    const body = 'We have received a push message.';
    const icon = '/images/icon-192x192.png';
    const tag = 'simple-push-demo-notification-tag';

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon,
        tag: tag
      })
    );
  };

  notifyEvt.notificationclick = function (event) {
    console.log('On notification click: ', event.notification.tag);
    // Android doesn’t close the notification when you click on it
    // See: http://crbug.com/463146
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
      type: 'window'
    }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    }));
  };
  return notifyEvt;
})();
