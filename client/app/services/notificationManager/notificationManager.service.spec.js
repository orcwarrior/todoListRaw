'use strict';

describe('Service: notificationManager', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var notificationManager;
  beforeEach(inject(function (_notificationManager_) {
    notificationManager = _notificationManager_;
  }));

  it('should do something', function () {
    expect(!!notificationManager).to.be.true;
  });

});
