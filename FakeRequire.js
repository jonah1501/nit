"use strict";
if (!module) {
    var module = {};
}
if (!module.exports) {
    module.exports = {};
}

function require (src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    if (callback) {
    	script.onload = callback;
	}
    document.getElementsByTagName('head')[0].appendChild(script);
    return module.exports;
}