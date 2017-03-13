/**
 * Created by Dariusz on 2017-02-21.
 */
const webpush = require('web-push');
const _ = require('lodash');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Promise = require('bluebird');

const config = require('../../config/notifications.json');
var vapidDetails = require('./vapidGenerator')();

function _updateUserSubscription(userId, subscription) {
  return new Promise(function (resolve, reject) {
    var update;
    if (subscription)
      update = {'notificationSubscription': subscription};
    else
      update = {'$unset': {'notificationSubscription': ""}};

    User.findOneAndUpdate({'_id': userId},
      update, {new: true},
      function (err, updatedDoc) {
        if (err) reject(err);

        resolve(updatedDoc);
      })
  });
}
function _notifyUserOnSubscriptionSucced(subscriptionObject) {
  const payload = JSON.stringify({
    title: 'Poprawna subskrypcja!',
    body: "Wygląda jakby działało. Data wysłania: " + new Date().toLocaleString('pl'),
    tag: 'userSub'
  });

  const options = {
    gcmAPIKey: config.fcmApiKey,
    vapidDetails: vapidDetails,
    TTL: 500,
    headers: {}
  };
  webpush.sendNotification(
    subscriptionObject,
    payload,
    options
  );
}

var exports = module.exports = {
  getPublicKey: function (req, res) {
    var publicKey = {publicKey: vapidDetails.publicKey};
    return res.status(200).json(publicKey);
  },
  subscribe: function (req, res) {
    var userId = req.body.userId;
    var subscriptionObject = req.body.subscription;
    _updateUserSubscription(userId, subscriptionObject).then(function (user) {
      if (req.body.notify === true)
        _notifyUserOnSubscriptionSucced(subscriptionObject);
      return res.status(200).end();
    }).catch(function (err) {
      console.error(err);
      res.status(500).json(err);
    });
  }
}
