'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var UserCtrlStub = {
  index: 'UserCtrl.index',
  show: 'UserCtrl.show',
  create: 'UserCtrl.create',
  update: 'UserCtrl.update',
  destroy: 'UserCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var UserIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './User.controller': UserCtrlStub
});

describe('User API Router:', function() {

  it('should return an express router instance', function() {
    expect(UserIndex).to.equal(routerStub);
  });

  describe('GET /api/users', function() {

    it('should route to User.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'UserCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/users/:id', function() {

    it('should route to User.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'UserCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/users', function() {

    it('should route to User.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'UserCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/users/:id', function() {

    it('should route to User.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'UserCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/users/:id', function() {

    it('should route to User.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'UserCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/users/:id', function() {

    it('should route to User.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'UserCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
