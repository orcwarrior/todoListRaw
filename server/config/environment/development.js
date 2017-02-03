'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/todolist-dev'
  },
  port: 443,

  // Seed database on startup
  seedDB: true

};
