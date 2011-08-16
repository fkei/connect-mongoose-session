NODE = node
NODEUNIT = nodeunit

PROJECTNAME="connect-mongoose-session"
DESC="connect-mongoose-session is a mongoDB session store backed by mongoose(http://github.com/LearnBoost/mongoose)."


all: build doc

build: checkstyle test

checkstyle:
	mkdir -p dist/compiled
	readyjs ready.conf

test:
	@$(NODEUNIT) tests/store.js

doc:
	@if [ ! -d ./deps ]; then \
		echo ";; mkdir deps"; mkdir deps; \
		echo ";; svn checkout http://jsdoc-toolkit.googlecode.com/svn/trunk/jsdoc-toolkit deps/jsdoc-toolkit"; svn checkout http://jsdoc-toolkit.googlecode.com/svn/trunk/jsdoc-toolkit deps/jsdoc-toolkit; \
		echo ";; mkdir -p dist/doc"; mkdir -p dist/doc; \
	fi
	java -jar deps/jsdoc-toolkit/jsrun.jar deps/jsdoc-toolkit/app/run.js --directory=dist/doc -a -p -P -t=deps/jsdoc-toolkit/templates/jsdoc lib/*

clean:
	rm -rf dist
	rm -rf deps

.PHONY: build checkstyle test doc clean
