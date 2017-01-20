'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var TaskCtrlStub = {
  index: 'TaskCtrl.index',
  show: 'TaskCtrl.show',
  create: 'TaskCtrl.create',
  update: 'TaskCtrl.update',
  destroy: 'TaskCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var TaskIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './Task.controller': TaskCtrlStub
});

describe('Task API Router:', function() {

  it('should return an express router instance', function() {
    expect(TaskIndex).to.equal(routerStub);
  });

  describe('GET /api/tasks', function() {

    it('should route to Task.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'TaskCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/tasks/:id', function() {

    it('should route to Task.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'TaskCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/tasks', function() {

    it('should route to Task.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'TaskCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/tasks/:id', function() {

    it('should route to Task.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'TaskCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/tasks/:id', function() {

    it('should route to Task.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'TaskCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/tasks/:id', function() {

    it('should route to Task.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'TaskCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
