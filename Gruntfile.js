/*global module:false*/
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    appEnv: {
      app : 'app',
      dist : 'dist'
    },
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
    requirejs: {
      compile: {
        options: {
          name: 'main',
          mainConfigFile: '<%= appEnv.app %>/scripts/config.js',
          out: '<%= appEnv.dist %>/scripts/app.js',
          optimize: 'none',
          include: '../bower_components/requirejs/require'
        }
      }
    },
    bower: {
      all: {
        rjsConfig: '<%= appEnv.app %>/scripts/config.js'
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
    }
  });

  // Default task.
  grunt.registerTask('default', ['jst', 'configureProxies', 'connect:server', 'watch']);
  grunt.registerTask('build', ['clean', 'copy', 'jst', 'requirejs', 'processhtml']);
};
