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
