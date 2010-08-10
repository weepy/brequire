Brequire
========

Brings exact CommonJS (require, exports) functionality to the Browser.

It has two parts: 

1) A simple compiler that wraps your files in a closure that injects bound of require and exports, so you can use the exact same code client side.

2) A simple require script

Use
---

bin/brequire source dest

This will recursively compile all .js files in source to a target directory (dest)

The scripts can be loaded by any means and 'required' into the main scope as necessary.

Example
-------

run:

bin/brequire test/src test/lib
open test/index.html


