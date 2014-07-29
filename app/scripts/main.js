require([
  'views/app',
  'collections/todos'
], function(AppView, TodoCollection) {
  new AppView({
    collection: new TodoCollection()
  });
});
