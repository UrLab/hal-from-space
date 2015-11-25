all: dev prod

prod: static/app.min.js
dev: static/app.js static/dev.html

static/app.js: components/app.js components/*.js
	browserify -o $@ --debug -g reactify $<

static/app.min.js: components/app.js components/*.js
	browserify -o $@ -g reactify -g uglifyify $<

static/dev.html: static/index.html
	sed -E 's/"(.+)\.min\.(js|css)"/"\1.\2"/g' < $< > $@

clean:
	rm -f static/app.min.js static/app.js static/dev.html
