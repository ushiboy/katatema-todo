define([
  'jquery',
  'underscore',
  'backbone',
  'JST'
], function($, _, Backbone, JST) {
  'use strict';

  var TodoView = Backbone.View.extend({

    tagName:  'li',
    template: JST['app/scripts/templates/todo.html'],
    events: {
      'click .check'              : 'toggleDone',
      'dblclick div.todo-content' : 'edit',
      'click span.todo-destroy'   : 'clear',
      'keypress .todo-input'      : 'updateOnEnter',
      'blur input': 'close'
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$input = this.$('.todo-input');
      return this;
    },
    toggleDone: function() {
      this.model.toggle();
    },
    edit: function() {
      this.$el.addClass('editing');
      this.$input.focus();
    },
    close: function() {
      this.model.save({
        content: this.$input.val()
      }).done(_.bind(function() {
        this.$el.removeClass('editing');
      }, this));
    },
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
    clear: function() {
      this.model.destroy();
    }
  });
  return TodoView;
});
