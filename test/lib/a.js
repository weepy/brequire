require.module('./a', function(exports, require) {
// start module: a

exports.one = 1;
exports.two = 2;
exports.x = "ok";
log("should only see me once");

var o = require("./o").o;
o.x = "second";

// end module: a
});
