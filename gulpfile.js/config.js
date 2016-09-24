var path = require('path');

module.exports = {
    root: {
        src: path.join(__dirname, '../src'),
        dest: path.join(__dirname, '../build')
    },
    watchableTasks: ['scripts', 'styles', 'iconfont', 'sprite','ejs'],
    tasks: {
        browserSync: {
            // Taking the options from: https://www.browsersync.io/docs/options/
            // Serve files from the app directory
            server: {
                baseDir: "./build"
            }

            // Proxy through another webserver
            /*
            proxy: {
                target: "http://example.com"
            }*/
        },
        ejs: {
            src: 'templates',
            dest: '.',
            extensions: ['ejs'],
			options: {
				ext: ".html"
			}
        },
        scripts: {
            src: 'scripts',
            dest: 'assets/js',
            input: ['main.js'],
            output: 'app.js',
            extensions: ['js']
        },
        styles: {
            src: 'styles',
            dest: 'assets/css',
            sources: [ 
                { input: 'styles.scss', output: 'styles.css'},
            ],
            extensions: ['scss','sass','css']
        },
        sprite: {
            src: 'images/',
            dest: 'assets/css/img/',
            cssDest: './src/styles',
            imgName: 'sprite.png',
            retinaImgName: 'sprite@2x.png',
            cssName: 'sprite.scss',
            extensions: ['png']
        },
        iconfont: {
            src: 'icons/',
            dest: 'assets/css/fonts/',
            template: 'icons/templates/webfont.template.css',
            cssDest: './src/styles',
            cssName: 'icon.scss',
            extensions: ['svg'],
            config: {
                fontName: 'icons', // required
                appendUnicode: true, // recommended option
                formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'], // default, 'woff2' and 'svg' are available
                timestamp: Math.round(Date.now()/1000), // recommended to get consistent builds when watching files
                normalize: true,
                fontHeight: 500
            }
        },
    }
};