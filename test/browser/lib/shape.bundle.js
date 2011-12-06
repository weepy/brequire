define('./pi.js', [], function(module, exports, require) {
module.exports = 3
}); // end module: ./pi.js

define('./shape.js', [], function(module, exports, require) {
module.exports = function Shape() {
  
}
}); // end module: ./shape.js

define('./shapes/circle.js', [], function(module, exports, require) {
var pi = require("../pi"),
    shape = require("../shape")

function Circle(r) {
  this.radius = r
}

Circle.__proto__ = shape

Circle.prototype.area = function() {
  return pi * this.radius * this.radius
}
module.exports = Circle
}); // end module: ./shapes/circle.js

