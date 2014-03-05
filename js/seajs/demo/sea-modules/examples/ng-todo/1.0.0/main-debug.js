define("examples/ng-todo/1.0.0/main-debug", [ "angularjs-debug", "./common-debug", "./service-debug", "store-debug" ], function(require) {
    var angular = require("angularjs-debug");
    var common = require("./common-debug");
    var todoService = require("./service-debug");
    var todo = angular.module("TodoApp", []);
    todo.service("todoService", todoService);
    //TDDO Angular master code has been implemented
    todo.directive("ngBlur", function() {
        return function(scope, elem, attrs) {
            elem.bind("blur", function() {
                scope.$apply(attrs.ngBlur);
            });
        };
    });
    todo.controller("MainCtrl", [ "$scope", "todoService", function($scope, todoService) {
        $scope.todoService = todoService;
        $scope.title = "todo";
        $scope.todos = todoService.getTodos();
        $scope.newTodo = "";
        $scope.activeFilter = {
            completed: ""
        };
        $scope.remaining = 0;
        $scope.hidden = false;
        $scope.toggleAll = function(e) {
            this.hidden = !this.hidden;
        };
        $scope.createOnEnter = function(e) {
            if (e.which !== common.ENTER_KEY || !this.newTodo.trim()) {
                return;
            }
            this.todoService.addTodo(this.newTodo);
            this.newTodo = "";
        };
        $scope.$watch("todos", function() {
            var remaining = 0;
            $scope.todos.forEach(function(todo) {
                if (!todo.completed) {
                    remaining++;
                }
            });
            $scope.remaining = remaining;
            $scope.completed = $scope.todos.length - remaining;
            $scope.todoService.store();
        }, true);
        $scope.filter = function(val) {
            this.activeFilter.completed = val;
        };
        $scope.selected = function(val) {
            return val === $scope.activeFilter.completed;
        };
        $scope.getTodos = function() {
            return todoService.getTodos(this.activeFilter);
        };
        $scope.edit = function(todo, event) {
            todo.edit = true;
            // TODO ?
            setTimeout(function() {
                angular.element(event.target).parent().next()[0].focus();
            }, 0);
        };
        $scope.close = function(todo) {
            todo.edit = false;
        };
    } ]);
    return {
        init: function() {
            angular.bootstrap(document.body, [ "TodoApp" ]);
        }
    };
});

define("examples/ng-todo/1.0.0/common-debug", [], {
    // Which filter are we using?
    TodoFilter: "",
    // empty, active, completed
    // What is the enter key constant?
    ENTER_KEY: 13
});

define("examples/ng-todo/1.0.0/service-debug", [ "store-debug" ], function(require, exports, module) {
    var store = require("store-debug");
    module.exports = function() {
        var todos = [];
        if (store.enabled) {
            console.log("localStorage is available");
            todos = store.get("todos") || store.set("todos", todos);
        }
        return {
            getTodos: function(filter) {
                if (filter) {
                    return todos.filter(function(todo) {
                        if (filter.completed === "") return true;
                        return todo.completed === filter.completed;
                    });
                } else {
                    return todos;
                }
            },
            addTodo: function(todo) {
                todos.push({
                    title: todo,
                    completed: false
                });
            },
            delTodo: function(index) {
                todos.splice(index, 1);
            },
            clearCompleted: function() {
                for (var i = todos.length - 1; i > -1; i--) {
                    if (todos[i].completed) {
                        this.delTodo(i);
                    }
                }
            },
            store: function() {
                store.set("todos", todos);
            }
        };
    };
});
