define('user_alt/admin/index.js', [], function(module, exports, require) {
module.exports = "admin"
}); // end module: user_alt/admin/index.js

define('user_alt/index.js', [], function(module, exports, require) {
module.exports = require("./admin")
}); // end module: user_alt/index.js

