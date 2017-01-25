'use strict';

describe('Service: promiseFromValue', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var promiseFromValue;
  beforeEach(inject(function (_promiseFromValue_) {
    promiseFromValue = _promiseFromValue_;
  }));

  it('should do something', function () {
    expect(!!promiseFromValue).to.be.true;
  });

});
