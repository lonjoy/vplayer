module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      build: {
        src: 'src/*.js'
      }
    },
    concat: {
      zepto: {
        options: {
          separator: ';'
        },
        src: [
          'lib/zepto/1.1.3/zepto.js',
          'lib/zepto/1.1.3/detect.js',
          'lib/zepto/1.1.3/touch.js'
        ],
        dest: 'dest/zepto.js'
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      compress: {
        files: {
          'dest/skin.min.css': 'src/skin.css'
        }
      }
    },
    uglify: {
      js: {
        files: {
          'dest/zepto.min.js': 'dest/zepto.js',
          'dest/vplayer.min.js': 'src/vplayer.js'
        }
      }
    },
    clean: {
      temporary: [
        'dest/skin.min.css',
        'dest/zepto.js',
        'dest/zepto.min.js'
      ]
    }
  })

  // 添加分隔符
  grunt.template.addDelimiters('vplayer', '<#', '#>')

  // 添加skin css
  grunt.task.registerTask('addskincss', 'AddSkinCSS task.', function() {
    var skincss = grunt.file.read('dest/skin.min.css'),
      vplayer = grunt.file.read('dest/vplayer.min.js')

    skincss = skincss.replace(/\\/g, '\\\\').replace(/"/g, '\'')

    grunt.file.write('dest/vplayer.min.js', grunt.template.process(vplayer, {
      data: {
        skincss: skincss
      },
      delimiters: 'vplayer'
    }))
  })

  // 生成demo.html
  grunt.task.registerTask('demopage', 'DemoPage task.', function() {
    var zepto = grunt.file.read('dest/zepto.min.js'),
      vplayer = grunt.file.read('dest/vplayer.min.js'),
      htmltmpl = grunt.file.read('src/demo.html')

    grunt.file.write('demo/demo.html', grunt.template.process(htmltmpl, {
      data: {
        zepto: zepto,
        vplayer: vplayer
      },
      delimiters: 'vplayer'
    }))
  })

  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-clean')

  // Default task
  grunt.registerTask('default', ['jshint', 'concat', 'cssmin', 'uglify', 'addskincss', 'demopage', 'clean:temporary'])

  // Dev task

  // Test task
  grunt.registerTask('test', ['jshint'])

}