function Orbital(texture, orbitVelocity, spinVelocity, scaleFactor, vertexPositionBuffer, vertexTextureCoordBuffer, vertexNormalBuffer, vertexIndexBuffer) {

    this.children = [];
    this.texture = texture;
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
}

Orbital.prototype.drawOrbital = function() {

    this.increaseSpin();

    mvPushMatrix();

    mat4.rotate(mvMatrix, mvMatrix, degToRad(this.spinAngle), [0, 1, 0]);

    mat4.scale(mvMatrix, mvMatrix, [this.scaleFactor, this.scaleFactor, this.scaleFactor]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.samplerUniform1, 0);

    gl.uniform1i(shaderProgram.useMultipleTexturesUniform, false);

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

}

Orbital.prototype.increaseSpin = function() {

    var timeNow = new Date().getTime();

    if (this.lastAnimTime != 0) {

        var elapsed = timeNow - this.lastAnimTime;

        this.orbitAngle += (this.orbitVelocity * elapsed) / 1000.0;
        this.spinAngle += (this.spinVelocity * elapsed) / 1000.0;
    }

    this.lastAnimTime = timeNow;
}
