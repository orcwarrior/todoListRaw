'use strict';

describe('Service: taskUnsyncStorageLocal', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var taskUnsyncStorageLocal;
  beforeEach(inject(function (_taskUnsyncStorageLocal_) {
    taskUnsyncStorageLocal = _taskUnsyncStorageLocal_;
  }));

  it('should do something', function () {
    expect(!!taskUnsyncStorageLocal).to.be.true;
  });

});
