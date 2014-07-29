define([
  'jquery',
  'underscore',
  'backbone',
  'models/todo',
  'views/todo',
  'JST'
], function($, _, Backbone, TodoModel, TodoView, JST) {
  'use strict';

  var AppView = Backbone.View.extend({
    el: $('#todoapp'),
    statsTemplate: JST['app/scripts/templates/stats.html'],
    events: {
      'keypress #new-todo':  'createOnEnter',
      'click .todo-clear a': 'clearCompleted'
    },
    initialize: function() {
      this.input    = this.$('#new-todo');

      this.listenTo(this.collection, 'add', this.addOne);
      this.listenTo(this.collection, 'reset', this.addAll);
      this.listenTo(this.collection, 'all', this.render);

      this.collection.fetch();
    },
    render: function() {
      this.$('#todo-stats').html(this.statsTemplate({
        total:      this.collection.length,
        done:       this.collection.done().length,
        remaining:  this.collection.remaining().length
      }));
    },
    addOne: function(todo) {
      var view = new TodoView({
        model: todo
      });
      this.$('#todo-list').append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne, this);
    },
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      var todo = new TodoModel({
        content: this.input.val(),
        done:    false
      });
      todo.save()
      .done(_.bind(function() {
        this.collection.add(todo);
        this.input.val('');
      }, this));
    },
    clearCompleted: function(e) {
      e.preventDefault();
      _.each(this.collection.done(), function(todo){
        todo.destroy();
      });
    }
  });

  return AppView;
});
