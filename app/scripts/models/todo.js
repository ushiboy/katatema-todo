define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  'use strict';
  var TodoModel = Backbone.Model.extend({
    urlRoot : '/api/todos',
    defaults: {
      content: 'empty todo...',
      done: false
    },
    initialize: function() {
      if (!this.get('content')) {
        this.set({
          'content': this.defaults.content
        });
      }
    },
    toggle: function() {
      this.save({
        done: !this.get('done')
      });
    }
  });
  return TodoModel;
});
