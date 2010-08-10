// simple library providing CommonJS require support for the browser
function require(path) {
  var module = require.modules[path]
  if(!module.exports) {
    module.exports = {}
    module.call(module.exports, module.exports, bind(path))
  }
  return module.exports
}

require.modules = {}

function bind(path) {
  var cwd = path.replace(/[^\/]*$/,"")
  return function(p) {
    p = (cwd + p).replace(/\/\.\//, "/").replace(/[^/]*\/\.\./,"").replace(/\/\//,"/")
    return require(p)
  }  
}

require.module = function(path, fn) {
  require.modules["./" + path] = fn
}