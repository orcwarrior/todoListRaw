'use strict';

describe('Directive: todoTask', function () {

  // load the directive's module and view
  beforeEach(module('todoListApp'));
  beforeEach(module('app/todoTask/todoTask.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<todo-task></todo-task>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the todoTask directive');
  }));
});
