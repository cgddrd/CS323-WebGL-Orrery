var gl;
var textureCreator;
var app;
var shaderProgram;
var camera;
var scene;

function initGL(canvas) {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {}
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function tick() {
    requestAnimFrame(tick);
    camera.handleKeys();
    scene.drawScene();
}


function webGLStart() {
    var canvas = document.getElementById("lesson12-canvas");

    initGL(canvas);

    app = new OrreryApp(gl);

    camera = new Camera(canvas);

    shaderProgram = app.initShaders(Config.shaderAttributes, Config.shaderUniforms);

    app.initialiseBuffers(Config.shaderBuffers);

    textureCreator = new TextureCreator(Config.textureNames, Config.textureImages);

    scene = new Scene(gl);

    scene.setupScene();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}
