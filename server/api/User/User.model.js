'use strict';

import mongoose from 'mongoose';

var UserSchema = new mongoose.Schema({
  name: String,
  tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
  lastSync: Date,
  notificationSubscription: mongoose.Schema.Types.Mixed
});
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.notificationSubscription;
    return ret;
  }
});
export default mongoose.model('User', UserSchema);
