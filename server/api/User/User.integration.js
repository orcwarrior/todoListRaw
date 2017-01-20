'use strict';

var app = require('../..');
import request from 'supertest';

var newUser;

describe('User API:', function() {

  describe('GET /api/users', function() {
    var Users;

    beforeEach(function(done) {
      request(app)
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Users = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(Users).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/users', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/users')
        .send({
          name: 'New User',
          info: 'This is the brand new User!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newUser = res.body;
          done();
        });
    });

    it('should respond with the newly created User', function() {
      expect(newUser.name).to.equal('New User');
      expect(newUser.info).to.equal('This is the brand new User!!!');
    });

  });

  describe('GET /api/users/:id', function() {
    var User;

    beforeEach(function(done) {
      request(app)
        .get('/api/users/' + newUser._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          User = res.body;
          done();
        });
    });

    afterEach(function() {
      User = {};
    });

    it('should respond with the requested User', function() {
      expect(User.name).to.equal('New User');
      expect(User.info).to.equal('This is the brand new User!!!');
    });

  });

  describe('PUT /api/users/:id', function() {
    var updatedUser;

    beforeEach(function(done) {
      request(app)
        .put('/api/users/' + newUser._id)
        .send({
          name: 'Updated User',
          info: 'This is the updated User!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedUser = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedUser = {};
    });

    it('should respond with the updated User', function() {
      expect(updatedUser.name).to.equal('Updated User');
      expect(updatedUser.info).to.equal('This is the updated User!!!');
    });

  });

  describe('DELETE /api/users/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/users/' + newUser._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when User does not exist', function(done) {
      request(app)
        .delete('/api/users/' + newUser._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
