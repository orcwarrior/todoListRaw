'use strict';

describe('Service: taskStorageDB', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var taskStorageDB;
  beforeEach(inject(function (_taskStorageDB_) {
    taskStorageDB = _taskStorageDB_;
  }));

  it('should do something', function () {
    expect(!!taskStorageDB).to.be.true;
  });

});
