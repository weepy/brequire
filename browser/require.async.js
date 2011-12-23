!function(global) {
  var require_sync = require
  global.require = function(path) {
    return arguments.length > 1
      ? require.async.apply(global, arguments)
      : require.sync(path)
  }
  for(var i in require_sync) require[i] = require_sync[i]

  require.sync = require_sync
  
  require.async = function() {
    var modules = Array.prototype.slice.call(arguments),
        callback = typeof modules[modules.length-1] == "function" && modules.pop(),
        deps = []
    
    for(var i=0; i<modules.length; i++) 
      deps.push(modules[i])

    function run(module) {

      load(module, function(mod, new_deps) {
        deps.splice(deps.indexOf(module), 1)
        
        var dep
        
        if(!deps.length && !new_deps.length) {
          var args = []
          for(var i=0; i<modules.length; i++)
            args.push(require(modules[i]))
          
          return callback && callback.apply(global, args)
            // && setTimeout(function() { callback.apply(global, args) }, 0)
        }

        var to_run = []
        while(dep = new_deps.shift()) {
          var p = require.relative(dep, module)
          deps.unshift(p)
          to_run.unshift(p)
        }

        // run them after adding to avoid race condition
        while(dep = to_run.shift()) run(dep)
      })
    }
    for(var i=0; i<modules.length; i++) 
      run(modules[i])
  }

  function wrap(name, ext, text, deps) {
    var deps2 = []
    for(var i =0; i < deps.length; deps++) deps2[i] = "'" + deps[i] + "'"
    return "require.define('" + name + "', [" + deps2.join(", ") + "], function(module, exports, require) {\n" + text + "\n});"
  }

  var compilers = {
    ".js": function(text) { return text }
  }

  require.registerExtension = function(ext, fn) {
    compilers[ext] = fn
  }

  require.sysPath = function(path) {
    return "./" + path
  }

  function load(module_name, callback) {
    var mod, l
    var ext = module_name.match(/\.[a-zA-Z0-9_]*$/)
    
    // if(module_name.match(/^[^.]/)) module_name = require.sysPath(module_name)

    if(ext) {
      var path = module_name  
      ext = ext[0]
    } else {
      var path = module_name + ".js"
      ext = ".js"
    }

    if(!path.match(/^\./)) path = require.sysPath(path)
  
    

    if(mod = require.resolve(path)) { return callback(mod, []) }
    if(l = load.loaders[path]) {
      l.callbacks.push(callback)
      return l
    }

    var loader = { callbacks: [callback] }
    
    XHR(path, function(u, text) {
      try {
        text = compilers[ext](text)
      }
      catch(e) {
        console.error("Error during compile: ", e)
        throw e 
      }
      
      var deps = extract_dependencies(text)
      text = wrap(module_name, ext, text, deps)

      try {
        var mod = require.globalEval(text + "//@ sourceURL=" + u)  
      } catch(e) {
        throw "Syntax Error in " + path + ": " + e.toString()
      }
      
      require.define(path, deps, mod)
      for(var i=0; i<loader.callbacks.length; i++)
        loader.callbacks[i](mod, deps)
    })

    load.loaders[path] = loader
    return loader
  }
  load.loaders = {}

  var regex = {
    all: /require\s*\('\s*([^'])*'\s*\)|require\s*\("\s*([^"])*"\s*\)/g,
    start: /require\s*\(\s*["']/,
    end: /["']\s*\)$/,
    comments: /\/\*.+?\*\/|\/\/.*(?=[\n\r])/g   // or /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm
  }

  function extract_dependencies(text) {
    text = text.replace(regex.comments, '')
    var requires = text.match(regex.all) || []
    for(var i=0; i< requires.length; i++) {
      requires[i] = requires[i].replace(regex.start, "").replace(regex.end, "")
    }
    return requires
  }

  function XHR(url, callback) {
    console.info("loading " + url)
    var xhr = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
    xhr.open('GET', url, true);
    if ('overrideMimeType' in xhr) xhr.overrideMimeType('text/plain');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if(xhr.responseText.length == 0) {
          if(url.match(/\.js$/)) {
            if(!url.match(/index\.js$/)) 
              XHR(url.replace(/\.js$/, "/index.js"), callback)
          }
          console.error(url + " is zero length")
        } else {
          callback(url, xhr.responseText)  
        }
        
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