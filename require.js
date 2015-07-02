
;(function(root) {

  function require(p) {
      var path = require.resolve(p)
        , mod = require.modules[path];

      // weepy: following line added
      if (!mod) mod = require.load(path); 

      if (!mod) throw new Error('failed to require "' + p + '"');

      if (!mod.exports) {
        mod.exports = {};

        // weepy: added __filename and __dirname
        var bits = path.split('/')
          , __filename = bits.pop() + '.js'
          , __dirname = bits.join('/')

        
        mod.call(null, mod, mod.exports, require.relative(path), __filename, __dirname);
      }
      return mod.exports;
    }

  require.modules = {};

  require.prefix = ""

  require.resolve = function (path){
      path = require.prefix + path
      var orig = path
        , reg = path + '.js'
        , index = path + '/index.js';
      return require.modules[reg] && reg
        || require.modules[index] && index
        || orig;
    };

  require.register = function (path, fn){
      require.modules[path] = fn;
    };

  require.relative = function (parent) {
      return function(p){
        if ('.' != p.charAt(0)) return require(p);

        var path = parent.split('/')
          , segs = p.split('/');
        path.pop();


        var relative_path = path.concat(segs)
        var normalized = []

        for (var i = 0; i < relative_path.length; i++) {
          var seg = relative_path[i];

          if ('..' == seg && normalized.length && normalized[normalized.length-1].charAt(0) != ".") {
            normalized.pop();
          }
          else if('.' == seg && normalized.length) {
            //
          }
          else
            normalized.push(seg)
        }

        return require(normalized.join('/'));
      };
    };


  var compilers = require.compilers = {
    js: function(text) {
      return text
    },
    json: function(text) {
        try {
          JSON.parse(text)
        } catch(e) {
          console.error("BAD JSON @ " + text, e)
          return  
        }
        return "module.exports = " + text
    },
    txt: function(text) {
        return "module.exports = " + JSON.stringify(text)
    }
  }

  // weepy: following added
  require.load = function( path ) {

      var orig_path = path
      var request = new XMLHttpRequest();
      
      if(path.match(/\.[^./]+$/)) {
        // has extension

      } else {
        path += ".js"
      }

      var ext = path.split(".").pop()

      request.open('GET', path, false);
      request.send();          
      var data = request.responseText;

      if(!request.responseText || !request.responseText.length)
        console.log("FAILED to load ", path)
      
      console.log("xhr: ", path, " loaded ", request.responseText.length, " bytes")

      var compiler = compilers[ext] || compilers.txt

      var output = compiler(data) || ""

    
      var text = "require.register('" + orig_path + "', \
              function(module, exports, require, __filename, __dirname) {\n\n" 
              + output+ "\n\n\
            }); //@ sourceURL=" + path;    

      try {
        (window.execScript || function(text) {
            return window["eval"].call(window, text)
        })(text)
        
      }
      catch(e) {
        if(root.PARSEJS) {
          try {
            root.PARSEJS.parse(text)  
          } catch(e) {
            console.error('Syntax error in file ' + path + ' at line:' + (e.line-2) + ', col:' + e.col + '. ' + e.message) //, e.stack) //, e)
          }
        } else {
          console.error( "Syntax Error in file " + path + ": " + e.toString() )
        }
      }        
    




      return require.modules[ orig_path ];
    }

  root.require = require; 

})(window);
