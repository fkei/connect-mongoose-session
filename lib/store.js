/** 
 * @fileOverview Connect Mongoose
 * @name store.js
 * @author Kei Funagayama <kei.topaz@gmail.com>
 * @license MIT or GPLv2
 */

var Store = require('connect').session.Store;
var mongoose = require('mongoose');

var Session = require('./schema').Session;

/**
 * @param {Array} urls Connection URL
 * @param {JSON} options
 * @param {function} callback
 */
var MongooseStore = function(urls, options, callback) {
    var self = this;

    this.urls = urls || ['mongodb://127.0.0.1:27017/development'];
    this.options = options || {};

    var mapping = function(err) {
        // Mapping
        self.model = self.connect.model('Session', Session);
        if (callback) {
            callback();
        }
    };
    
    // Extends
    Store.call(this, this.options);

    if (1 < this.urls.length) {
        // Replica sets
        this.connect = mongoose.createSetConnection(this.urls.join(','), mapping);
    } else {
        // Single or mongos
        this.connect = mongoose.createConnection(this.urls[0], mapping);
    }

    // Store clear
    if (this.options.lifecheck !== -1) {
        this.lifecheck = setInterval(function () {
            self.model.remove({expires: {'$lte': Date.now()}}, function() {});
        }, this.options.lifecheck || 24 * 60 * 60 * 1000, this); // default: 1 day
    }
};

//MongooseStore.prototype.__proto__ = Store.prototype;
var proto = '__proto__';
MongooseStore.prototype[proto]= Store.prototype;

module.exports = MongooseStore;

/**
 * Get the session data.
 * @param {String} uid session id
 * @param {function} callback
 */
MongooseStore.prototype.get = function(uid, callback) {
    this.model.findById(uid, function(err, data) {
        if (!err && data) {
            callback(null, data.doc.session); // Reuse
        } else {
            callback(err); // New
        }
    });
};

/**
 * To update the session data.
 * @param {String} uid session id
 * @param {Session} session update data
 * @param {function} callback
 */
MongooseStore.prototype.set = function(uid, session, callback) {
    var s = {session: JSON.parse(JSON.stringify(session))};
    
    if (session && session.cookie && session.cookie.expires) {
        if (session.cookie._expires) {
            s.expires = Date.parse(session.cookie._expires);
        } else if (session.cookie.expires) {
            s.expires = Date.parse(session.cookie.expires);
        }
    }

    this.model.update({_id: uid}, s, {upsert:true}, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};

/**
 * To delete the session data.
 * @param {String} uid session id
 * @param {function} callback
 */
MongooseStore.prototype.destroy = function(uid, callback) {
    this.model.remove({_id:uid}, function(err, result){
        if (err) {
            return callback(err); // Failure to remove
        }
        callback(null, result);
    });
};

/**
 * Get the number of session store.
 * @param {function} callback
 */
MongooseStore.prototype.count = MongooseStore.prototype.length = function(callback) {
    this.model.count({}, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(err, result);
    });
};

/**
 * Clearing session data.
 * @param {function} callback
 */
MongooseStore.prototype.clear = function(callback) {
    this.model.remove({}, function(err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
