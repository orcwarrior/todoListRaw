/**
 * Created by Dariusz on 2017-02-21.
 */
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

function _generateVapidDetails() {
  const vapidKeys = webpush.generateVAPIDKeys();
  var vapidDetails = {
    'subject': 'mailto:orcwarrior@o2.pl',
    'publicKey': vapidKeys.publicKey,
    'privateKey': vapidKeys.privateKey
  };
  var stringVapid = JSON.stringify(vapidDetails);
  // Store vapidDetails in file:
  fs.writeFile(path.resolve(__dirname, 'vapidDetails.json'), stringVapid, function (err) {
    if (err) console.warn(err);
  });
  return vapidDetails;
}

var exports = module.exports = function () {
  var vapidDetails;
  try {
    const vapidFile = require('./vapidDetails.json');
    vapidDetails = vapidFile;
  } catch (e) {
    // No vapid file generated
    vapidDetails = _generateVapidDetails();
  }
  return vapidDetails;
}
exports();
