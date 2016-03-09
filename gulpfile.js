const gulp   = require('gulp')
const coffee = require('gulp-coffee')


gulp.task('build', function() {

    gulp.src('src/**/*.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('dist'))
})
