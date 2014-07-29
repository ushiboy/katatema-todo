define([
  'underscore',
  'backbone',
  'models/todo'
], function(_, Backbone, Todo) {
  'use strict';

  var TodosCollection = Backbone.Collection.extend({

    model: Todo,

    url: '/api/todos',

    done: function() {
      return this.filter(function(todo) {
        return todo.get('done');
      });
    },
    remaining: function() {
      return this.filter(function(todo) {
        return !todo.get('done');
      });
    }
  });

  return TodosCollection;
});
