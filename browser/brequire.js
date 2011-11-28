// Brequire - CommonJS support for the browser

+function(global) {
  // Sync Require  
  
  var require = function(p) {
    var path = require.resolve(p)
    var module = require.modules[path]
    if(!module) throw("couldn't find module for: " + p)
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

  require.compile = function(url, text) {
    return "define('" + url + "', [], function(module, exports, require) {\n" + text + "\n});"
  }


  function normalize(path) {
    var fullPath = path.split('/');
    fullPath.pop();
    var parts = p.split('/');
    for (var i=0; i < parts.length; i++) {
      var part = parts[i];
      if (part == '..') fullPath.pop();
      else if (part != '.') fullPath.push(part);
    }
    return fullPath.join('/')
  }

  require.bind = function(path) {
    return function(p) {
      if(!p.match(/^\./)) return require(p)
      return require(normalize(path));
    }
  }

  function define(path, deps, mod) {
    mod.deps = deps
    return require.modules[path] = mod;
  }

  // EXPORT 
  global.require = require
  global.define = require.def = define

}(this)


!function(global) {
  // Adds in async support

  // wrap the sync require module
  var sync_require = require
  global.require = function(p, async, deps) {
    async
      ? require.async(p, async, deps)
      : sync_require(p)
  }
  for(var i in sync_require) require[i] = sync_require[i]
  
  require.async = function(path, callback, deps) {
    deps = deps || []
    var our_mod
    (function run(path) {
      load(path, function(mod, new_deps) {
        our_mod || (our_mod = mod) // we want the first one
        deps = new_deps.concat(deps)
        var dep = deps.shift()
        if(!dep) return callback(our_mod)  
        run(dep)
      })
    })(path)
  }

  function load(path, callback) {
    var mod, l
    if(!path.match(/\.js$/)) path += ".js"

    if(mod = require.resolve(path)) { return callback(mod) }

    if(l = load.loaders[path]) {
      l.callbacks.push(callback)
      return l
    }

    var loader = { callbacks: [callback] }

    xhr(path, function(u, text) {
      var mod = require.eval(require.compile(path, text) + "//@ sourceURL=" + path)
      var deps = extract_dependencies(text)
      require.def(path, deps, mod)
      for(var i=0; i<loader.callbacks.length; i++) {
        loader.callbacks[i](mod, deps)
      }
    })

    load.loaders[path] = loader
    return loader
  }

  load.loaders = {}


  function extract_dependencies(text) {
    var requires = text.match(/require\s*\('\s*([^'])*'\s*\)|require\s*\("\s*([^"])*"\s*\)/g)

    if(!requires) return []
    for(var i=0; i< requires.length; i++) {
      requires[i] = requires[i].replace(/^require\s*\(\s*["']/, "").replace(/["']\s*\)$/,"")
    }
    return requires
  }

  function xhr(url, callback) {
    console.log("loading " + url)
    var xhr = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
    xhr.open('GET', url, true);
    if ('overrideMimeType' in xhr) xhr.overrideMimeType('text/plain');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) callback(url, xhr.responseText)
    }
    try { 
      xhr.send(null)
    }
    catch(e) {
      console.error("failed loading: " + url)
    }
  }

}(this)

require.eval = function(text) { return eval(text) }