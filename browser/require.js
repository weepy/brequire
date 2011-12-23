// Brequire - CommonJS support for the browser
function require(p) {
  var path = require.resolve(p)
  var module = require.modules[path]
  if(!module) return
  if(!module.exports) {
    module.exports = {}
    module.call(module.exports, module, module.exports, require.bind(path))
  }
  return module.exports
}

require.modules = {}


require.resolve = function(path) {
  if(require.modules[path]) return path

  if(!path.match(/\.js$/)) {
    if(require.modules[path+".js"]) return path + ".js"
    if(require.modules[path+"/index.js"]) return path + "/index.js"
    if(require.modules[path+"/index"]) return path + "/index"    
  }
}

require.relative = function(file, file2) {
  if(!file.match(/^\./)) return file

  function dir(file) {
    var parts = file.split('/');
    parts.pop();
    return parts.join("/")
  }

  var parts = (dir(file2) + "/" + file).split('/')
  var ret = []

  for (var i=0; i < parts.length; i++) {        
    var part = parts[i]
    if (part == '..') {
      var last = ret.pop()
      if(last == "." || !last) ret.push("..")
    }
    else if (i == 0 || part != '.') ret.push(part)
  }
  return ret.join("/")
}

require.bind = function(path) {
  return function() {
    var args = Array.prototype.slice.call(arguments)
    if(args[0].match(/^\./)) args[0] = require.relative(args[0], path)
    return require.apply(this, args)
  }
}

require.define = function(path, deps, mod) {
  mod.dependencies = deps
  return require.modules[path] = mod
}


require.script = function() {
  for(var i=0; i<arguments.length; i++) {
    var path = arguments[i]
    if(!path.match(/\.js$/)) path += ".js"
    document.write("<script src='" + path + "' type='text/javascript'></scr" + "ipt>")
  }
}