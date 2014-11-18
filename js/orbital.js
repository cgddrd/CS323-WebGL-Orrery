/**
 * Represents a single star, planet or moon scene object within the orrery model.
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 *
 * @param {string} name - The name of the star, planet or moon.
 * @param {object} textures - JS object containing a collection of pre-loaded textures used by the application.
 * @param {int} orbitVelocity - Specifies the velocity of which the current star, planet or moon should travel in orbit.
 * @param {int} spinVelocity - Specifies the velocity of which the current star, planet or moon should spin on it's 'Y' axis.
 * @param {int} scaleFactor - Specifies the factor by which the current star, planet or moon should be scaled in size.
 * @param {object} buffers - JS object containing a collection of pre-loaded WebGL buffers linked to the vertex and fragment shaders.
 * @param {int} orbitRadius - Specifies the radius of the orbit for the current star, planet or moon.
 * @param {float} eccentricity - Specifies the eccentricity of the elliptical orbit for the current star, planet or moon. (Value between 0 and 1 only).
 * @param {float} tilt - The angle of tilt for the orbit of the current star, planet or moon measured in degrees.
 */
function Orbital(name, textures, orbitVelocity, spinVelocity, scaleFactor, buffers, orbitRadius, eccentricity, tilt) {

    this.children = [];
    this.textures = textures;
    this.scaleFactor = scaleFactor;
    this.orbitAngle = 0;
    this.spinAngle = 0;
    this.orbitVelocity = orbitVelocity;
    this.spinVelocity = spinVelocity;
    this.buffers = buffers;
    this.lastAnimTime = 0;
    this.orbitRadius = orbitRadius;
    this.name = name;
    this.initialOrbitRadius = orbitRadius;
    this.eccentricity = eccentricity;
    this.tilt = tilt;
}

/**
 * Performs the rendering of the Orbital object to the application scene.
 * @param {boolean} isAnimated - Determines whether or not the star, planet or moon should continue spinning and orbiting.
 * @param {WebGL} gl - Reference to WebGL library.
 * @param {object} shaderProgram - Reference to current WebGL shader program (fragment and vertex shaders)
 * @param {Scene} scene - Reference to 'Scene' object in order to access model-view matrix stack.
 */
Orbital.prototype.drawOrbital = function (isAnimated, gl, shaderProgram, scene) {

    //Set the current eccentricity level (has the user changed it at all?)
    this.eccentricity = Config.currentOrbitEccentricity;

    //Push model-view matrix for Orbital orbit.
    scene.pushMVMatrix();

    //If we should still be animating the orbit and spin, increase the spin and orbit angles.
    if (isAnimated) {
        this.increaseProgress();
    }

    //If a specific tilt value has been defined and we are still rendering elliptical orbits, then apply the tilt to the orbit path.
    if (this.tilt > 0 && Config.ellipticalOrbitsActive) {
        mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degreesToRadians(this.tilt), [0, 0, 1]);
    }

    //If we have specified an orbit velocity, then apply it to the model-view matrix (i.e. progress through the orbital path)
    if (this.orbitVelocity > 0) {
        mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degreesToRadians(this.orbitAngle), [0, 1, 0]);
    }

    //Check that we need to calculate an orbit radius.
    if (this.initialOrbitRadius != 0) {

        //Calculate the change in orbital radius for planetary motion as described by Kepler's first two laws of orbtial motion. If we are rendering elliptical orbits, then use an eccentricity value between 0.1 and 1, otherwise if we are rendering circular orbits, set the eccenticity to 0.

        this.orbitRadius = Config.ellipticalOrbitsActive ? ((this.initialOrbitRadius * (1 + this.eccentricity)) / (1 + this.eccentricity * Math.cos(Utils.degreesToRadians(this.orbitAngle)))) * Config.scaleFactor : ((this.initialOrbitRadius * (1 + 0)) / (1 + 0 * Math.cos(Utils.degreesToRadians(this.orbitAngle)))) * Config.scaleFactor;

        //Translate the star, planet or moon along their orbital path with the calculated radius.
        mat4.translate(scene.getMVMatrix(), scene.getMVMatrix(), [this.orbitRadius, 0, 0]);

    }

    //Push another model-view matrix for Orbital itself.
    scene.pushMVMatrix();

    //Check if we have any children..
    if (this.children.length > 0) {

        //If so, recursively traverse down the scene-graph rendering any children first.
        for (var i = 0; i < this.children.length; i++) {
            var currentOrbital = this.children[i];
            currentOrbital.drawOrbital(isAnimated, gl, shaderProgram, scene);
        }

    }

    //Now we have rendered all the children, we can render the parent.

    //Rotate the star, planet or moon along it's 'Y' axis.
    mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degreesToRadians(this.spinAngle), [0, 1, 0]);


    //If required, scale the star, planet or moon by it's scale factor (e.g. make the Sun bigger than the planet, the Moon smaller than the Earth etc.)
    if (this.scaleFactor != 0) {
        mat4.scale(scene.getMVMatrix(), scene.getMVMatrix(), [this.scaleFactor, this.scaleFactor, this.scaleFactor]);
    }

    //Obtain the surface texture for the current star, planet or moon via it's key from the collection of textures. (Key itself is generated using the current Orbital name and the "Texture" suffix)

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.name + "Texture"]);
    gl.uniform1i(shaderProgram.uSampler1, 0);


    //Check for special cases.
    switch (this.name) {

    //If we are rendering the Earth, then we want to apply multiple textures for the "night" and cloud surfaces.
    case "earth":
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["cloudsTexture"]);
        gl.uniform1i(shaderProgram.uSampler2, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["earthNightTexture"]);
        gl.uniform1i(shaderProgram.uSampler3, 2);

        gl.uniform1i(shaderProgram.uUseMultiTextures, true);
        break;

    //If we are rendering the Sun, then increse the ambient lighting so the Sun remains bright.
    case "sun":
        gl.uniform3f(shaderProgram.uAmbientColor, parseFloat(0.9), parseFloat(0.9), parseFloat(0.9));

    //In all other cases (including the Sun) turn off multi-texturing in the fragment shader.
    default:
        gl.uniform1i(shaderProgram.uUseMultiTextures, false);
        break;

    }

    //Actually draw the object to the scene using the pre-calculated position, texture, index and normal buffers.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexPositionBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, this.buffers["planetVertexPositionBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexTextureCoordBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, this.buffers["planetVertexTextureCoordBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexNormalBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexNormal, this.buffers["planetVertexNormalBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers["planetVertexIndexBuffer"]);

    scene.setMatrixUniforms(gl, shaderProgram);

    gl.drawElements(gl.TRIANGLES, this.buffers["planetVertexIndexBuffer"].numItems, gl.UNSIGNED_SHORT, 0);


   /*

    *************

    This code below was written to try and convert from 3D-space coordinates to 2D-screen coordinates in order to apply labels to scene objects. Unfortuantly, while this partially works, it could be not fully completed in the remaining time left before the assignment deadline, and has been left here for reference. - 18/11/14

    *************

    var clipSpacePos = vec4.create();

    var point3D = vec4.fromValues(0.0, 0.0, 0.0, 1.0);//scene.getMVMatrix()[12], scene.getMVMatrix()[13], scene.getMVMatrix()[14], 1);
    var multiply1 = vec4.create();

    var multiply2 = vec4.create();

    vec4.transformMat4(multiply1, point3D, scene.getMVMatrix());

    vec4.transformMat4(multiply2, multiply1, scene.getPMatrix());

    var vector3 = vec3.fromValues((multiply2[0] / multiply2[3]), (multiply2[1] / multiply2[3]), (multiply2[2] / multiply2[3]));

    var winX = ((vector3[0] + 1) / 2.0) * app.getCanvas().width;

    var winY = ((vector3[1] + 1) / 2.0) * app.getCanvas().height;

    */

    //Return to the orbit model-view matrix.
    scene.popMVMatrix();

    if (this.name === "saturn") {

        //CG - Push the current matrix for saturn to another stack ready to render the rings of saturn last.
        scene.getLastMatrixStack().push(scene.getMVMatrix());

    }

    //Return to the scene model-view matrix.
    scene.popMVMatrix();

}

/**
 * Increases the orbit and spin angles for a given star, planet or moon.
 */
Orbital.prototype.increaseProgress = function () {

    var timeNow = new Date().getTime();

    if (this.lastAnimTime != 0) {

        var elapsed = timeNow - this.lastAnimTime;

        //CG  - Calculate the change in orbit angle, and use this to rotate an elliptical orbit using the orbit velocity.

        this.orbitAngle += Config.ellipticalOrbitsActive ? ((elapsed * this.initialOrbitRadius * this.initialOrbitRadius * (this.orbitVelocity * Config.animationSpeed * Config.animationDirection)) / (this.orbitRadius * this.orbitRadius))/ 1000.0 : ((this.orbitVelocity * Config.animationSpeed * Config.animationDirection) / 2 * elapsed) / 1000.0;


        this.spinAngle += ((this.spinVelocity * Config.animationSpeed) * elapsed) / 1000.0;

    }

    this.lastAnimTime = timeNow;
}

/**
 * Adds a new "child" node the node of the current scene object within the scene-graph.
 * @param {Orbital} childOrbital - 'Orbital' object to be added to the scene-graph.
 */
Orbital.prototype.addChildOrbital = function (childOrbital) {

    this.children.push(childOrbital);

}
