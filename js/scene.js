/**
 * Represents the application scene (containing scene objects)
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 *
 * Portions of this code have been modified from original code available at: http://learningwebgl.com/blog/?p=370
 */
function Scene() {

    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.tMatrix = mat4.create();

    this.mvMatrixStack = [];
    this.lastMatrixStack = [];

    this.sceneObjects = [];

    this.rootSceneObject = null;
}

/**
 * Initialises the scene, bulding the scene-graph and setting the root scene object for triggering the recurisve drawing/traversal function.
 * @param {App} app - Reference to the main application logic component.
 */
Scene.prototype.setupScene = function (app) {

    var currentPlanet, parentPlanet;
    var parentPlanets = [];

    //Get a reference to the texture manager.
    var textureCreator = app.getTextureCreator();

    //Get the collection of configuration settings for each of the planets from the 'Config' object, and process each of them before adding them to the scene-graph.
    for (var planet in Config.scenePlanets) {

        //Get the current planet being processed.
        currentPlanet = Config.scenePlanets[planet];

        //Create the new Orbital object and add to the scene-graph.
        this.addNewOrbital(currentPlanet.name, new Orbital(currentPlanet.name, textureCreator.getTextures(), currentPlanet.orbitVelocity, currentPlanet.spinVelocity, currentPlanet.scaleFactor, app.getBuffers(), currentPlanet.orbitRadius, currentPlanet.orbitEccentricity, currentPlanet.tilt));

        //If this planet has any children, add them to a temporary colleciton of parent planets.
        if (currentPlanet.hasOwnProperty('children')) {
            parentPlanets.push(currentPlanet);
        }

        //If the configuration settings for this planet state that it is the root planet, then set it as the root planet.
        if (currentPlanet.hasOwnProperty('root') && currentPlanet.root === true) {
            this.rootSceneObject = this.sceneObjects[currentPlanet.name];
        }

    }

    //Process each of the parent planets, adding their children to an internal collection of children for each planet (i.e. build the scene-graph)
    for (var parent in parentPlanets) {

        parentPlanet = parentPlanets[parent];

        for (var child in parentPlanet.children) {

            currentPlanet = this.sceneObjects[parentPlanet.children[child]];

            this.sceneObjects[parentPlanet.name].addChildOrbital(this.sceneObjects[currentPlanet.name]);

        }
    }

    //If no root object has been via configuration settings, choose the first planet processed as the root.
    if (this.rootSceneObject === null) {
        if (this.sceneObjects.length > 0) {
            console.log("Warning: No root scene object set, using default value (0)");
            this.rootSceneObject = this.sceneObjects[0];
        } else {
            console.error("Error: No root planet chosen.");
        }

    }

}

/**
 * Pushes a model-view matrix to the mvMatrix stack.
 */
Scene.prototype.pushMVMatrix = function () {
    this.mvMatrixStack.push(mat4.clone(this.mvMatrix));
}

/**
 * If the stack is not empty, removes and returns the top model-view matrix from the stack.
 */
Scene.prototype.popMVMatrix = function () {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
}

/**
 * Sets the uniforms for the model-view, projection and texture transformation matrices.
 * @param {WebGL} gl - Reference to WebGL library.
 * @param {object} shaderProgram - Reference to current WebGL shader program (fragment and vertex shaders)
 */
Scene.prototype.setMatrixUniforms = function (gl, shaderProgram) {

    gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(shaderProgram.uMVMatrix, false, this.mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.uTMatrix, false, this.tMatrix);

    var normalMatrix = mat3.create();

    mat3.normalFromMat4(normalMatrix, this.mvMatrix);

    gl.uniformMatrix3fv(shaderProgram.uNMatrix, false, normalMatrix);
}

/**
 * Sets the current model-view matrix to a new matrix.
 * @param {mat4} mvMatrix - New matrix to replace old model-view matrix.
 */
Scene.prototype.setMVMatrix = function(mvMatrix) {
    mat4.copy(this.mvMatrix, mvMatrix);
}

/**
 * Returns the current model-view matrix for the application scene.
 */
Scene.prototype.getMVMatrix = function () {
    return this.mvMatrix;
}

/**
 * Returns the current projection matrix for the application scene.
 */
Scene.prototype.getPMatrix = function () {
    return this.pMatrix;
}

/**
 * Returns the current texture transformation matrix for the application scene.
 */
Scene.prototype.getTMatrix = function () {
    return this.tMatrix;
}

/**
 * Returns the stack of model-view matrices for the application scene.
 */
Scene.prototype.getMVMatrixStack = function () {
    return this.mvMatrixStack;
}

/**
 * Returns the stack of matrices to be drawn last due to blending.
 */
Scene.prototype.getLastMatrixStack = function () {
    return this.lastMatrixStack;
}

/**
 * Adds a new 'Orbital' scene object (node) to the application scene-graph.
 * @param {string} key - The key to represent the new scene-graph node.
 * @param {Orbital} value - The new 'Orbital' scene object.
 */
Scene.prototype.addNewOrbital = function (key, value) {
    this.sceneObjects[key] = value;
}

/**
 * Returns the root scene object for the application scene.
 */
Scene.prototype.getRootSceneObject = function () {
    return this.rootSceneObject;
}

/**
 * Performs the rendering of the entire scene (includes triggering recursive drawing function for scene objects).
 */
Scene.prototype.drawScene = function () {

    var gl = app.getGL();

    var shaderProgram = app.getMainShaderProgram();
    var shaderProgram2 = app.getSkyboxShaderProgram();
    var camera = app.getCamera();
    var textureCreator = app.getTextureCreator();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Tell WebGL to use SKYBOX fragment shader.
    gl.useProgram(shaderProgram2);

    //Set up the perspective projection matrix, render objects that are a maximum of 2000 units away (in order to render the skybox correctly)
    mat4.perspective(this.getPMatrix(), 45, gl.viewportWidth / gl.viewportHeight, 0.1, 2000.0);

    // 2 * Math.PI = 360 degrees in radians.
    // We want to move the clouds of the earth along the X-axis (not the land and see however).
    // No of radians to move / 360 degrees in radians.
    mat4.translate(this.getTMatrix(), this.getTMatrix(), [Utils.degreesToRadians(Config.cloudRotationSpeed) / (2 * Math.PI), 0, 0]);

    //Inform the fragment shader as to whether we wish to render the advanced lighting model, or just render a simple version instead.
    gl.uniform1i(shaderProgram.uUseLighting, Config.lightingActive);

    mat4.identity(this.getMVMatrix());

    var lightPos = [0.0, 0.0, 0.0, 1.0];

    mat4.translate(this.getMVMatrix(), this.getMVMatrix(), [0, 0, camera.getZoomFactor()]);

    var cameraTranslationMatrix = mat4.clone(this.getMVMatrix());

    var currentPos = vec3.create();

    // CG - Translate the scene based on the user's input.
    mat4.translate(cameraTranslationMatrix, cameraTranslationMatrix, [camera.getXPosition(), camera.getYPosition(), camera.getZPosition()]);

    vec3.transformMat4(currentPos, currentPos, cameraTranslationMatrix);

    //If specified, rotate around the camera's own 'Y' axis.
    if (Config.cameraAxisRotation) {

        // CG - Handle scene rotations (via mouse events)
        mat4.multiply(this.getMVMatrix(), this.getMVMatrix(), camera.getRotationMatrix());

    }

    mat4.translate(this.getMVMatrix(), this.getMVMatrix(), currentPos);

    //Otherwise, rotate around the Sun's 'Y' axis.
    if (!Config.cameraAxisRotation) {

        // CG - Handle scene rotations (via mouse events)
        mat4.multiply(this.getMVMatrix(), this.getMVMatrix(), camera.getRotationMatrix());

    }

    //We need to transform by the light position in order to prevent the light source in the centre of the Sun from moving when we translate the scene.
    vec4.transformMat4(lightPos, lightPos, this.getMVMatrix());

    //Push a new model-view matrix for the skybox.
    this.pushMVMatrix();


    //Scale by a large factor in order to create a very large cube.
    mat4.scale(this.getMVMatrix(), this.getMVMatrix(), [500, 500, 500]);

    //Render/draw the skybox.
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, textureCreator.getTextures()["spaceTexture"]);

    gl.uniform1i(shaderProgram2.uSampler1, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["cubeVertexPositionBuffer"]);
    gl.vertexAttribPointer(shaderProgram2.aVertexPosition, app.buffers["cubeVertexPositionBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    // NEW: Set-up the cube texture buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["cubeVertexTextureCoordBuffer"]);
    gl.vertexAttribPointer(shaderProgram2.aTextureCoord1, app.buffers["cubeVertexTextureCoordBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, app.buffers["cubeVertexIndexBuffer"]);

    this.setMatrixUniforms(gl, shaderProgram2);

    gl.drawElements(gl.TRIANGLES, app.buffers["cubeVertexIndexBuffer"].numItems, gl.UNSIGNED_SHORT, 0);


    //Return to the top-level scene model-view matrix.
    this.popMVMatrix();

    //Tell WebGL to switch to use "main" fragment shader.
    gl.useProgram(shaderProgram);

    //Inform the fragment shader as to whether we wish to render the advanced lighting model, or just render a simple version instead.
    gl.uniform1i(shaderProgram.uUseLighting, Config.lightingActive);

    //Setup the ambient, diffuse and specular lighting terms in the fragment shader if we require the advanced lighting model.
    if (Config.lightingActive) {

        gl.uniform3f(
            shaderProgram.uAmbientColor,
            parseFloat(Config.ambientLightingColor),
            parseFloat(Config.ambientLightingColor),
            parseFloat(Config.ambientLightingColor)
        );

        //CG - Move the position of the point light so that it remains in the centre of the Sun even if we translate through the scene.
        gl.uniform3f(
            shaderProgram.uPointLightingLocation,
            parseFloat(lightPos[0]),
            parseFloat(lightPos[1]),
            parseFloat(lightPos[2])
        );

        gl.uniform3f(
            shaderProgram.uPointLightingDiffuseColor,
            parseFloat(Config.diffuseLightingColor),
            parseFloat(Config.diffuseLightingColor),
            parseFloat(Config.diffuseLightingColor)
        );

        gl.uniform3f(
            shaderProgram.uPointLightingSpecularColor,
            parseFloat(Config.specularLightingColor),
            parseFloat(Config.specularLightingColor),
            parseFloat(Config.specularLightingColor)
        );

        //Set up the specular reflective index.
        gl.uniform1f(shaderProgram.uMaterialShininess, parseFloat(Config.specularMaterialShineLevel));

        //Set up the light attentuation value.
        gl.uniform1f(shaderProgram.uAttenuation, parseFloat(Config.currentAttenuation));
    }

    //Push a new matrix for the main "foreground" scene.
    this.pushMVMatrix();

    //Trigger the recursive scene-graph traversal in order to draw all of the 'Orbital' scene-objects.
    this.getRootSceneObject().drawOrbital(Config.spinActive, gl, shaderProgram, this);

    //Pop the matrix saved from earlier in order to render out the saturn ring last.
    this.setMVMatrix(this.getLastMatrixStack().pop());

    //Enable blending for the rings of Saturn.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);

    //Rotate the "square" containing the ring texture by 90 degrees so that it lies horizontally across the 'X' axis of the planet.
    mat4.rotate(this.getMVMatrix(), this.getMVMatrix(), Utils.degreesToRadians(90), [1, 0, 0]);

    //Rotate the rings around Saturn.
    mat4.rotate(this.getMVMatrix(), this.getMVMatrix(), Utils.degreesToRadians(this.sceneObjects['saturn'].spinAngle), [0, 0, 1]);

    //Scale the rings slightly.
    mat4.scale(this.getMVMatrix(), this.getMVMatrix(), [10, 10, 10]);

    //Draw/render the rings of Saturn.
    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["squareVertexPositionBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, app.buffers["squareVertexPositionBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, app.buffers["squareVertexTextureCoordBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, app.buffers["squareVertexTextureCoordBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureCreator.getTextures()["saturnRingTexture"]);

    gl.uniform1i(shaderProgram.uSampler1, 0);

    this.setMatrixUniforms(gl, shaderProgram);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, app.buffers["squareVertexPositionBuffer"].numItems);

    //Make sure to disable blending again once complete.
    gl.disable(gl.BLEND);

    //Finally pop the top-level scene matrix.
    this.popMVMatrix();

}
