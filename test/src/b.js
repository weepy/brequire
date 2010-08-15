exports.x = 4;
var o = require("./o").o;
log(o.x , "= first");
exports.one = require("./a").one;
log(o.x, "= second");
exports.two = require("./c/c").two;

