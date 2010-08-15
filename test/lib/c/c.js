require.module('./c/c', function(exports, require) {
// start module: c/c

exports.two = require("../a").two;
exports.x = "error";

// end module: c/c
});
