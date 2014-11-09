function Orbital(name, textures, orbitVelocity, spinVelocity, scaleFactor, buffers, orbitRadius, eccentricity) {

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
}

Orbital.prototype.drawOrbital = function (isSpinEnabled) {

    //Push matrix for planet orbit.
    scene.pushMVMatrix();

    if (isSpinEnabled) {
        this.increaseSpin();
    }

    if (this.orbitVelocity > 0) {
        mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degToRad(this.orbitAngle), [0, 1, 0]);
    }

    if (this.initialOrbitRadius != 0) {

        //CG - Calculate the change in the radius (used for the translation).

        if (Config.ellipticalOrbitsActive) {

            var r = (this.initialOrbitRadius * (1 + this.eccentricity)) / (1 + this.eccentricity * Math.cos(Utils.degToRad(this.orbitAngle)));

            this.orbitRadius = r;

        } else {

            this.orbitRadius = this.initialOrbitRadius;

        }

        //CG - Translate using this radius.
        mat4.translate(scene.getMVMatrix(), scene.getMVMatrix(), [this.orbitRadius, 0, 0]);

    }

    //Push matrix for planet.
    scene.pushMVMatrix();

    if (this.children.length > 0) {

        //Recursive function to draw child orbitals.
        for (var i = 0; i < this.children.length; i++) {
            var currentOrbital = this.children[i];
            currentOrbital.drawOrbital(isSpinEnabled);
        }

    }


    mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degToRad(this.spinAngle), [0, 1, 0]);

    if (this.scaleFactor != 0) {
        mat4.scale(scene.getMVMatrix(), scene.getMVMatrix(), [this.scaleFactor, this.scaleFactor, this.scaleFactor]);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.name + "Texture"]);
    gl.uniform1i(shaderProgram.uSampler1, 0);

    switch (this.name) {

    case "earth":
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["cloudsTexture"]);
        gl.uniform1i(shaderProgram.uSampler2, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textures["earthNightTexture"]);
        gl.uniform1i(shaderProgram.uSampler3, 2);

        gl.uniform1i(shaderProgram.uUseMultiTextures, true);

        break;
    case "sun":
        gl.uniform3f(shaderProgram.uAmbientColor, parseFloat(0.9), parseFloat(0.9), parseFloat(0.9));
    default:
        gl.uniform1i(shaderProgram.uUseMultiTextures, false);
        break;

    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexPositionBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, this.buffers["planetVertexPositionBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexTextureCoordBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord1, this.buffers["planetVertexTextureCoordBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexNormalBuffer"]);
    gl.vertexAttribPointer(shaderProgram.aVertexNormal, this.buffers["planetVertexNormalBuffer"].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers["planetVertexIndexBuffer"]);

    scene.setMatrixUniforms(shaderProgram);

    gl.drawElements(gl.TRIANGLES, this.buffers["planetVertexIndexBuffer"].numItems, gl.UNSIGNED_SHORT, 0);

    scene.popMVMatrix();

    if (this.name === "saturn") {

        //CG - Push the current matrix for saturn to another stack ready to render the rings of saturn last.
        scene.getLastMatrixStack().push(scene.getMVMatrix());

    }

    scene.popMVMatrix();

}

Orbital.prototype.increaseSpin = function () {

    var timeNow = new Date().getTime();

    if (this.lastAnimTime != 0) {

        var elapsed = timeNow - this.lastAnimTime;

        if (Config.ellipticalOrbitsActive) {

            this.orbitAngle += ((elapsed * this.initialOrbitRadius * this.initialOrbitRadius * this.orbitVelocity) / (this.orbitRadius * this.orbitRadius)) / 1000.0;

        } else {

            this.orbitAngle += (this.orbitVelocity * elapsed) / 1000.0;

        }

        //CG  - Calculate the change in orbit angle, and use this to rotate an elliptical orbit using the orbit velocity.

        this.spinAngle += (this.spinVelocity * elapsed) / 1000.0;
    }

    this.lastAnimTime = timeNow;
}

Orbital.prototype.addChildOrbital = function (childOrbital) {

    this.children.push(childOrbital);

}
