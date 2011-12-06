Brequire
========

Brings exact CommonJS (require, exports) functionality to the Browser.

It has three parts:

1) A simple compiler that wraps your files in a closure that injects bound of require and exports, so you can use the exact same code client side.

2) A client side library that provides a require keyword

3) An optional clientside asynchronous require module

Install
------

npm install brequire

API
---

Create a an instance of the compiler with <code>require("brequire").module("path/to/my/module")</code>

The various options can then be set via method calls: 

* .search(path, /* path2, path3 etc... */) 
set the search paths for the scripts to load from the root. (defaults to '**.js')

* .write(path) 

wraps each file writes it to disk.
if _path_ ends with '.js': the files will all be bundled together into one script.
otherwise path is assumed to be a directroy and each file will be written out separately, the structure mirroring the src directory

* .module_base(name)
us this method to change the module base name

* .inspect()
output the current state of the compiler including the files to be processed (for debugging purposes)


Example Usage
---

<pre>
var brequire = require("brequire")

brequire
  .module("./test/shape")
  .write("./lib/shape.bundle.js")
</pre>

<pre>
brequire
  .module("./test/shape")
  .write("./test/browser/lib")
</pre>

<pre>
brequire
  .module("./test/user")
  .module_base("user_alt")
  .inspect()
  .write("./test/browser/lib/user.bundle.js")
</pre>


Include in your page
-------------------

<pre>
&lt;script src='browser/require.js'>&lt;/script>
&lt;script src='my/module.js''>&lt;/script>
&lt;script>
var app = require("./app")
// do stuff with app
&lt;/script>
</pre>

Async module
------------

require.async.js is an option module that hooks into require and provides an asynchronous require that loads modules via xhr. 
It also determines dependencies via static analysis and they are loaded in parallel. 

Note that require.async will autowrap the module - so there's no need for the server side compilation step.

Use like:

<pre>
&lt;script src='browser/require.js'>&lt;/script>
&lt;script src='my/module.js''>&lt;/script>
&lt;script>
require("./app", function(app) {
  // do stuff with app  
})
&lt;/script>
</pre>

Notes
-----


* require.async uses a regex to determine dependencies, which is solid with two caveats:
  * require's inside comments
  * dynamic calls to require (which will not be picked up)

* require.async works seemlessly with require, so if a dependency is already available, require.async will return immediately with no xhr


Test
----

expresso