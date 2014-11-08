var gl;
var sun, earth, mars, moon, mercury, venus, jupiter, saturn, uranus, neptune;
var textureCreator;
var app;
var shaderProgram;
var camera;

function setupScene() {

    sun = new Orbital("sun", textureCreator.getTextures(), 0, 5, 3, app.getBuffers(), 0, 0.5);

    mercury = new Orbital("mercury", textureCreator.getTextures(), 120, 40, 0.3, app.getBuffers(), -10, 0.5);

    venus = new Orbital("venus", textureCreator.getTextures(), 110, 35, 0.5, app.getBuffers(), -20, 0.5);

    earth = new Orbital("earth", textureCreator.getTextures(), 100, 30, 0, app.getBuffers(), -30, 0.5);

    moon = new Orbital("moon", textureCreator.getTextures(), 1000, 30, 0.2, app.getBuffers(), -5, 0.5);

    mars = new Orbital("mars", textureCreator.getTextures(), 90, 30, 0, app.getBuffers(), -40, 0.5);

    jupiter = new Orbital("jupiter", textureCreator.getTextures(), 50, 10, 2.5, app.getBuffers(), -50, 0.5);

    saturn = new Orbital("saturn", textureCreator.getTextures(), 40, 10, 2, app.getBuffers(), -60, 0.5);

    uranus = new Orbital("uranus", textureCreator.getTextures(), 20, 15, 1.5, app.getBuffers(), -70, 0.5);

    neptune = new Orbital("neptune", textureCreator.getTextures(), 10, 15, 1.3, app.getBuffers(), -80, 0.5);

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

    // CG - Handle scene rotations (via mouse events)
    //mat4.multiply(mvMatrix, mvMatrix, camera.getRotationMatrix());

    // CG - Move based on the user's input.
    mat4.translate(mvMatrix, mvMatrix, [camera.getXPosition(), camera.getYPosition(), camera.getZPosition()]);

    vec4.transformMat4(lightPos, lightPos, mvMatrix);

    // CG - Handle scene rotations (via mouse events)
    mat4.multiply(mvMatrix, mvMatrix, camera.getRotationMatrix());

    // CG - Handle scene zooming (via mouse wheel events)
    mat4.scale(mvMatrix, mvMatrix, [camera.getZoomFactor(), camera.getZoomFactor(), camera.getZoomFactor()]);

    mvPushMatrix();

    mat4.scale(mvMatrix, mvMatrix, [500, 500, 500]);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, textureCreator.getTextures()["spaceTexture"]);

    gl.uniform1i(shaderProgram.uSampler1, 0);
    gl.uniform1i(shaderProgram.uUseMultiTextures, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["cubeVertexPositionBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, app.buffers["cubeVertexPositionBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    // NEW: Set-up the cube texture buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["cubeVertexTextureCoordBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, app.buffers["cubeVertexTextureCoordBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, app.buffers["cubeVertexIndexBuffer"]);

    setMatrixUniforms();

    gl.drawElements(gl.TRIANGLES, app.buffers["cubeVertexIndexBuffer"].numItems, gl.UNSIGNED_SHORT, 0);

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
    sun.drawOrbital(camera.isSpinEnabled());

    //Pop the matrix saved from earlier in order to render out the saturn ring last.

    mvMatrix = lastMatrixStack.pop();

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    mat4.rotate(mvMatrix, mvMatrix, Utils.degToRad(90), [1, 0, 0]);

    mat4.scale(mvMatrix, mvMatrix, [15, 15, 15]);

    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["squareVertexPositionBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, app.buffers["squareVertexPositionBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["squareVertexTextureCoordBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, app.buffers["squareVertexTextureCoordBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureCreator.getTextures()["saturnRingTexture"]);

    gl.uniform1i(shaderProgram.uSampler1, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, app.buffers["squareVertexPositionBuffer"].numItems);

    gl.disable(gl.BLEND);

    //Finally pop the top-level scene matrix.
    mvPopMatrix();

}


function tick() {
    requestAnimFrame(tick);
    camera.handleKeys();
    drawScene();
}


function webGLStart() {
    var canvas = document.getElementById("lesson12-canvas");

    initGL(canvas);

    app = new OrreryApp(gl);

    camera = new Camera(canvas);

    shaderProgram = app.initShaders(Config.shaderAttributes, Config.shaderUniforms);

    app.initialiseBuffers(Config.shaderBuffers);

    textureCreator = new TextureCreator(Config.textureNames, Config.textureImages);

    setupScene();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}
