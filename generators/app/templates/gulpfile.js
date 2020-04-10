const fs = require('fs')
const {src, dest, series, watch, parallel} = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const del = require('del')

const plugins = require('gulp-load-plugins')()

const checkDir = path => {
	console.log(fs.existsSync(path))
	return fs.existsSync(path)
}

function js(cb) {
	src('js/*.js')
		.pipe(plugins.babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(plugins.uglify())
		.pipe(plugins.rename({ suffix: '.min' }))
		.pipe(dest('./dist/js'))
		.pipe(reload({stream: true}))

	cb()
}

function css(cb) {
	src('sass/*.scss')
		.pipe(plugins.sass({outputStyle: 'compressed'}))
		.pipe(plugins.autoprefixer({
			cascade: false,
			remove: false
		}))
		.pipe(plugins.rename({ extname: '.min.css' }))
		.pipe(dest('./dist/css'))
		.pipe(reload({stream: true}))
	cb()
}

function image(cb) {
	src('./img/**/*.{gif,jpeg,jpg,png}')
		.pipe(
			plugins.imagemin({
				progressive: true,
				interlaced: true
			})
		)
		.pipe(dest('./dist/img'))
	setTimeout(() => {
		cb()
	}, 2000)
}

function watcher(cb) {
	watch('js/*.js', js)
	watch('sass/*.scss', css)
	watch("./*.html").on('change', reload)
	cb()
}

function clean(cb) {
	if (checkDir('./dist')) {
		del('./dist')
	}
	cb()
}

function serve (cb) {
	browserSync.init({
		server: {
			baseDir: './'
		}
	})
	cb()
}

function html(cb) {
	src('./index.html')
		.pipe(plugins.minifyHtml())
		.pipe(dest('./dist'))
	cb()
}

exports.default = series(
	clean,
	image,
	parallel(js, css, html),
	serve,
	watcher
)

exports.scripts = js
exports.styles = css
exports.clean = clean
