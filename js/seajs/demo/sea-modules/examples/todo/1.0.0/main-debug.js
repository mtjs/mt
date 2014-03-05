define("examples/todo/1.0.0/main-debug", [ "backbone-debug", "./views/app-debug", "$-debug", "underscore-debug", "./views/todos-debug", "./common-debug", "./collections/todos-debug", "./vendor/backbone.localStorage-debug", "./models/todo-debug", "./routers/router-debug" ], function(require) {
    var Backbone = require("backbone-debug");
    var app = require("./views/app-debug");
    var Workspace = require("./routers/router-debug");
    new Workspace();
    Backbone.history.start();
    new app();
});

define("examples/todo/1.0.0/views/app-debug", [ "$-debug", "underscore-debug", "backbone-debug", "examples/todo/1.0.0/views/todos-debug", "examples/todo/1.0.0/common-debug", "examples/todo/1.0.0/collections/todos-debug", "examples/todo/1.0.0/models/todo-debug" ], function(require, exports, module) {
    var Backbone, TodoView, todos, common, AppView;
    var $ = require("$-debug");
    var _ = require("underscore-debug");
    Backbone = require("backbone-debug");
    TodoView = require("examples/todo/1.0.0/views/todos-debug");
    todos = require("examples/todo/1.0.0/collections/todos-debug");
    common = require("examples/todo/1.0.0/common-debug");
    AppView = Backbone.View.extend({
        el: "#todoapp",
        statsTemplate: _.template($("#stats-template").html()),
        events: {
            "keypress #new-todo": "createOnEnter",
            "click #clear-completed": "clearCompleted",
            "click #toggle-all": "toggleAllComplete"
        },
        initialize: function() {
            this.allCheckbox = this.$("#toggle-all")[0];
            this.$input = this.$("#new-todo");
            this.$footer = this.$("#footer");
            this.$main = this.$("#main");
            this.listenTo(todos, "add", this.addOne);
            this.listenTo(todos, "reset", this.addAll);
            this.listenTo(todos, "change:completed", this.filterOne);
            this.listenTo(todos, "filter", this.filterAll);
            this.listenTo(todos, "all", this.render);
            todos.fetch();
        },
        render: function() {
            var completed = todos.completed().length;
            var remaining = todos.remaining().length;
            if (todos.length) {
                this.$main.show();
                this.$footer.show();
                this.$footer.html(this.statsTemplate({
                    completed: completed,
                    remaining: remaining
                }));
                this.$("#filters li a").removeClass("selected").filter('[href="#/' + (common.TodoFilter || "") + '"]').addClass("selected");
            } else {
                this.$main.hide();
                this.$footer.hide();
            }
            this.allCheckbox.checked = !remaining;
        },
        addOne: function(todo) {
            var view = new TodoView({
                model: todo
            });
            $("#todo-list").append(view.render().el);
        },
        addAll: function() {
            this.$("#todo-list").html("");
            todos.each(this.addOne, this);
        },
        filterOne: function(todo) {
            todo.trigger("visible");
        },
        filterAll: function() {
            todos.each(this.filterOne, this);
        },
        newAttributes: function() {
            return {
                title: this.$input.val().trim(),
                order: todos.nextOrder(),
                completed: false
            };
        },
        createOnEnter: function(e) {
            if (e.which !== common.ENTER_KEY || !this.$input.val().trim()) {
                return;
            }
            todos.create(this.newAttributes());
            this.$input.val("");
        },
        clearCompleted: function() {
            _.invoke(todos.completed(), "destroy");
            return false;
        },
        toggleAllComplete: function() {
            var completed = this.allCheckbox.checked;
            todos.each(function(todo) {
                todo.save({
                    completed: completed
                });
            });
        }
    });
    module.exports = AppView;
});

define("examples/todo/1.0.0/views/todos-debug", [ "backbone-debug", "examples/todo/1.0.0/common-debug", "$-debug", "underscore-debug" ], function(require, exports, module) {
    var Backbone, common, TodoView;
    Backbone = require("backbone-debug");
    common = require("examples/todo/1.0.0/common-debug");
    var $ = require("$-debug");
    var _ = require("underscore-debug");
    TodoView = Backbone.View.extend({
        tagName: "li",
        template: _.template($("#item-template").html()),
        events: {
            "click .toggle": "toggleCompleted",
            "dblclick label": "edit",
            "click .destroy": "clear",
            "keypress .edit": "updateOnEnter",
            "blur .edit": "close"
        },
        initialize: function() {
            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);
            this.listenTo(this.model, "visible", this.toggleVisible);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass("completed", this.model.get("completed"));
            this.toggleVisible();
            this.$input = this.$(".edit");
            return this;
        },
        toggleVisible: function() {
            this.$el.toggleClass("hidden", this.isHidden());
        },
        isHidden: function() {
            var isCompleted = this.model.get("completed");
            return;
            // hidden cases only
            !isCompleted && common.TodoFilter === "completed" || isCompleted && common.TodoFilter === "active";
        },
        toggleCompleted: function() {
            this.model.toggle();
        },
        edit: function() {
            this.$el.addClass("editing");
            this.$input.focus();
        },
        close: function() {
            var value = this.$input.val().trim();
            if (value) {
                this.model.save({
                    title: value
                });
            } else {
                this.clear();
            }
            this.$el.removeClass("editing");
        },
        updateOnEnter: function(e) {
            if (e.which === common.ENTER_KEY) {
                this.close();
            }
        },
        clear: function() {
            this.model.destroy();
        }
    });
    module.exports = TodoView;
});

define("examples/todo/1.0.0/common-debug", [], {
    // Which filter are we using?
    TodoFilter: "",
    // empty, active, completed
    // What is the enter key constant?
    ENTER_KEY: 13
});

define("examples/todo/1.0.0/collections/todos-debug", [ "backbone-debug", "$-debug", "underscore-debug", "examples/todo/1.0.0/models/todo-debug" ], function(require, exports, module) {
    var Backbone, TodoModel, TodosCollection;
    Backbone = require("backbone-debug");
    require("examples/todo/1.0.0/vendor/backbone.localStorage-debug");
    var $ = require("$-debug");
    var _ = require("underscore-debug");
    TodoModel = require("examples/todo/1.0.0/models/todo-debug");
    TodosCollection = Backbone.Collection.extend({
        model: TodoModel,
        localStorage: new Backbone.LocalStorage("todos-backbone"),
        completed: function() {
            return this.filter(function(todo) {
                return todo.get("completed");
            });
        },
        remaining: function() {
            return this.without.apply(this, this.completed());
        },
        nextOrder: function() {
            if (!this.length) {
                return 1;
            }
            return this.last().get("order") + 1;
        },
        comparator: function(todo) {
            return todo.get("order");
        }
    });
    module.exports = new TodosCollection();
});

/**
 * Backbone localStorage Adapter
 * Version 1.1.0
 *
 * https://github.com/jeromegn/Backbone.localStorage
 */
define("examples/todo/1.0.0/vendor/backbone.localStorage-debug", [ "underscore-debug", "$-debug", "backbone-debug" ], function(require) {
    var _ = require("underscore-debug");
    var $ = require("$-debug");
    var Backbone = require("backbone-debug");
    // A simple module to replace `Backbone.sync` with *localStorage*-based
    // persistence. Models are given GUIDS, and saved into a JSON object. Simple
    // as that.
    // Hold reference to Underscore.js and Backbone.js in the closure in order
    // to make things work even if they are removed from the global namespace
    // Generate four random hex digits.
    function S4() {
        return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
    }
    // Generate a pseudo-GUID by concatenating random hexadecimal.
    function guid() {
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    }
    // Our Store is represented by a single JS object in *localStorage*. Create it
    // with a meaningful name, like the name you'd give a table.
    // window.Store is deprectated, use Backbone.LocalStorage instead
    Backbone.LocalStorage = window.Store = function(name) {
        this.name = name;
        var store = this.localStorage().getItem(this.name);
        this.records = store && store.split(",") || [];
    };
    _.extend(Backbone.LocalStorage.prototype, {
        // Save the current state of the **Store** to *localStorage*.
        save: function() {
            this.localStorage().setItem(this.name, this.records.join(","));
        },
        // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
        // have an id of it's own.
        create: function(model) {
            if (!model.id) {
                model.id = guid();
                model.set(model.idAttribute, model.id);
            }
            this.localStorage().setItem(this.name + "-" + model.id, JSON.stringify(model));
            this.records.push(model.id.toString());
            this.save();
            return this.find(model);
        },
        // Update a model by replacing its copy in `this.data`.
        update: function(model) {
            this.localStorage().setItem(this.name + "-" + model.id, JSON.stringify(model));
            if (!_.include(this.records, model.id.toString())) this.records.push(model.id.toString());
            this.save();
            return this.find(model);
        },
        // Retrieve a model from `this.data` by id.
        find: function(model) {
            return this.jsonData(this.localStorage().getItem(this.name + "-" + model.id));
        },
        // Return the array of all models currently in storage.
        findAll: function() {
            return _(this.records).chain().map(function(id) {
                return this.jsonData(this.localStorage().getItem(this.name + "-" + id));
            }, this).compact().value();
        },
        // Delete a model from `this.data`, returning it.
        destroy: function(model) {
            if (model.isNew()) return false;
            this.localStorage().removeItem(this.name + "-" + model.id);
            this.records = _.reject(this.records, function(id) {
                return id === model.id.toString();
            });
            this.save();
            return model;
        },
        localStorage: function() {
            return localStorage;
        },
        // fix for "illegal access" error on Android when JSON.parse is passed null
        jsonData: function(data) {
            return data && JSON.parse(data);
        }
    });
    // localSync delegate to the model or collection's
    // *localStorage* property, which should be an instance of `Store`.
    // window.Store.sync and Backbone.localSync is deprectated, use Backbone.LocalStorage.sync instead
    Backbone.LocalStorage.sync = window.Store.sync = Backbone.localSync = function(method, model, options) {
        var store = model.localStorage || model.collection.localStorage;
        var resp, errorMessage, syncDfd = $.Deferred && $.Deferred();
        //If $ is having Deferred - use it. 
        try {
            switch (method) {
              case "read":
                resp = model.id != undefined ? store.find(model) : store.findAll();
                break;

              case "create":
                resp = store.create(model);
                break;

              case "update":
                resp = store.update(model);
                break;

              case "delete":
                resp = store.destroy(model);
                break;
            }
        } catch (error) {
            if (error.code === DOMException.QUOTA_EXCEEDED_ERR && window.localStorage.length === 0) errorMessage = "Private browsing is unsupported"; else errorMessage = error.message;
        }
        if (resp) {
            if (options && options.success) if (Backbone.VERSION === "0.9.10") {
                options.success(model, resp, options);
            } else {
                options.success(resp);
            }
            if (syncDfd) syncDfd.resolve(resp);
        } else {
            errorMessage = errorMessage ? errorMessage : "Record Not Found";
            if (options && options.error) if (Backbone.VERSION === "0.9.10") {
                options.error(model, errorMessage, options);
            } else {
                options.error(errorMessage);
            }
            if (syncDfd) syncDfd.reject(errorMessage);
        }
        // add compatibility with $.ajax
        // always execute callback for success and error
        if (options && options.complete) options.complete(resp);
        return syncDfd && syncDfd.promise();
    };
    Backbone.ajaxSync = Backbone.sync;
    Backbone.getSyncMethod = function(model) {
        if (model.localStorage || model.collection && model.collection.localStorage) {
            return Backbone.localSync;
        }
        return Backbone.ajaxSync;
    };
    // Override 'Backbone.sync' to default to localSync,
    // the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
    Backbone.sync = function(method, model, options) {
        return Backbone.getSyncMethod(model).apply(this, [ method, model, options ]);
    };
    return Backbone.LocalStorage;
});

define("examples/todo/1.0.0/models/todo-debug", [ "backbone-debug" ], function(require, exports, module) {
    var Backbone = require("backbone-debug");
    var TodoModel = Backbone.Model.extend({
        defaults: {
            title: "",
            completed: false
        },
        toggle: function() {
            this.save({
                completed: !this.get("completed")
            });
        }
    });
    module.exports = TodoModel;
});

define("examples/todo/1.0.0/routers/router-debug", [ "backbone-debug", "examples/todo/1.0.0/collections/todos-debug", "$-debug", "underscore-debug", "examples/todo/1.0.0/models/todo-debug", "examples/todo/1.0.0/common-debug" ], function(require, exports, module) {
    var Backbone, Workspace, todos, common;
    Backbone = require("backbone-debug");
    todos = require("examples/todo/1.0.0/collections/todos-debug");
    common = require("examples/todo/1.0.0/common-debug");
    Workspace = Backbone.Router.extend({
        routes: {
            "*filter": "setFilter"
        },
        setFilter: function(param) {
            // Set the current filter to be used
            common.TodoFilter = param && param.trim() || "";
            // Trigger a collection filter event, causing hiding/unhiding
            // of Todo view items
            todos.trigger("filter");
        }
    });
    module.exports = Workspace;
});
