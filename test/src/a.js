exports.one = 1
exports.two = 2
exports.x = "ok"
console.log("should only see me once")

var o = require("./o").o
o.x = "second"