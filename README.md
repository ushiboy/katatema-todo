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
