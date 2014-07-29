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
      }
    },
    connect: {
      server: {
        options: {
          port: 3001,
          base : '<%= appEnv.app %>',
          hostname: 'localhost',
          livereload: true
        }
      }
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
    }
  });

  // Default task.
  grunt.registerTask('default', ['connect:server', 'watch']);
  grunt.registerTask('build', ['requirejs']);
};
