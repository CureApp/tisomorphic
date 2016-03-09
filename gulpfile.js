const gulp   = require('gulp')
const coffee = require('gulp-coffee')


gulp.task('build', x => {

    gulp.src('src/**/*.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('dist'))
})
