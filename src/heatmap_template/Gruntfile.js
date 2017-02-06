var path = require('path');
console.log(path.join(__dirname,"../settings.json"));

module.exports = function(grunt) {
  grunt.initConfig({
    'gh-pages': {
      options: {
        base: 'www'
      },
      src: ['**']
    },
    'mustache_render': {
      all: {
        files: [{
          data: path.join(__dirname,"../settings.json"), // Path to JS module, path or URL to JSON or YAML, or POJO
          template: path.join(__dirname,"/heatmap.mustache"), // Path or URL to template file
          dest: "www/index.html" // Path to output destination here
        }]
      },
    },
  });

  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-mustache-render');
};
