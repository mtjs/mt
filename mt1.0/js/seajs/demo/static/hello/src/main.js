define(function(require) {
	  console.log('before require 1.0.7');
  var Spinning = require('./spinning');
  console.log('after require 1.0.7');
  var s = new Spinning('#container');
  s.render();

});

