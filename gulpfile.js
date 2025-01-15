const gulp = require('gulp');
const typescript = require('gulp-typescript');
const sass = require('gulp-sass')(require('sass'));
const terser = require('gulp-terser');
const cleanCss = require('gulp-clean-css');
const path = require('path');

// Define the path for blocks
const paths = {
  blocks: path.join(__dirname, 'blocks'),
};

// Compile TypeScript into minified JavaScript
function compileTypescript() {
  return gulp.src(paths.blocks + '/**/assets/scripts.ts')
    .pipe(typescript({ noImplicitAny: true })) 
    .pipe(terser())
    .pipe(gulp.dest(function(file) {
      return file.base;
    }));
}

// Compile Sass into minified CSS
function compileSass() {
  return gulp.src(paths.blocks + '/**/assets/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCss())
    .pipe(gulp.dest(function(file) {
      return file.base;
    }));
}

// Watch for changes and recompile
function watch() {
  gulp.watch(paths.blocks + '/**/assets/scripts.ts', compileTypescript);
  gulp.watch(paths.blocks + '/**/assets/styles.scss', compileSass);
}

// Default task
exports.default = gulp.series(
  gulp.parallel(compileTypescript, compileSass),
  watch
);
exports.watch = watch;