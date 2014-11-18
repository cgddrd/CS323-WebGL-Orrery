/**
 * Provides "main" application functions that cannot be feasibly seperated into a specfic module of functionality and access point for "shared" objects (e.g. WebGl reference, 'Scene', 'Camera' 'EventManager etc..)
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 * @param {DOM object} canvas - Reference to HTML5 DOM 'Canvas' object used for mouse interaction.
 *
 * Portions of this code have been modified from original code available at: http://learningwebgl.com/blog/?p=571
 */
function OrreryApp(canvas) {
    this.gl;
    this.buffers = {};
    this.scene;
    this.camera;
    this.eventManager;
    this.mainShaderProgram;
    this.skyboxShaderProgram;
    this.textureCreator;
    this.canvas = canvas;
}

/**
 * Performs main application initialisation process, including initialising many core application "modules" including 'TextureCreator', 'Scene', 'Camera' and WebGL shader programs.
 */
OrreryApp.prototype.init = function() {

    this.initGL(this.canvas);

    this.initialiseBuffers(Config.shaderBuffers);

    this.textureCreator = new TextureCreator(Config.textureNames, Config.textureImages, Config.textureFileURLRoot);

    this.camera = new Camera();

    this.eventManager = new EventManager();

    //Set-up the "main" shader program with WebGL.
    this.mainShaderProgram = this.initShaders("shader-fs", "shader-vs", Config.shaderAttributes, Config.shaderUniforms);

    //Set-up the dedicated skybox shader program with WebGL.
    this.skyboxShaderProgram = this.initShaders("shader-fs-skybox", "shader-vs", Config.skyboxShaderAttributes, Config.skyboxShaderUniforms);

    this.scene = new Scene();

    //Set-up the scene - Create the scene-graph etc.
    this.scene.setupScene(this);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    //Trigger main application (re-)rendering loop.
    this.tick();
}

/**
 * Performs the continous re-rendering of the scene. (Main application loop)
 */
OrreryApp.prototype.tick = function() {

    //Begin a new application rendering cycle.
    requestAnimFrame(this.tick.bind(this));

    //Handle any key input from the user.
    this.eventManager.handleKeys();

    //Process any changes to the scene and re-draw.
    this.scene.drawScene(this);
}

/**
 * Initialises the WebGl library via the HTML5 'Canvas' object.
 * @param {DOM object} canvas - Reference to HTML5 DOM 'Canvas' object used for mouse interaction.
 */
OrreryApp.prototype.initGL = function(canvas) {

    //Set the HTML5 canvas width and height to size of the current web browser window (force full-screen canvas)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Attempt to get a reference to the WebGL library within the browser.
    try {

        //Use cross-compatible approach to initialising WebGl reference.
        this.gl = WebGLUtils.setupWebGL(canvas);
        this.gl.viewportWidth = canvas.width;
        this.gl.viewportHeight = canvas.height;

    } catch (e) {}

    if (!this.gl) {
        alert("Could not initialise WebGL. Please ensure you are using an up-to-date browser.");
    }
}

/**
 * Creates and initialises all references to WebGl shader 'attribute' and 'uniform' variables for use within the application.
 * @param {string} fragmentShaderID - ID of the DOM containing the WebGL fragment shader code for the current shader program.
 * @param {string} vertexShaderID - ID of the DOM containing the WebGL vertex shader code for the current shader program.
 * @param {string[]} shaderAttributes - Array of WebGL shader 'attribute' variables to be referenced and initialised for use within the application.
 * @param {string[]} shaderUniforms - Array of WebGL shader 'uniform' variables to be referenced and initialised for use within the application.
 */
OrreryApp.prototype.initShaders = function (fragmentShaderID, vertexShaderID, shaderAttributes, shaderUniforms) {

    //Get the GLSL shader code for the fragment and vertex shaders.
    var fragmentShader = this.getShader(fragmentShaderID);
    var vertexShader = this.getShader(vertexShaderID);

    //Create a new WebGL shader program.
    var shaderProgram = this.gl.createProgram();

    //Add the GLSL code to the new shader program.
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    this.gl.useProgram(shaderProgram);

    //Set-up the references to the WebGL shader 'attribute' and 'uniform' variables.
    this.initialiseShaderAttributes(shaderProgram, shaderAttributes);
    this.initialiseShaderUniforms(shaderProgram, shaderUniforms);

    return shaderProgram;

}

/**
 * Creates references to WebGl shader 'attribute' variables for use within the application.
 * @param {object} shaderProgram - Reference to WebGL shader program whose attributes are to be referenced in the application.
 * @param {string[]} shaderAttributes - Array of WebGL shader 'attribute' variables to be referenced and initialised for use within the application. (Taken from configuration file (Config.js))
 */
OrreryApp.prototype.initialiseShaderAttributes = function (shaderProgram, shaderAttributes) {

    //Loop through each of the provided shader 'attribute' variable names, creating a reference in the application and initialising with WebGL.
    for (var i = 0, max = shaderAttributes.length; i < max; i++) {
        shaderProgram[shaderAttributes[i]] = this.gl.getAttribLocation(shaderProgram, shaderAttributes[i]);
        this.gl.enableVertexAttribArray(shaderProgram[shaderAttributes[i]]);
    }
}

/**
 * Creates references to WebGl shader 'uniform' variables for use within the application.
 * @param {object} shaderProgram - Reference to WebGL shader program whose attributes are to be referenced in the application.
 * @param {string[]} shaderUniforms - Array of WebGL shader 'uniform' variables to be referenced and initialised for use within the application. (Taken from configuration file (Config.js))
 */
OrreryApp.prototype.initialiseShaderUniforms = function (shaderProgram, shaderUniforms) {
    for (var i = 0, max = shaderUniforms.length; i < max; i++) {
        shaderProgram[shaderUniforms[i]] = this.gl.getUniformLocation(shaderProgram, shaderUniforms[i]);
    }
}

/**
 * Extracts and returns the GLSL shader code from the specified HTML DOM element.
 * @param {string} id - ID of the HTML DOM element containing the required GLSL shader code.
 */
OrreryApp.prototype.getShader = function (id) {

    var shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    } else {
        return null;
    }

    this.gl.shaderSource(shader, str);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        alert(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

/**
 * Initialises and creates all WebGL position, normal and index buffers for all geometric shapes required within the application. (Sphere, cube and square).
 * @param {string[]} shaderBuffers - Collection of buffer keys to be used to initialise the buffer values within WebGL and reference in the application.
 *
 * Portions of this function have been modified from original code available at: http://learningwebgl.com/blog/?p=1253 and http://learningwebgl.com/blog/?p=370
 */
OrreryApp.prototype.initialiseBuffers = function (shaderBuffers) {

    //Create a new object for each buffer specified in the application configuration file (Config.js)
    for (var i = 0, max = shaderBuffers.length; i < max; i++) {

        this.buffers[shaderBuffers[i]] = {};
    }

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    this.buffers["planetVertexNormalBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["planetVertexNormalBuffer"]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normalData), this.gl.STATIC_DRAW);
    this.buffers["planetVertexNormalBuffer"].itemSize = 3;
    this.buffers["planetVertexNormalBuffer"].numItems = normalData.length / 3;

    this.buffers["planetVertexTextureCoordBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["planetVertexTextureCoordBuffer"]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordData), this.gl.STATIC_DRAW);
    this.buffers["planetVertexTextureCoordBuffer"].itemSize = 2;
    this.buffers["planetVertexTextureCoordBuffer"].numItems = textureCoordData.length / 2;

    this.buffers["planetVertexPositionBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["planetVertexPositionBuffer"]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), this.gl.STATIC_DRAW);
    this.buffers["planetVertexPositionBuffer"].itemSize = 3;
    this.buffers["planetVertexPositionBuffer"].numItems = vertexPositionData.length / 3;

    this.buffers["planetVertexIndexBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers["planetVertexIndexBuffer"]);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), this.gl.STREAM_DRAW);
    this.buffers["planetVertexIndexBuffer"].itemSize = 1;
    this.buffers["planetVertexIndexBuffer"].numItems = indexData.length;

    this.buffers["cubeVertexPositionBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["cubeVertexPositionBuffer"]);
    vertices = [
      // Front face
      -1.0, -1.0, 1.0,
       1.0, -1.0, 1.0,
       1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
       1.0, 1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0,
      -1.0, 1.0, 1.0,
       1.0, 1.0, 1.0,
       1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0, 1.0, -1.0,
       1.0, 1.0, 1.0,
       1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.buffers["cubeVertexPositionBuffer"].itemSize = 3;
    this.buffers["cubeVertexPositionBuffer"].numItems = 24;

    // -- SET cube TEXTURES --

    this.buffers["cubeVertexTextureCoordBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["cubeVertexTextureCoordBuffer"]);
    var textureCoords = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
    this.buffers["cubeVertexTextureCoordBuffer"].itemSize = 2;
    this.buffers["cubeVertexTextureCoordBuffer"].numItems = 24;

    // -- SET CUBE VERTICES INDEX BUFFER --

    this.buffers["cubeVertexIndexBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers["cubeVertexIndexBuffer"]);

    var cubeVertexIndices = [
      0, 1, 2, 0, 2, 3, // Front face
      4, 5, 6, 4, 6, 7, // Back face
      8, 9, 10, 8, 10, 11, // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23 // Left face
    ]

    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), this.gl.STATIC_DRAW);
    this.buffers["cubeVertexIndexBuffer"].itemSize = 1;
    this.buffers["cubeVertexIndexBuffer"].numItems = 36;

    this.buffers["squareVertexPositionBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["squareVertexPositionBuffer"]);
    vertices = [
         1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.buffers["squareVertexPositionBuffer"].itemSize = 3;
    this.buffers["squareVertexPositionBuffer"].numItems = 4;

    this.buffers["squareVertexTextureCoordBuffer"] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers["squareVertexTextureCoordBuffer"]);

    texvert = [1.0, 0.0,
              0.0, 0.0,
              1.0, 1.0,
              0.0, 1.0];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texvert), this.gl.STATIC_DRAW);

    this.buffers["squareVertexTextureCoordBuffer"].itemSize = 2;
    this.buffers["squareVertexTextureCoordBuffer"].numItems = 4;

}

/**
 * Returns the collection of WebGL buffers.
 */
OrreryApp.prototype.getBuffers = function() {
    return this.buffers;
}

/**
 * Returns the application reference to the WebGL library.
 */
OrreryApp.prototype.getGL = function() {
    return this.gl;
}

/**
 * Returns the instance of the application 'Camera' object.
 */
OrreryApp.prototype.getCamera = function() {
    return this.camera;
}

/**
 * Returns the instance of the "main" WebGL shader program.
 */
OrreryApp.prototype.getMainShaderProgram = function() {
    return this.mainShaderProgram;
}

/**
 * Returns the instance of the dedicated WebGL shader program for the scene skybox.
 */
OrreryApp.prototype.getSkyboxShaderProgram = function() {
    return this.skyboxShaderProgram;
}

/**
 * Returns the instance of the application 'Scene' object.
 */
OrreryApp.prototype.getScene = function() {
    return this.scene;
}

/**
 * Returns the instance of the application 'TextureCreator' object.
 */
OrreryApp.prototype.getTextureCreator = function() {
    return this.textureCreator;
}

/**
 * Returns the instance of the application 'EventManager' object.
 */
OrreryApp.prototype.getEventManager = function() {
    return this.eventManager;
}
/**
 * Returns the instance of the HTML5 'Canvas' element.
 */
OrreryApp.prototype.getCanvas = function() {
    return this.canvas;
}
