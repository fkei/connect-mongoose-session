# connect-mongoose-session

connect-mongoose-session is a mongoDB session store backed by mongoose(http://github.com/LearnBoost/mongoose).

## Installation

via npm:

    $ npm install connect-mongoose-session

    ## Function

This module covers the session store feature.
 * session#`set`
 * session#`get`
 * session#`destroy`
 * session#`count`
 * session#`length`
 * session#`clear`

 * Lifetimes can be specified any time
 * `express` supported.
 * Support the `replica set` of MongoDB

    ## Options

lifecheck - Lifetime (ms) [-1 off]

## Example

    var sys = require('sys')
      , http = require('http')
      , connect = require('connect')
      , MongooseStore = require('connect-mongoose-session');
    
    http.IncomingMessage.prototype.flash = function (type, msg) {
        var msgs = this.session.flash = this.session.flash || {};
        if (type && msg) {
        (msgs[type] = msgs[type] || []).push(msg);
        } else if (type) {
            var arr = msgs[type];
            delete msgs[type];
            return arr || [];
        } else {
            this.session.flash = {};
            return msgs;
        }
    };
    
    connect.createServer(
        connect.favicon(),
        connect.bodyParser(),
        connect.cookieParser(),
        
        connect.session({
            key: 'sid',
            secret: 'secret-key',
            store: new MongooseStore(
                ['mongodb://localhost:27017/devulopment'], // single or mongos
                //['mongodb://localhost:27017/devulopment', 'mongodb://localhost:27018/devulopment'], // replica set
                {lifecheck: 30*1000}, // 30 sec
                function(err){
                    return;
                }),
            cookie: {
                path: '/',
                httpOnly: true,
                maxAge: 60 * 1000 // 1 min
            }
        }),
        function (req, res) {
            req.session.count = req.session.count || 0;
            req.session.count++;
            req.sessionStore.length(function(err, len){
                if (req.session.count < 10) {
                    var info = req.flash('info').join('\n');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(info);
                            res.write('<html><head><title>connect-mongoose - sample</title></head>');
                    res.write('<body>');
                    res.write('<form method="post">');
                    res.write('<input type="hidden" name="foo" value="bar" />');
                    res.write('<input type="submit" value="POST request!" />');
                    res.write('</form>');
                    res.write('<hr />');
                    res.write('<p>online : ' + len + '</p>');
                    res.end('<p>count: ' + req.session.count + '</p>');
                } else {
                    req.session.regenerate(function(){
                        req.flash('info', 'New session. <strong>'
                                  + req.sessionID
                                  + '</strong>');
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end('regenerated session.');
                    });
                }
            });
        }
    ).listen(3000);
    
    sys.puts('Connect server started on port 3000');


## Test

TODO
