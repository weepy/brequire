// Brequire - CommonJS support for the browser
function require(path) {
  var module = require.modules[path];
  if(!module) {
    throw("couldn't find module for: " + path);
  }
  if(!module.exports) {
    module.exports = {};
    module.call(module.exports, module, module.exports, require.bind(path));
  }
  return module.exports;
}

require.modules = {};

require.bind = function(path) {
  return function(p) {
    var fullPath = path.split('/');
    fullPath.pop();
    var parts = p.split('/');
    for (var i=0; i < parts.length; i++) {
      var part = parts[i];
      if (part == '..') fullPath.pop();
      else if (part != '.') fullPath.push(part);
    }
     return require(fullPath.join('/'));
  };
};

require.module = function(path, fn) {
  require.modules[path] = fn;
};

var to_load = []

// function normalize(rel, path) {
//   var fullPath = path.split('/');
//   fullPath.pop();
//   var parts = p.split('/');
//   for (var i=0; i < parts.length; i++) {
//     var part = parts[i];
//     if (part == '..') fullPath.pop();
//     else if (part != '.') fullPath.push(part);
//   }
//    return require(fullPath.join('/'));
// }

function join(cur, path) {
  var parts = path.split('/');
  var fullPath = cur.split("/")
  for (var i=0; i < parts.length; i++) {
    var part = parts[i];
    if (part == '..') fullPath.pop();
    else if (part != '.') fullPath.push(part);
  }
  return require(fullPath.join('/'));
}

/*
module.exports = function chain(fnList, complete) {
  var self = this
  var results = []

  function run(i) {
    if(i == fnList.length) return complete(results)      
    fnList[i].call(self, function(answer) {
      results[i] = answer
      run.call(self, i+1)
    })
  }
  run.call(self, 0)
}
*/

asyncLoadModules = function(rel, paths, complete) {
  var jobs = [path]
  
  function run() {
    var job = jobs.unshift()
    
    load(url, function(text) { 
      
    })
  }
  
  load(url, function(text) {    
    var r = /require *(['"]([^()])*['"])/
    modules = []
    while(m = r.exec(text)) {
      jobs.push({
        rel: rel
        path: join(cur, m[1])
      })
    }
    asyncLoadModules(rel, modules, function() {
      
    })
    var moduleText = "require.module('" + url + "', function(module, exports, require) {\n " + text + "\n});"
  })
}


function load(url, callback) {
  var xhr = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
  xhr.open('GET', url, true);
  if ('overrideMimeType' in xhr) xhr.overrideMimeType('text/plain');
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) callback(url, xhr.responseText)
  }
  try xhr.send(null)
  catch(e) console.log("failed loading: " + url)
}