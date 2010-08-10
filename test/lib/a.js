require.module('a', function(exports, require) {
// start module 

exports.one = 1
exports.two = 2
exports.x = "ok"
console.log("should only see me once")

var o = require("./o").o
o.x = "second"

// end module
})