require.module('b', function(exports, require) {
// start module 

exports.one = require("./a").one
exports.two = require("./c/c").two

// end module
})