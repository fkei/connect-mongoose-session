/**
 * @fileOverview MongoDB Schema
 * @name schema.js
 * @author Kei Funagayama <kei.topaz@gmail.com>
 * @license MIT or GPLv2
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Session = exports.Session = new Schema({
    _id : {type : String, required: true, index: true, unique: true},
    expires: {type: Date, index: true},
    session : {}
});
