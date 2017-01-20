'use strict';

describe('Service: taskStorageLocal', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var taskStorageLocal;
  beforeEach(inject(function (_taskStorageLocal_) {
    taskStorageLocal = _taskStorageLocal_;
  }));

  it('should do something', function () {
    expect(!!taskStorageLocal).to.be.true;
  });

});
