var gl;

function initGL(canvas) {
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
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

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord1");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    shaderProgram.tMatrixUniform = gl.getUniformLocation(shaderProgram, "uTMatrix");


    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform1 = gl.getUniformLocation(shaderProgram, "uSampler1");
    shaderProgram.samplerUniform2 = gl.getUniformLocation(shaderProgram, "uSampler2");
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");

    shaderProgram.useMultipleTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseMultiTextures");

    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
}


function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}


var marsTexture;
var earthTexture;
var sunTexture;
var moonTexture;
var cloudsTexture;

function initTextures() {
    marsTexture = gl.createTexture();
    marsTexture.image = new Image();
    marsTexture.image.onload = function () {
        handleLoadedTexture(marsTexture)
    }
    marsTexture.image.src = "marsmap1k.jpg";

    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(earthTexture)
    }
    earthTexture.image.src = "earthmap1k.jpg";
    
    sunTexture = gl.createTexture();
    sunTexture.image = new Image();
    sunTexture.image.onload = function () {
        handleLoadedTexture(sunTexture)
    }
    sunTexture.image.src = "sunmap.jpg";

    moonTexture = gl.createTexture();
    moonTexture.image = new Image();
    moonTexture.image.onload = function () {
        handleLoadedTexture(moonTexture)
    }
    moonTexture.image.src = "moon.gif";

    cloudsTexture = gl.createTexture();
    cloudsTexture.image = new Image();
    cloudsTexture.image.onload = function () {
        handleLoadedTexture(cloudsTexture)
    }
    cloudsTexture.image.src = "cloudimage.png";
}


var mvMatrix = mat4.create();
var tMatrix = mat4.create();
var mvMatrixStack = [];
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
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.tMatrixUniform, false, tMatrix);

    var normalMatrix = mat3.create();
    
    mat3.normalFromMat4(normalMatrix, mvMatrix);

    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var planetVertexPositionBuffer;
var planetVertexNormalBuffer;
var planetVertexTextureCoordBuffer;
var planetVertexIndexBuffer;

function initBuffers() {

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
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
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
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

    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    
    // 2 * Math.PI = 360 degrees in radians.
    // We want to move the clouds of the earth along the X-axis (not the land and see however).
    // No of radians to move / 360 degrees in radians.
    mat4.translate(tMatrix, tMatrix, [degToRad(0.1) / (2 * Math.PI), 0, 0]);

    var lighting  = true;
    gl.uniform1i(shaderProgram.useLightingUniform, lighting);
    
    if (lighting) {
        
        //CG - Increase the ambient light so we can see the sun. 
        gl.uniform3f(
            shaderProgram.ambientColorUniform,
            parseFloat(0.9),
            parseFloat(0.9),
            parseFloat(0.9)
        );

        //CG - Move the position of the point light so that it is in the centre of the sun.
        gl.uniform3f(
            shaderProgram.pointLightingLocationUniform,
            parseFloat(0),
            parseFloat(0),
            parseFloat(-50)
        );

        //CG - Set the point lighting colour to full (so we can see it above the ambient lighting).
        gl.uniform3f(
            shaderProgram.pointLightingColorUniform,
            parseFloat(1),
            parseFloat(1),
            parseFloat(1)
        );
    }

    mat4.identity(mvMatrix);

    // CG - Move the scene back by -50 on the Z axis for the point light.
    mat4.translate(mvMatrix, mvMatrix, [0, 0, -50]);

    // CG - Push a new matrix for the scene. 
    mvPushMatrix();

    // Push a new matrix for the sun. 
    mvPushMatrix();

    // CG - Rotate the entire sun.
    mat4.rotate(mvMatrix, mvMatrix, degToRad(sunOrbitAngle), [0, 1, 0]);

    //Scale the sun to make it larger.
    mat4.scale(mvMatrix, mvMatrix, [3, 3, 3]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sunTexture);
    gl.uniform1i(shaderProgram.samplerUniform1, 0);

    gl.uniform1i(shaderProgram.useMultipleTexturesUniform, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, planetVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, planetVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, planetVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetVertexIndexBuffer);
    
    //Set matrix uniforms. 
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, planetVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
    //Pop the Sun matrix, return to scene matrix.
    mvPopMatrix();
    
    //CG - Now push a new matrix for Mars' orbit path.
    mvPushMatrix();
    
    //Rotate Mars around the sun at a quicker rate to the "scene" rotation speed.
    mat4.rotate(mvMatrix, mvMatrix, degToRad(marsOrbitAngle), [0, 1, 0]);
    
    //Now push another matrix for Mars itself (so it sits on this new, faster orbit. )
    mvPushMatrix();

    //Move Mars further away from the Sun.
    mat4.translate(mvMatrix, mvMatrix, [-30, 0, 0]);
    
    //Now rotate Mars on it's own axis. 
    mat4.rotate(mvMatrix, mvMatrix, degToRad(planetSpinAngle), [0, 1, 0]);
    
    //Set and bind the texture.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, marsTexture);
    gl.uniform1i(shaderProgram.samplerUniform1, 0);

    gl.uniform1i(shaderProgram.useMultipleTexturesUniform, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, planetVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, planetVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, planetVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetVertexIndexBuffer);
    
    //Set matrix uniforms. 
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, planetVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
    //Pop the Mars matrix. (Returns to Mars orbit matrix).
    mvPopMatrix();
    
    //Pop the Mars orbit matrix. (Returns to top-level scene matrix)
    mvPopMatrix();

    //Push a new matrix for Earth orbit.
    mvPushMatrix();
    
    //Rotate the Earth around the Sun.
    mat4.rotate(mvMatrix, mvMatrix, degToRad(earthOrbitAngle), [0, 1, 0]);

    //Push a new matrix for Earth itself.
    mvPushMatrix();

    // Move the Earth away from the Sun.
    mat4.translate(mvMatrix, mvMatrix, [-20, 0, 0]);
    
    //Rotate the earth on it's own axis. 
    mat4.rotate(mvMatrix, mvMatrix, degToRad(planetSpinAngle), [0, 1, 0]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, planetVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, planetVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, planetVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.uniform1i(shaderProgram.samplerUniform1, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cloudsTexture);
    gl.uniform1i(shaderProgram.samplerUniform2, 1)

    //Pass a UNIFORM boolean through to the fragment/vertex shaders in order to specify that we want multiple layers on the earth.
    gl.uniform1i(shaderProgram.useMultipleTexturesUniform, true);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, planetVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


    //Push a new matrix for the Moon orbit (this is still contained within the Earth matrix so we can move the Moon relative to the Earth.)
    mvPushMatrix();

    //Rotate the Moon around the Earth,
    mat4.rotate(mvMatrix, mvMatrix, degToRad(moonOrbitAngle), [0, 1, 0]);

    //Push a new matrix for the Moon itself.
    mvPushMatrix();

    //Scale and move the Moon away from the earth.
    mat4.scale(mvMatrix, mvMatrix, [0.4, 0.4, 0.4]);
    mat4.translate(mvMatrix, mvMatrix, [-15, 0, 0]);

    //Rotate the moon on it's own axis.
    mat4.rotate(mvMatrix, mvMatrix, degToRad(planetSpinAngle), [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, planetVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, planetVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, planetVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moonTexture);
    gl.uniform1i(shaderProgram.samplerUniform1, 0);

    gl.uniform1i(shaderProgram.useMultipleTexturesUniform, false);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, planetVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    //Pop the Moon matrix (Returns to Moon orbit matrix)
    mvPopMatrix();

    //Pop the Moon orbit matrix (Returns to Earth matrix)
    mvPopMatrix();
    
    //Pop the Earth matrix (Returns to Earth orbit matrix)
    mvPopMatrix();
    
    //Pop the Earth orbit matrix. (Returns to top-level scene matrix).
    mvPopMatrix();

    //Finally pop the top-level scene matrix.
    mvPopMatrix()
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



function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


function webGLStart() {
    var canvas = document.getElementById("lesson12-canvas");

    initGL(canvas);
    initShaders();
    initBuffers();
    initTextures();

    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.DEPTH_TEST);

    tick();
}
