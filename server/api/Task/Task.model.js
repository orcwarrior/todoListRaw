'use strict';

import mongoose from 'mongoose';

var TaskSchema = new mongoose.Schema({
  _userId: {type: mongoose.Schema.ObjectId, ref: 'User'},
  name: String,
  description: String,
  date: {type: Date, default: Date.now, index: true},
  completed: {type: Boolean, default: false},
  tags: [String],
  notification: Boolean,
  notified: Boolean,
  deadlineTimeLocalized: String
});

import User from '../User/User.model'
TaskSchema.post('save', function (doc) {
  if (!doc._userId)
    return console.error("Saved task has no userId!");
  else
    User.findOneAndUpdate({'_id': doc._userId},
      {$addToSet: {tasks: doc._id}}, {new: true},
      function (err, updatedDoc) {
        if (err) console.err(err);
        console.log("Added task %s for an user %s", doc._id, doc._userId);
      })
});
TaskSchema.post('remove', function (doc) {
  if (!doc._userId)
    return console.error("Saved task has no userId!");
  else
    User.findOneAndUpdate({'_id': doc._userId},
      {$pull: {tasks: doc._id}}, {new: true},
      function (err, updatedDoc) {
        if (err) console.err(err);
        console.log("Removed task %s for an user %s", doc._id, doc._userId);
      })
});

export default mongoose.model('Task', TaskSchema);
