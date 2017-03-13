/**
 * Created by Dariusz on 2017-02-23.
 */
var CronJob = require('cron').CronJob;
const moment = require('moment');
const webpush = require('web-push');
const _ = require('lodash');
const mongoose = require('mongoose');
const Task = mongoose.model('Task');
const User = mongoose.model('User');

const config = require('../../config/notifications.json');
var vapidDetails = require('./vapidGenerator')();

var job = new CronJob('1 * * * * *', function () {
  // Every minute:
  console.log('Runing tasks notification cron: ');
  var dateInHour = moment().add(1, 'hour');
  var dateRange = {start: moment().toDate(), end: dateInHour.toDate()};

  Task.find({
    date: {$gte: dateRange.start, $lte: dateRange.end},
    notification: true, completed: {$ne: true}, notified: {$ne: true}
  }).populate('_userId')
    .exec(function (err, tasks) {
      if (err) throw new Error(err);
      console.log("Cron gathered tasks: " + tasks.length);
      _.each(tasks, sendTaskNotification)
    })
});
job.start();

function sendTaskNotification(task) {
  var userId = task._userId._id;
  var subscriptionObject = task._userId.notificationSubscription;
  if (!subscriptionObject)
    return console.warn('User not subscribed, quitting notification...');
  const payload = JSON.stringify({
    title: task.name,
    body: "Pozostało niewiele czasu (" + task.deadlineTimeLocalized + ") na wykonanie zadania!",
    tag: task._userId._id + ".task",
    vibrate: true
  });

  const options = {
    gcmAPIKey: config.fcmApiKey,
    vapidDetails: vapidDetails,
    TTL: 3600,
    headers: {}
  };

  webpush.sendNotification(
    subscriptionObject,
    payload,
    options
  ).then(function notifySuccess() {
    task.notified = true;
    task.save();
  }).catch(function (err) {
    console.warn(err)
  })
}
