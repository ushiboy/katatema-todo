#RequireJS + Backbone.js

モジュール化したTODOアプリのお勉強

##トピックス

- grunt-bower-requirejsでrequire.configを生成
- grunt-connect-proxyを使ってREST APIをプロキシして開発
- grunt-contrib-jstを利用したJSTテンプレートの利用とコンパイル

##Setup

```
$ bower install
$ npm install
$ grunt
```

ブラウザでhttp://localhost:3001 にアクセスしてJavaScriptコンソールにstartが出てればOK。

##RequireJS Configの初期化

Gruntfile.jsに次のタスク設定を追加

```javascript
bower: {
  all: {
    rjsConfig: '<%= appEnv.app %>/scripts/config.js'
  }
}
```

タスクを直接指定して実行
```
$ grunt bower
```
app/scripts/config.jsのpathsにbowerのライブラリが設定される。


##簡易APIサーバの準備

```
$ cd api
$ npm install
$ node index.js
```

ブラウザからhttp://localhost:3000/api/todos にアクセスして1件のJSONデータが見れればOK。

##開発サーバから簡易APIサーバをプロキシ経由で呼べるようにする

Gruntfile.jsのconnectタスク設定を修正

```javascript
connect: {
  server: {
    options: {
      port: 3001,
      base : '<%= appEnv.app %>',
      hostname: 'localhost',
      livereload: true,
      // for proxy
      middleware: function(connect, options) {
        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
        if (Array.isArray(options.base)) {
          options.base = options.base[0];
        }
        return [
          proxy,
          connect.static(options.base),
          connect.directory(options.base)
        ];
      }
    }
  },
  proxies : [
    {
      context: '/api',
      host: 'localhost',
      port: 3000,
      changeOrigin: false,
      xforward: true
    }
  ]
},
```
また、defaultタスクのリストを修正
```
grunt.registerTask('default', ['configureProxies', 'connect:server', 'watch']);
```

gruntと簡易サーバを起動してhttp://localhost:3001/api/todos にアクセスし、
先ほどのと同じデータが見れればOK。

##アプリづくり

###Todoモデル作成

app/scripts/models/todo.jsを次のように作成

```javascript
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
```

###Todoコレクション作成

app/scripts/collections/todos.jsを次のように作成

```javascript
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
```

###index.html修正

bodyタグ直下にアプリケーションのメインビューになるHTML（div#todoapp）を追加する。

```html
<body>
  <div id="todoapp">
    <div class="title">
      <h1>Todos</h1>
    </div>

    <div class="content">

      <div id="create-todo">
        <input id="new-todo" placeholder="What needs to be done?" type="text" />
      </div>

      <div id="todos">
        <ul id="todo-list"></ul>
      </div>

      <div id="todo-stats"></div>

    </div>
  </div>

  ...省略...

</body>
```

###appビュー作成

app/scripts/views/app.jsを次のように作成

```javascript
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  'use strict';

  var AppView = Backbone.View.extend({
    el: $('#todoapp'),
    initialize: function() {
      this.collection.fetch();
    }
  });

  return AppView;
});
```

###main.jsを修正

app/scripts/main.jsを次のように修正

```javascript
require([
  'views/app',
  'collections/todos'
], function(AppView, TodoCollection) {
  new AppView({
    collection: new TodoCollection()
  });
});
```

###todoテンプレート作成

app/scripts/templates/todo.htmlを次のように作成

```html
<div class="todo <%= done ? 'done' : '' %>">
  <div class="display">
    <input class="check" type="checkbox" <%= done ? 'checked="checked"' : '' %> />
    <div class="todo-content"><%- content %></div>
    <span class="todo-destroy"></span>
  </div>
  <div class="edit">
    <input class="todo-input" type="text" value="<%- content %>" />
  </div>
</div>
```

###grunt-contrib-jstの設定

Gruntfile.jsに次の設定を追記する

```javascript
    ...省略...
    watch: {
      options: {
        nospawn: true,
        livereload: true
      },
      js: {
        files: '<%= appEnv.app %>/scripts/**/*.js'
      },
      html: {
        files: ['<%= appEnv.app %>/**/*.html']
      },
      jst: {
        files: ['<%= appEnv.app %>/scripts/templates/**/*.html'],
        tasks: ['jst']
      }
    },
    jst : {
      compile: {
        options: {
          amd: true
        },
        files: {
          '<%= appEnv.app %>/scripts/gen/jst.js' : [
            '<%= appEnv.app %>/scripts/templates/**/*.html'
          ]
        }
      }
    },
    ...省略...

    grunt.registerTask('default', ['jst', 'configureProxies', 'connect:server', 'watch']);

```

###requirejsの設定にJSTを追記

```javascript
require.config({
  shim: {

  },
  paths: {
    backbone: "../bower_components/backbone/backbone",
    jquery: "../bower_components/jquery/dist/jquery",
    requirejs: "../bower_components/requirejs/require",
    underscore: "../bower_components/underscore/underscore",
    JST: 'gen/jst'
  },
  packages: [

  ]
});
```

###Todoビューを作成

app/scripts/views/todo.jsを次のように作成

```javascript
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
    initialize: function() {
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$input = this.$('.todo-input');
      return this;
    }
  });
  return TodoView;
});
```

###AppビューにTodo描画の追加

app/scripts/views/app.js

```javascript
define([
  'jquery',
  'underscore',
  'backbone',
  'models/todo',
  'views/todo'
], function($, _, Backbone, TodoModel, TodoView) {
  'use strict';

  var AppView = Backbone.View.extend({
    el: $('#todoapp'),
    initialize: function() {
      this.listenTo(this.collection, 'add', this.addOne);
      this.listenTo(this.collection, 'reset', this.addAll);

      this.collection.fetch();
    },
    addOne: function(todo) {
      var view = new TodoView({
        model: todo
      });
      this.$('#todo-list').append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne, this);
    }
  });

  return AppView;
});
```

###Todoの新規追加を実装する

app/scripts/views/app.js

```javascript
define([
  'jquery',
  'underscore',
  'backbone',
  'models/todo',
  'views/todo'
], function($, _, Backbone, TodoModel, TodoView) {
  'use strict';

  var AppView = Backbone.View.extend({
    // ...省略...
    events: {
      'keypress #new-todo':  'createOnEnter'
    },
    initialize: function() {
      this.input    = this.$('#new-todo');

      // ...省略...
    },
    // ...省略...
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
    }
  });

  return AppView;
});
```

###Todoのdoneトグル機能を追加

app/scripts/views/todo.js

```javascript
define([
  'jquery',
  'underscore',
  'backbone',
  'JST'
], function($, _, Backbone, JST) {
  'use strict';

  var TodoView = Backbone.View.extend({
    //...省略...
    events: {
      'click .check'              : 'toggleDone'
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    //...省略...
    toggleDone: function() {
      this.model.toggle();
    }
  });
  return TodoView;
});
```

###Todoの編集機能を追加

app/scripts/views/todo.js

```javascript
define([
  'jquery',
  'underscore',
  'backbone',
  'JST'
], function($, _, Backbone, JST) {
  'use strict';

  var TodoView = Backbone.View.extend({
    //...省略...
    events: {
      //...省略...
      'dblclick div.todo-content' : 'edit',
      'keypress .todo-input'      : 'updateOnEnter',
      'blur input': 'close'
    },
    //...省略...
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
    }
  });
  return TodoView;
});
```

###Todoの削除機能を追加

app/scripts/views/todo.js

```javascript
define([
  'jquery',
  'underscore',
  'backbone',
  'JST'
], function($, _, Backbone, JST) {
  'use strict';

  var TodoView = Backbone.View.extend({
    //...省略...
    events: {
      //...省略...
      'click span.todo-destroy'   : 'clear'
    },
    initialize: function() {
      //...省略...
      this.listenTo(this.model, 'destroy', this.remove);
    },
    //...省略...
    clear: function() {
      this.model.destroy();
    }
  });
  return TodoView;
});
```

###statusテンプレートの作成

app/scriptes/templates/status.html

```html
<% if (total) { %>
<span class="todo-count">
  <span class="number"><%= remaining %></span>
  <span class="word"><%= remaining == 1 ? 'item' : 'items' %></span> left.
</span>
<% } %>
<% if (done) { %>
<span class="todo-clear">
  <a href="#">
    Clear <span class="number-done"><%= done %></span>
    completed <span class="word-done"><%= done == 1 ? 'item' : 'items' %></span>
  </a>
</span>
<% } %>
```

###Appビューにステータス機能追加

app/scripts/views/app.jsにstats扱い周りを追加する

```javascript
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
    // ...省略...
    statsTemplate: JST['app/scripts/templates/stats.html'],
    events: {
      // ...省略...
      'click .todo-clear a': 'clearCompleted'
    },
    initialize: function() {
      // ...省略...
      this.listenTo(this.collection, 'all', this.render);
      // ...省略...
    },
    render: function() {
      this.$('#todo-stats').html(this.statsTemplate({
        total:      this.collection.length,
        done:       this.collection.done().length,
        remaining:  this.collection.remaining().length
      }));
    },
    // ...省略...
    clearCompleted: function(e) {
      e.preventDefault();
      _.each(this.collection.done(), function(todo){
        todo.destroy();
      });
    }
  });

  return AppView;
});
```

##デプロイ用ビルド設定追加

requirejsとprocessHtmlタスクを組み合わせてデプロイ用ビルドのタスク設定を行う。

Gruntfile.js

```javascript
    //...省略...
    processhtml: {
      dist: {
        files: {
          '<%= appEnv.dist %>/index.html': ['<%= appEnv.app %>/index.html']
        }
      }
    },
    clean: {
      files: ['dist']
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= appEnv.app %>',
          dest: '<%= appEnv.dist %>',
          src: [
            'css/*'
          ]
        }]
      }
    },
  //...省略...
  grunt.registerTask('build', ['clean', 'copy', 'jst', 'requirejs', 'processhtml']);
```

###index.htmlにprocessHtmlのマークアップ追加

```html
  ...省略...
  <!-- build:js scripts/app.js -->
  <script type="text/javascript" src="bower_components/requirejs/require.js" data-main="scripts/main.js"></script>
  <script type="text/javascript" src="scripts/config.js"></script>
  <!-- /build -->
  ...省略...
```

###build

```
$ grunt build
```

###動作確認

http://localhost:3000/ を開いてビルド後のアプリを表示。
