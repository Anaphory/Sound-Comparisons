# -*- coding: utf-8 -*-
import flask

import db
import dataInfo
import redirectStatic
import templateInfo
import translationInfo

app = db.app

# Putting templateInfo into place.
templateInfo.addRoutes(app,'/query/templateInfo')

# Redirect currently expected static files from toplevel:
redirectStatic.addRoutes(app)

# query/data routes…
dataInfo.addRoute(app)

# query/translations
translationInfo.addRoute(app)

# index route:
@app.route('/')
def getIndex():
    data = {
            'title': 'TEST ME!',
            'requirejs': 'js/App.js'
        }
    return flask.render_template('index.html', **data)

if __name__ == "__main__":
    import config
    app.debug = config.debug
    app.run()
