// Brequire - CommonJS support for the browser

+function(global) {
  // Sync Require  
  
  // setup global key in window
  global.global = global 
    
  var require = function(p) {
    var path = require.resolve(p)
    var module = require.modules[path]
    if(!module) return undefined
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


  function dir(file) {
    var parts = file.split('/');
    parts.pop();
    return parts.join("/")
  }

  require.relative = function(file, file2) {
    var parts = (dir(file2) + "/" + file).split('/');
    var ret = []

    for (var i=0; i < parts.length; i++) {        
      var part = parts[i];
      if (part == '..') ret.pop();
      else if (i == 0 || part != '.') ret.push(part);
    }
    return ret.join("/")
  }

  require.bind = function(path) {
    return function(p) {
      if(!p.match(/^\./)) return require(p)
      return require(require.relative(p, path));
    }
  }

  function define(path, deps, mod) {
    mod.deps = deps
    return require.modules[path] = mod;
  }

  require.script = function() {
    for(var i=0; i<arguments.length; i++) {
      var path = arguments[i]
      if(!path.match(/\.js$/)) path += ".js"
      document.write("<script src='" + path + "' type='text/javascript'></scr" + "ipt>")
    }
  }

  // EXPORT 
  global.require = require
  global.define = require.def = define

}(this)

// Async support
!function(global) {
  
  // wrap the sync require module
  var sync_require = require
  global.require = function(p) {
    return arguments.length > 1
      ? require.async.apply(global, arguments) 
      : sync_require(p)
  }
  for(var i in sync_require) require[i] = sync_require[i]


  require.async = function() {
    var paths = Array.prototype.slice.call(arguments),
        callback = typeof paths[paths.length-1] == "function" && paths.pop(),
        deps = []
    
    for(var i=0; i<paths.length; i++) 
      deps.push(paths[i])

    function run(path) {
      load(path, function(mod, new_deps) {
        deps.splice(deps.indexOf(path), 1)
        var dep

        if(!deps.length && !new_deps.length) {
          var args = []
          for(var i=0; i<paths.length; i++) args.push(require(paths[i]))
          return callback && callback.apply(global, args)
        }

        while(dep = new_deps.shift()) {
          var p = require.relative(dep, path)
          deps.unshift(p)
          run(p)
        }
        
      })
    }


    for(var i=0; i<paths.length; i++) 
      run(paths[i])
  }

  function load(path, callback) {
    var mod, l
    if(!path.match(/\.js$/)) path += ".js"

    if(mod = require.resolve(path)) { return callback(mod, []) }

    if(l = load.loaders[path]) {
      l.callbacks.push(callback)
      return l
    }

    var loader = { callbacks: [callback] }

    xhr(path, function(u, text) {
      var mod = require.eval(require.compile(path, text) + "//@ sourceURL=" + u)
      var deps = extract_dependencies(text)
      require.def(path, deps, mod)
      for(var i=0; i<loader.callbacks.length; i++) {
        loader.callbacks[i](mod, deps)
      }
    })

    load.loaders[path] = loader
    return loader
  }
  // require.load = load
  load.loaders = {}


  function extract_dependencies(text) {
    var requires = text.match(/require\s*\('\s*([^'])*'\s*\)|require\s*\("\s*([^"])*"\s*\)/g) || []

    for(var i=0; i< requires.length; i++) {
      requires[i] = requires[i].replace(/^require\s*\(\s*["']/, "").replace(/["']\s*\)$/,"")
    }
    return requires
  }

  function xhr(url, callback) {
    // console.info("loading " + url)
    var xhr = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
    xhr.open('GET', url, true);
    if ('overrideMimeType' in xhr) xhr.overrideMimeType('text/plain');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if(xhr.responseText.length == 0) console.error(url + " is zero length")
        callback(url, xhr.responseText)
      }
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