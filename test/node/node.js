var text = "var x = 1;"
var file = "test"
var js = require("brequire").compile(file, text)
var expected = "require.module('./" + file + "', function(module, exports, require) {\n// start module: " + file + "\n\n" + text + "\n\n// end module: "+ file +"\n});\n"

if(js != expected) {
  console.log("FAILED:", js, "!=", expected)
}
else {
  console.log("OK")
}