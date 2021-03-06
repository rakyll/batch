
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;

/**
 * Expose `Batch`.
 */

module.exports = Batch;

/**
 * Create a new Batch.
 */

function Batch() {
  EventEmitter.call(this); 
  this.fns = [];
  for (var i = 0, len = arguments.length; i < len; ++i) {
    this.push(arguments[i]);
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Batch.prototype.__proto__ = EventEmitter.prototype;

/**
 * Queue a function.
 *
 * @param {Function} fn
 * @return {Batch}
 * @api public
 */

Batch.prototype.push = function(fn){
  this.fns.push(fn);
  return this;
};

/**
 * Execute all queued functions in parallel,
 * executing `cb(err, results)`.
 *
 * @param {Function} cb
 * @return {Batch}
 * @api public
 */

Batch.prototype.end = function(cb){
  var that = this
    , pending = this.fns.length
    , results = []
    , done;

  if (!this.fns.length) return cb(null, results);

  this.fns.forEach(function(fn, index){
    fn(function(err, res){
      if (done) return;
      if (err) return done = true, cb(err);
      
      results[index] = res;
      pending--;
      
      that.emit('progress', res, index, that.fns.length, pending);
      pending || cb(null, results);
    });
  });

  return this;
};