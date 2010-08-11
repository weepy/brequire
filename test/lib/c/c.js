require.module('./c/c', function(exports, require) {
// start module 

exports.two = require("../a").two
exports.x = "error"

// end module
})