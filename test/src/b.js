exports.x = 4
var o = require("./o").o 
console.log(o.x , "= first")
exports.one = require("./a").one
console.log(o.x, "= second")
exports.two = require("./c/c").two

