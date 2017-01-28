'use strict';

describe('Service: resourcePromise', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var resourcePromise;
  beforeEach(inject(function (_resourcePromise_) {
    resourcePromise = _resourcePromise_;
  }));

  it('should do something', function () {
    expect(!!resourcePromise).to.be.true;
  });

});
