/*var gl;
var textureCreator;
var app;
var shaderProgram;
var shaderProgram2;
var camera;
var scene;
var eventManager; */

var app;

function webGLStart() {
    var canvas = document.getElementById("lesson12-canvas");

    app = new OrreryApp(canvas);

    app.init();
}
