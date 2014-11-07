function Orbital(name, textures, orbitVelocity, spinVelocity, scaleFactor, vertexPositionBuffer, vertexTextureCoordBuffer, vertexNormalBuffer, vertexIndexBuffer, orbitRadius, eccentricity) {

    this.children = [];
    this.textures = textures;
    this.scaleFactor = scaleFactor;
    this.orbitAngle = 0;
    this.spinAngle = 0;
    this.orbitVelocity = orbitVelocity;
    this.spinVelocity = spinVelocity;
    this.vertexPositionBuffer = vertexPositionBuffer;
    this.vertexTextureCoordBuffer = vertexTextureCoordBuffer;
    this.vertexNormalBuffer = vertexNormalBuffer;
    this.vertexIndexBuffer = vertexIndexBuffer;
    this.lastAnimTime = 0;
    this.orbitRadius = orbitRadius;
    this.name = name;
    this.initialOrbitRadius = orbitRadius;
    this.eccentricity = eccentricity;

    console.log(this.textures);

}

Orbital.prototype.drawOrbital = function () {

    //Push matrix for planet orbit.
    mvPushMatrix();

    if (userSpin) {
        this.increaseSpin();
    }

    if (this.orbitVelocity > 0) {
        mat4.rotate(mvMatrix, mvMatrix, Utils.degToRad(this.orbitAngle), [0, 1, 0]);
    }

    if (this.initialOrbitRadius != 0) {

        //CG - Calculate the change in the radius (used for the translation).
        var r = (this.initialOrbitRadius * (1 + this.eccentricity)) / (1 + this.eccentricity * Math.cos(Utils.degToRad(this.orbitAngle)));

        this.orbitRadius = r;

        //CG - Translate using this radius.
        mat4.translate(mvMatrix, mvMatrix, [this.orbitRadius, 0, 0]);

    }

    //Push matrix for planet.
    mvPushMatrix();

    if (this.children.length > 0) {

        //Recursive function to draw child orbitals.
        for (var i = 0; i < this.children.length; i++) {
            var currentOrbital = this.children[i];
            currentOrbital.drawOrbital();
        }

    }


    mat4.rotate(mvMatrix, mvMatrix, Utils.degToRad(this.spinAngle), [0, 1, 0]);


    if (this.scaleFactor != 0) {
        mat4.scale(mvMatrix, mvMatrix, [this.scaleFactor, this.scaleFactor, this.scaleFactor]);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    gl.uniform1i(shaderProgram.samplerUniform1, 0);

    if (this.textures.length > 1) {

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
        gl.uniform1i(shaderProgram.samplerUniform2, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
        gl.uniform1i(shaderProgram.samplerUniform3, 2);

        gl.uniform1i(shaderProgram.useMultipleTexturesUniform, true);

    } else {
        gl.uniform1i(shaderProgram.useMultipleTexturesUniform, false);
    }

    if (this.name === "sun") {
        gl.uniform3f(
            shaderProgram.ambientColorUniform,
            parseFloat(0.9),
            parseFloat(0.9),
            parseFloat(0.9)
        );
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

    setMatrixUniforms();

    gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

    if (this.name === "saturn") {

        //CG - Push the current matrix for saturn to another stack ready to render the rings of saturn last.
        lastMatrixStack.push(mvMatrix);

    }

    mvPopMatrix();

}

Orbital.prototype.increaseSpin = function() {

    var timeNow = new Date().getTime();

    if (this.lastAnimTime != 0) {

        var elapsed = timeNow - this.lastAnimTime;

        //this.orbitAngle += (this.orbitVelocity * elapsed) / 1000.0;

        //CG  - Calculate the change in orbit angle, and use this to rotate an elliptical orbit using the orbit velocity.
        this.orbitAngle += ((elapsed * this.initialOrbitRadius * this.initialOrbitRadius * this.orbitVelocity) / (this.orbitRadius * this.orbitRadius)) / 1000.0;

        this.spinAngle += (this.spinVelocity * elapsed) / 1000.0;
    }

    this.lastAnimTime = timeNow;
}

Orbital.prototype.addChildOrbital = function(childOrbital) {

    this.children.push(childOrbital);

}
