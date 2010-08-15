require.module('./b', function(module, exports, require) {
// start module: b

exports.x = 4;
var o = require("./o").o;
log(o.x , "= first");
exports.one = require("./a").one;
log(o.x, "= second");
exports.two = require("./c/c").two;

log(require("./x")(), "= 1234")



// end module: b
});
