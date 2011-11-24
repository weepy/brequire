+function(global) {
  
  // Brequire - CommonJS support for the browser

  /********************
   *****   SYNC   *****
   ********************/
  
  function require(p, async) {

    if(async) return require.async(p, async)
    
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
    return "define('" + url + "', function(module, exports, require) {\n" + text + "\n});"
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

  require.def = function define(path, mod) {
    return require.modules[path] = mod;
  }

  var queue = {
    jobs: [],
    run: function() {
      var job = this.jobs[0]
      var self = this
      job && job(function() {
        self.jobs.shift()
        self.run()
      })
    }
  }

  function folder(path) {
    var folders = path.split("/")
    folders.pop()
    return folders.join("/")
  }

  /****************** 
   ***** ASYNC ******
   ******************/

  var queue = {
    jobs: [],
    run: function() {      
      var job = queue.jobs[0]
      job && job(function() {
        queue.jobs.shift()
        queue.run()
      })
    },
    add: function(job) {
      queue.jobs.push(job)
      if(queue.jobs.length == 1) queue.run()
    }
  }

  require.async = function(path, callback) {
    queue.add(function(next) {
      async_loader(path, function(module) {
        callback(module)
        next()
      })
    })
  }

  function async_loader(path, complete) {
    var mod = require.resolve(path)
    if(mod) return complete(mod) 

    load_async_module_with_deps(path, function(mod, deps) {
      +function run() {
        if(!deps.length) return complete(mod)
        async_loader(deps.shift(), function() {
          run()
        })
      }()
    })
  }

  function load_async_module_with_deps(path, callback) {
    if(!path.match(/\.js$/)) path += ".js"

    xhr(path, function(u, text) {
      var mod = eval(require.compile(path, text) + "//@ sourceURL=" + path)
      require.def(path, mod)
      callback(mod, extract_dependencies(text))
    })
  }

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
      console.log("failed loading: " + url)
    }
  }

  // EXPORT 
  global.require = require
  global.define = require.def

}(this);