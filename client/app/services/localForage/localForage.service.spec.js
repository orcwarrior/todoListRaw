'use strict';

describe('Service: localForage', function () {

  // load the service's module
  beforeEach(module('todoListApp'));

  // instantiate service
  var localForage;
  beforeEach(inject(function (_localForage_) {
    localForage = _localForage_;
  }));

  it('should do something', function () {
    expect(!!localForage).to.be.true;
  });

});
