+function(global) {
  var require_sync = require
  global.require = function(path) {
    return arguments.length > 1
      ? require.async.apply(global, arguments)
      : require.sync(path)
  }
  for(var i in require_sync) require[i] = require_sync[i]

  require.sync = require_sync
  
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

  require.compile = function(name, ext, text) {
    text = require.compilers[ext](text)
    return "define('" + name + "', [], function(module, exports, require) {\n" + text + "\n});"
  }
  require.compilers = {}
  require.registerExtension = function(ext, fn) {
    require.compilers[ext] = fn    
  }
  require.registerExtension(".js", function(text) { return text } )

  function load(module_name, callback) {
    var mod, l
    var ext = module_name.match(/\.[a-zA-Z0-9_]*$/)
    if(ext) {
      var path = module_name  
      ext = ext[0]
    } else {
      var path = module_name + ".js"
      ext = ".js"
    }

    if(mod = require.resolve(path)) { return callback(mod, []) }

    if(l = load.loaders[path]) {
      l.callbacks.push(callback)
      return l
    }

    var loader = { callbacks: [callback] }

    xhr(path, function(u, text) {
      var mod = require.globalEval(require.compile(path, ext, text) + "//@ sourceURL=" + u)
      var deps = extract_dependencies(text)
      define(path, deps, mod)
      for(var i=0; i<loader.callbacks.length; i++) {
        loader.callbacks[i](mod, deps)
      }
    })

    load.loaders[path] = loader
    return loader
  }
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

require.globalEval = function(text) { 
  return (window.execScript || function(text) {
    return window["eval"].call(window, text)
  })(text)
}