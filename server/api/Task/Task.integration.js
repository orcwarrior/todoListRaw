'use strict';

var app = require('../..');
import request from 'supertest';

var newTask;

describe('Task API:', function() {

  describe('GET /api/tasks', function() {
    var Tasks;

    beforeEach(function(done) {
      request(app)
        .get('/api/tasks')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Tasks = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(Tasks).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/tasks', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/tasks')
        .send({
          name: 'New Task',
          info: 'This is the brand new Task!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newTask = res.body;
          done();
        });
    });

    it('should respond with the newly created Task', function() {
      expect(newTask.name).to.equal('New Task');
      expect(newTask.info).to.equal('This is the brand new Task!!!');
    });

  });

  describe('GET /api/tasks/:id', function() {
    var Task;

    beforeEach(function(done) {
      request(app)
        .get('/api/tasks/' + newTask._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Task = res.body;
          done();
        });
    });

    afterEach(function() {
      Task = {};
    });

    it('should respond with the requested Task', function() {
      expect(Task.name).to.equal('New Task');
      expect(Task.info).to.equal('This is the brand new Task!!!');
    });

  });

  describe('PUT /api/tasks/:id', function() {
    var updatedTask;

    beforeEach(function(done) {
      request(app)
        .put('/api/tasks/' + newTask._id)
        .send({
          name: 'Updated Task',
          info: 'This is the updated Task!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedTask = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedTask = {};
    });

    it('should respond with the updated Task', function() {
      expect(updatedTask.name).to.equal('Updated Task');
      expect(updatedTask.info).to.equal('This is the updated Task!!!');
    });

  });

  describe('DELETE /api/tasks/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/tasks/' + newTask._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when Task does not exist', function(done) {
      request(app)
        .delete('/api/tasks/' + newTask._id)
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
