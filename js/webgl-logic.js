var gl;
var textureCreator;
var app;
var shaderProgram;
var shaderProgram2;
var camera;
var scene;
var eventManager;

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
    eventManager.handleKeys();
    scene.drawScene();
}


function webGLStart() {
    var canvas = document.getElementById("lesson12-canvas");

    initGL(canvas);

    app = new OrreryApp(gl);

    scene = new Scene(gl);

    camera = new Camera();

    eventManager = new EventManager(canvas);

    shaderProgram = app.initShaders("shader-fs", "shader-vs", Config.shaderAttributes, Config.shaderUniforms);

    shaderProgram2 = app.initShaders("shader-fs-skybox", "shader-vs", Config.skyboxShaderAttributes, Config.skyboxShaderUniforms);

    app.initialiseBuffers(Config.shaderBuffers);

    textureCreator = new TextureCreator(Config.textureNames, Config.textureImages);

    scene.setupScene();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}
