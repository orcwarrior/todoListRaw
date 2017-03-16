/**
 * Created by Dariusz on 2017-02-18.
 */

var notifyEvt = {};

notifyEvt.push = function (event) {
  console.log('Received a push message', event);
  var data = event.data && event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/images/icons/app-logo-notification-192.png',
      tag: data.tag,
      vibrate: data.vibrate && ['500', '300', '150', '50', '150', '50', '150']
    })
  );
};

notifyEvt.notificationclick = function (event) {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  event.notification.close();

  event.waitUntil(clients.matchAll({type: 'window'})
    .then(function (clientList) {
      for (let client of clientList)
        if (client.url === '/' && 'focus' in client) {
          client.focus();
          break; // Odp. klient znaleziony, przerwanie pętli
        }
    }))
  if (clients.openWindow) {
    return clients.openWindow('/');
  }
}

events.notify = notifyEvt;
