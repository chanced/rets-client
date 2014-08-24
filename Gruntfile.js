module.exports = function (grunt) {
    var banner = '/*\n<%= pkg.name %> <%= pkg.version %>';
    banner += '- <%= pkg.description %>\n<%= pkg.repository.url %>\n';
    banner += 'Built on <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n';


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['gruntfile.js', 'index.js', 'lib/*.js']
        },
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
            },
            all: { src: ['test/unit/index.js'] },
            integration: {src: ['test/integration/*.js', 'test/integration/lib/*.js']}
        },
        concat: {
            options: {
                separator: ';\n',
                banner: banner
            },
            build: {
                files: [{
                    src: ['index.js','lib/*.js', 'node_modules'],
                    dest: 'build/<%= pkg.name %>.js'
                }]
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            build: {
                files: {
                    'build/<%= pkg.name %>.min.js':
                        ['build/<%= pkg.name %>.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'simplemocha', 'concat', 'uglify']);
    grunt.registerTask('development', ['jshint', 'simplemocha']);
    grunt.registerTask('integration', ['jshint', 'simplemocha:integration']);

};


