# require

Dropin `require` polyfill for the browser

Really useful in development for when you don't want to crank up browserify.

Super simple.

Fully swappable with browserify and friends in production.

# Installation

1) Include the script and serve it (it won't work direct from the filesystem due to browser security)


```
<script src='require.js'></script>
```

or use it direct from rawgit

```
<script src='//rawgit.com/weepy/brequire/master/require.js'></script>
```


2) Code like a boss

3) You can optionally include the PARSEJS library which will help point point any syntax errors in your code whilst

# Compilers

You can add compilers for coffeescript, css, JSX or whatever in very simply by registering a handler like 

```
require.compilers.css = function(text) {

    var style = document.createElement('style');
	style.appendChild(document.createTextNode(text));
	document.head.appendChild(style);
}
```

This will allow you to include css on page like :

```
require("./style.css")
```


# Production

It uses Sync XHR which is great for development, but not so much in production.

Forunately, you can swap out this library with browserify or similar in production.

