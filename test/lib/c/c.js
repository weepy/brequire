require.module('./c/c', function(module, exports, require) {
// start module: c/c

exports.two = require("../a").two;
exports.x = "error";

// end module: c/c
});
