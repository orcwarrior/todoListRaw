'use strict';

describe('Service: taskService', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var taskService;
  beforeEach(inject(function (_taskService_) {
    taskService = _taskService_;
  }));

  it('should do something', function () {
    expect(!!taskService).to.be.true;
  });

});
