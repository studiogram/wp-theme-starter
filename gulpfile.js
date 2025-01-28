'use strict';
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const browsersync = require('browser-sync').create();
const rollup = require('gulp-better-rollup');
const babel = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const cleanCSS = require('gulp-clean-css');
const npmDist = require('gulp-npm-dist');
const path = require('path');
const flatmap = require('gulp-flatmap');
const rename = require('gulp-rename');

const browserSync = () => {
  return new Promise((resolve) => {
    browsersync.init({
      proxy: 'https://theme.localhost/',
      files: ['views/**/*', 'assets/**/*'],
    });
    resolve();
  });
};

const scripts = () => {
  return gulp
    .src('./assets/scripts/*.js')
    .pipe(
      rollup(
        {
          plugins: [babel({ babelHelpers: 'bundled' }), resolve(), commonjs()],
        },
        'umd'
      )
    )
    .pipe(gulp.dest('./build/scripts/'));
};

const scriptsMain = () => {
  return gulp
    .src(['./build/scripts/main.js'])
    .pipe(plumber())
    .pipe(concat('main.min.js'))
    .pipe(terser())
    .pipe(gulp.dest('./build/scripts/'))
    .pipe(browsersync.stream());
};

const scriptsEditor = () => {
  return gulp.src('views/blocks/**/editor.js').pipe(
    flatmap((stream, file) => {
      const folder = path.dirname(file.path);
      return gulp
        .src(file.path)
        .pipe(
          rollup(
            {
              plugins: [
                babel({ babelHelpers: 'bundled' }),
                resolve(),
                commonjs(),
              ],
            },
            'umd'
          )
        )
        .pipe(rename('editor.min.js'))
        .pipe(gulp.dest(folder));
    })
  );
};

const styles = () => {
  return gulp
    .src('./assets/styles/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([tailwindcss(), autoprefixer()]))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('./build/styles/'));
};

const stylesMain = () => {
  return gulp
    .src(
      [
        './build/libs/swiper/swiper.css',
        './build/libs/swiper/modules/navigation/navigation.min.css',
        './build/libs/swiper/modules/pagination/pagination.min.css',
        './build/styles/main.css',
      ],
      {
        allowEmpty: true,
      }
    )
    .pipe(plumber())
    .pipe(concat('main.min.css'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('./build/styles/'))
    .pipe(browsersync.stream());
};

const stylesAdmin = () => {
  return gulp
    .src(
      [
        './build/libs/swiper/swiper.css',
        './build/libs/swiper/modules/navigation/navigation.min.css',
        './build/libs/swiper/modules/pagination/pagination.min.css',
        './build/styles/admin.css',
      ],
      {
        allowEmpty: true,
      }
    )
    .pipe(plumber())
    .pipe(concat('admin.min.css'))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('./build/styles/'))
    .pipe(browsersync.stream());
};

const libs = () => {
  return gulp
    .src(
      npmDist({
        copyUnminified: true,
        excludes: ['/**/*.txt', '/**/*.map'],
      }),
      { base: './node_modules' }
    )
    .pipe(gulp.dest('./build/libs/'));
};

const watch = () => {
  gulp.watch(
    './assets/styles/**/*.scss',
    gulp.series(styles, stylesMain, stylesAdmin)
  );
  gulp.watch('./views/**/*.scss', gulp.series(styles, stylesMain, stylesAdmin));
  gulp.watch('./assets/scripts/**/*.js', gulp.series(scripts, scriptsMain));
  gulp.watch('./views/**/*.js', gulp.series(scripts, scriptsMain));
  gulp.watch('./**/*.twig').on('change', browsersync.reload);
  gulp.watch('./views/blocks/**/scripts.js', gulp.series(scriptsEditor));
};

exports.libs = libs;
exports.styles = styles;
exports.stylesMain = stylesMain;
exports.stylesAdmin = stylesAdmin;
exports.scripts = scripts;
exports.scriptsMain = scriptsMain;
exports.scriptsEditor = scriptsEditor;
exports.watch = gulp.series(gulp.parallel(watch, browserSync));
