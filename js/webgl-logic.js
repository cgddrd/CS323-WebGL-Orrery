var gl;
var sun, earth, mars, moon, mercury, venus, jupiter, saturn, uranus, neptune;
var zoom = 1.0;
var z = -50;
var x = 0;
var y = 0;

var textureCreator;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var userSpin = true;

var resetRotationMatrix = mat4.create();

var moonRotationMatrix = mat4.create();


var currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;

    if (String.fromCharCode(event.keyCode) == "S" && userSpin == true) {
        userSpin = false;
    } else if (String.fromCharCode(event.keyCode) == "S" && userSpin == false) {
        userSpin = true;
    }
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}


function handleMouseUp(event) {
    mouseDown = false;
}


function handleMouseMove(event) {

    if (!mouseDown) {
        return;
    }

    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degToRad(deltaX / 10), [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degToRad(deltaY / 10), [1, 0, 0]);

    mat4.multiply(moonRotationMatrix, newRotationMatrix, moonRotationMatrix);

    lastMouseX = newX;
    lastMouseY = newY;
}

function handleMouseWheel(event) {

    var delta = 0;

    if (!event) {
        event = window.event;
    }

    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }

    if (delta) {

        if (delta > 0) {
            zoom += 0.05;

        } else {
            zoom -= 0.05;

            if (zoom < 0.01) {
                zoom = 0.1;
            }
        }
    }

}

function setupScene() {

    sun = new Orbital("sun", [textureCreator.getTextures()["sunTexture"]], 0, 5, 3, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, 0, 0.5);

    mercury = new Orbital("mercury", [textureCreator.getTextures()["mercuryTexture"]], 120, 40, 0.3, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -10, 0.5);

    venus = new Orbital("venus", [textureCreator.getTextures()["venusTexture"]], 110, 35, 0.5, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -20, 0.5);

    earth = new Orbital("earth", [textureCreator.getTextures()["earthTexture"], textureCreator.getTextures()["cloudsTexture"], textureCreator.getTextures()["earthNightTexture"]], 100, 30, 0, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -30, 0.5);

    moon = new Orbital("moon", [textureCreator.getTextures()["moonTexture"]], 1000, 30, 0.2, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -5, 0.5);

    mars = new Orbital("mars", [textureCreator.getTextures()["marsTexture"]], 90, 30, 0, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -40, 0.5);

    jupiter = new Orbital("jupiter", [textureCreator.getTextures()["jupiterTexture"]], 50, 10, 2.5, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -50, 0.5);

    saturn = new Orbital("saturn", [textureCreator.getTextures()["saturnTexture"]], 40, 10, 2, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -60, 0.5);

    uranus = new Orbital("uranus", [textureCreator.getTextures()["uranusTexture"]], 20, 15, 1.5, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -70, 0.5);

    neptune = new Orbital("neptune", [textureCreator.getTextures()["neptuneTexture"]], 10, 15, 1.3, planetVertexPositionBuffer, planetVertexTextureCoordBuffer, planetVertexNormalBuffer, planetVertexIndexBuffer, -80, 0.5);

    sun.addChildOrbital(mercury);
    sun.addChildOrbital(venus);
    sun.addChildOrbital(earth);
    sun.addChildOrbital(mars);
    sun.addChildOrbital(jupiter);
    sun.addChildOrbital(saturn);
    sun.addChildOrbital(uranus);
    sun.addChildOrbital(neptune);

    earth.addChildOrbital(moon);


}

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


function getShader(gl, id) {
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
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initialiseShaderAttributes(shaderProgram, shaderAttributes) {

    for (var i = 0, max = shaderAttributes.length; i < max; i += 1) {
        shaderProgram[shaderAttributes[i]] = gl.getAttribLocation(shaderProgram, shaderAttributes[i]);
        gl.enableVertexAttribArray(shaderProgram[shaderAttributes[i]]);
    }

}

function initialiseShaderUniforms(shaderProgram, shaderUniforms) {

    for (var i = 0, max = shaderUniforms.length; i < max; i += 1) {
        shaderProgram[shaderUniforms[i]] = gl.getUniformLocation(shaderProgram, shaderUniforms[i]);
    }

}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    initialiseShaderAttributes(shaderProgram, Config.shaderAttributes);

    initialiseShaderUniforms(shaderProgram, Config.shaderUniforms);

}

function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    console.log(texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Check if the image is a power of 2 in both dimensions.
    if (Utils.isPowerOfTwo(texture.image.width) && Utils.isPowerOfTwo(texture.image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTextures(imageNames, imageURLs) {

    for (var i = 0; i < imageURLs.length; i++) {

        textures[imageNames[i]] = gl.createTexture();

        textures[imageNames[i]].image = new Image();

        textures[imageNames[i]].image.onload = (function (value) {
            return function () {
                handleLoadedTexture(textures[textureNames[value]]);
            }
        })(i);

        textures[imageNames[i]].image.src = imageURLs[i];

    }

    // return textureArray;
}


var mvMatrix = mat4.create();
var tMatrix = mat4.create();
var mvMatrixStack = [];

var lastMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    mvMatrixStack.push(mat4.clone(mvMatrix));
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.uTMatrix, false, tMatrix);

    var normalMatrix = mat3.create();

    mat3.normalFromMat4(normalMatrix, mvMatrix);

    gl.uniformMatrix3fv(shaderProgram.uNMatrix, false, normalMatrix);
}

var planetVertexPositionBuffer;
var planetVertexNormalBuffer;
var planetVertexTextureCoordBuffer;
var planetVertexIndexBuffer;
var cubeVertexIndexBuffer;
var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var squareVertexPositionBuffer;
var squareVertexTextureCoordBuffer;

function initBuffers() {

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

    planetVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    planetVertexNormalBuffer.itemSize = 3;
    planetVertexNormalBuffer.numItems = normalData.length / 3;

    planetVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    planetVertexTextureCoordBuffer.itemSize = 2;
    planetVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    planetVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    planetVertexPositionBuffer.itemSize = 3;
    planetVertexPositionBuffer.numItems = vertexPositionData.length / 3;

    planetVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    planetVertexIndexBuffer.itemSize = 1;
    planetVertexIndexBuffer.numItems = indexData.length;

    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    // -- SET cube TEXTURES --

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;

    // -- SET CUBE VERTICES INDEX BUFFER --

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    var cubeVertexIndices = [
      0, 1, 2, 0, 2, 3, // Front face
      4, 5, 6, 4, 6, 7, // Back face
      8, 9, 10, 8, 10, 11, // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23 // Left face
    ]

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    squareVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureCoordBuffer);

    texvert = [1.0, 0.0,
              0.0, 0.0,
              1.0, 1.0,
              0.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texvert), gl.STATIC_DRAW);

    squareVertexTextureCoordBuffer.itemSize = 2;
    squareVertexTextureCoordBuffer.numItems = 4;


}

var planetSpinAngle = 0;
var earthOrbitAngle = 0;
var marsOrbitAngle = 0;
var moonOrbitAngle = 0;
var sunOrbitAngle = 0;
var textureAngle = 0;

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 2000.0);

    // 2 * Math.PI = 360 degrees in radians.
    // We want to move the clouds of the earth along the X-axis (not the land and see however).
    // No of radians to move / 360 degrees in radians.
    mat4.translate(tMatrix, tMatrix, [Utils.degToRad(0.1) / (2 * Math.PI), 0, 0]);

    var lighting = true;
    
    gl.uniform1i(shaderProgram.uUseLighting, lighting);

    mat4.identity(mvMatrix);

    var lightPos = [0.0, 0.0, 0.0, 1.0];

    // CG - Move based on the user's input.
    mat4.translate(mvMatrix, mvMatrix, [x, y, z]);

    vec4.transformMat4(lightPos, lightPos, mvMatrix);

    // CG - Handle scene rotations (via mouse events)
    mat4.multiply(mvMatrix, mvMatrix, moonRotationMatrix);

    // CG - Handle scene zooming (via mouse wheel events)
    mat4.scale(mvMatrix, mvMatrix, [zoom, zoom, zoom]);

    mvPushMatrix();

    mat4.scale(mvMatrix, mvMatrix, [500, 500, 500]);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, textureCreator.getTextures()["spaceTexture"]);

    gl.uniform1i(shaderProgram.uSampler1, 0);
    gl.uniform1i(shaderProgram.uUseMultiTextures, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // NEW: Set-up the cube texture buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    setMatrixUniforms();

    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

    //CG - Add lighting after we have rendered the skybox.
    if (lighting) {

        gl.uniform3f(
            shaderProgram.uAmbientColor,
            parseFloat(0.2),
            parseFloat(0.2),
            parseFloat(0.2)
        );

        //CG - Move the position of the point light so that it is in the centre of the sun.
        gl.uniform3f(
            shaderProgram.uPointLightingLocation,
            parseFloat(lightPos[0]),
            parseFloat(lightPos[1]),
            parseFloat(lightPos[2])
        );

        //CG - Set the point lighting colour to full (so we can see it above the ambient lighting).
        gl.uniform3f(
            shaderProgram.uPointLightingDiffuseColor,
            parseFloat(0.8),
            parseFloat(0.8),
            parseFloat(0.8)
        );

        //CG
        gl.uniform3f(
            shaderProgram.uPointLightingSpecularColor,
            parseFloat(0.2),
            parseFloat(0.2),
            parseFloat(0.2)
        );

        gl.uniform1f(shaderProgram.uMaterialShininess, parseFloat(10));
    }

    // CG - Push a new matrix for the scene.
    mvPushMatrix();

    // CG - Kick off the rendering (start from the Sun and work our way down the tree).
    sun.drawOrbital();

    //Pop the matrix saved from earlier in order to render out the saturn ring last.
    mvMatrix = lastMatrixStack.pop();

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    mat4.rotate(mvMatrix, mvMatrix, Utils.degToRad(90), [1, 0, 0]);

    mat4.scale(mvMatrix, mvMatrix, [15, 15, 15]);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, squareVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureCreator.getTextures()["saturnRingTexture"]);

    gl.uniform1i(shaderProgram.uSampler1, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

    gl.disable(gl.BLEND);

    //Finally pop the top-level scene matrix.
    mvPopMatrix();

}



var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        planetSpinAngle += (1 * elapsed) / 1000.0;
        sunOrbitAngle += (5 * elapsed) / 1000.0;
        earthOrbitAngle += (30 * elapsed) / 1000.0;
        marsOrbitAngle += (20 * elapsed) / 1000.0;
        moonOrbitAngle += (40 * elapsed) / 1000.0;

    }
    lastTime = timeNow;
}


function handleKeys() {
    if (currentlyPressedKeys[69]) {
        // E
        z -= 0.5;
    }
    if (currentlyPressedKeys[87]) {
        // W
        z += 0.5;
    }
    if (currentlyPressedKeys[37]) {
        // Left cursor key
        x += 0.5;
    }
    if (currentlyPressedKeys[39]) {
        // Right cursor key
        x -= 0.5;
    }
    if (currentlyPressedKeys[38]) {
        // Up cursor key
        y -= 0.5;
    }
    if (currentlyPressedKeys[40]) {
        // Down cursor key
        y += 0.5;
    }
}



function tick() {
    requestAnimFrame(tick);
    handleKeys();
    drawScene();
    animate();
}


function webGLStart() {
    var canvas = document.getElementById("lesson12-canvas");

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    window.onmousewheel = document.onmousewheel = handleMouseWheel;
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    initGL(canvas);
    initShaders();
    initBuffers();
    //initTextures(textureNames, textureImages);

    //textureCreator.initialiseTextures();

    textureCreator = new TextureCreator(Config.textureNames, Config.textureImages);

    setupScene();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}
