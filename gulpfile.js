var gulp = require('gulp');
var browserify = require('gulp-browserify');
var jasmine = require('gulp-jasmine');
var concat = require('gulp-concat');

gulp.task('default', function() {
  gulp.src('imutate.js')
      .pipe(browserify({debug:true, standalone:'imutate'}))
      .pipe(gulp.dest('./built'));
});


gulp.task('watch', function(){
  gulp.watch('imutate.js', ['default', 'test']);
  gulp.watch('test/spec/**.js', ['test']);
});


gulp.task('test', function(){
  gulp.src('test/spec/**.js')
      .pipe(browserify({debug:true}))
      .pipe(concat('all.specs.js'))
      .pipe(gulp.dest('test/spec/built'));

  gulp.src('test/spec/*.js').pipe(jasmine());
});


