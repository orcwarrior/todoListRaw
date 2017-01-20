'use strict';

import mongoose from 'mongoose';

var UserSchema = new mongoose.Schema({
  name: String,
  tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
  lastSync: Date
});

export default mongoose.model('User', UserSchema);
