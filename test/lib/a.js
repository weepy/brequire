require.module('a', function(exports, require) {
// start module 

exports.one = 1
exports.two = 2
console.log("should only see me once")

// end module
})