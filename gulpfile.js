const gulp = require('gulp');
const typescript = require('gulp-typescript');
const sass = require('gulp-sass')(require('sass'));
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const path = require('path');

// Define the path for blocks
const paths = {
  scss: 'assets/styles/*.scss',
  cssOutput: 'build/styles/',
  ts: 'assets/scripts/*.ts',
  jsOutput: 'build/scripts/',
  blocks: path.join(__dirname, 'blocks'),
};

function scripts() {
  return gulp
    .src(paths.ts) // Source TypeScript files
    .pipe(typescript({ noImplicitAny: true })) // Compile TypeScript to JavaScript
    .pipe(uglify()) // Minify JavaScript
    .pipe(rename((file) => {
      file.basename += '.min'; // Append .min to the file name
    }))
    .pipe(gulp.dest(paths.jsOutput)); // Output to destination folder
}

function styles() {
  return gulp
    .src(paths.scss) // Source SCSS files
    .pipe(sass().on('error', sass.logError)) // Compile SCSS to CSS
    .pipe(cleanCSS()) // Minify CSS
    .pipe(rename((file) => {
      file.basename += '.min'; // Append .min to the file name
    }))
    .pipe(gulp.dest(paths.cssOutput)); // Output to the destination folder
}

function blockScripts() {
  return gulp
    .src(`${paths.blocks}/**/assets/scripts.ts`) // Target scripts.ts files inside any block's assets folder
    .pipe(typescript({ noImplicitAny: true })) // Compile TS to JS
    .pipe(uglify()) // Minify JS
    .pipe(rename({ suffix: '.min' })) // Add .min to the filename
    .pipe(gulp.dest((file) => {
      // Output in the same folder as the original file (inside `assets`)
      return file.base; // This ensures the output goes into the same folder
    }));
}

// Task to compile and minify SCSS files
function blockStyles() {
  return gulp
    .src(`${paths.blocks}/**/assets/styles.scss`) // Target styles.scss files inside any block's assets folder
    .pipe(sass().on('error', sass.logError)) // Compile SCSS to CSS
    .pipe(cleanCSS()) // Minify CSS
    .pipe(rename({ suffix: '.min' })) // Add .min to the filename
    .pipe(gulp.dest((file) => {
      // Output in the same folder as the original file (inside `assets`)
      return file.base; // This ensures the output goes into the same folder
    }));
}

// Watch for changes and recompile
function watch() {
  gulp.watch(paths.blocks + '/**/assets/scripts.ts', blockScripts);
  gulp.watch(paths.blocks + '/**/assets/styles.scss', blockStyles);
  gulp.watch(paths.ts, scripts);
  gulp.watch(paths.scss, styles);
}


exports.watch = gulp.series(styles, scripts, blockStyles, blockScripts, watch);