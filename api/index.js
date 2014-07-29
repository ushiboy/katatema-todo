var express = require('express'),
logger = require('morgan'),
bodyParser = require('body-parser'),
path = require('path'),
app = express(),
Backbone = require('backbone'),
Todos = Backbone.Collection.extend({
  initialize: function() {
    this._ID_SEED_ = 1;
  },
  addNewTodo: function(content) {
    var todo = {
      id : this._ID_SEED_,
      content: content,
      done: false
    };
    this._ID_SEED_++;
    return this.add(todo);
  }
}),
todos = new Todos();

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(logger());
app.use(bodyParser.json());

function filterRequest(req, res, next) {
  var id = Number(req.params.id),
  todo = todos.get(id);
  if (todo) {
    next(req, res, todo);
  } else {
    res.status(404).send('Not found');
  }
}

todos.addNewTodo('grunt-bower-requirejs のすゝめ');

app
.get('/api/todos', function(req, res) {
    res.send(todos);
})
.get('/api/todos/:id', function(req, res) {
  filterRequest(req, res, function(req, res, todo) {
    res.send(todo);
  });
})
.post('/api/todos', function(req, res) {
  res.status(201).send(todos.addNewTodo(req.body.content));
})
.put('/api/todos/:id', function(req, res) {
  filterRequest(req, res, function(req, res, todo) {
    todo.set({
      content: req.body.content,
      done: req.body.done
    });
    res.send(todo);
  });
})
.delete('/api/todos/:id', function(req, res) {
  filterRequest(req, res, function(req, res, todo) {
    todos.remove(todo);
    res.status(204).send('No Content');
  });
});
app.listen(3000);
