
const config = require('../config');
const path = require('path');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const task = config.tasks.server;
 
gulp.task('server', () => {
	console.log("OKK.... ", path.join(config.root.src, task.src));
	console.log(path.join(config.root.src, task.dest));
    return gulp.src(path.join(config.root.src, task.src))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat(task.output))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.join(config.root.dest, task.dest)));
});


