'use strict';

describe('Directive: todoTaskForm', function () {

  // load the directive's module and view
  beforeEach(module('todoListApp'));
  beforeEach(module('components/todoTaskForm/todoTaskForm.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<todo-task-form></todo-task-form>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the todoTaskForm directive');
  }));
});
