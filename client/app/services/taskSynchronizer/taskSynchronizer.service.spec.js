'use strict';

describe('Service: taskSynchronizer', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var taskSynchronizer;
  beforeEach(inject(function (_taskSynchronizer_) {
    taskSynchronizer = _taskSynchronizer_;
  }));

  it('should do something', function () {
    expect(!!taskSynchronizer).to.be.true;
  });

});
