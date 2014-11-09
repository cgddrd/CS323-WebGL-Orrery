function Scene(gl) {

    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.tMatrix = mat4.create();

    this.mvMatrixStack = [];
    this.lastMatrixStack = [];
    this.gl = gl;
}

Scene.prototype.pushMVMatrix = function() {
    this.mvMatrixStack.push(mat4.clone(this.mvMatrix));
}

Scene.prototype.popMVMatrix = function() {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
}

Scene.prototype.setMatrixUniforms = function(shaderProgram) {
    this.gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, this.pMatrix);
    this.gl.uniformMatrix4fv(shaderProgram.uMVMatrix, false, this.mvMatrix);
    this.gl.uniformMatrix4fv(shaderProgram.uTMatrix, false, this.tMatrix);

    var normalMatrix = mat3.create();

    mat3.normalFromMat4(normalMatrix, this.mvMatrix);

    gl.uniformMatrix3fv(shaderProgram.uNMatrix, false, normalMatrix);
}

Scene.prototype.getMVMatrix = function() {
    return this.mvMatrix;
}

Scene.prototype.getPMatrix = function() {
    return this.pMatrix;
}

Scene.prototype.getTMatrix = function() {
    return this.tMatrix;
}

Scene.prototype.getMVMatrixStack = function() {
    return this.mvMatrixStack;
}

Scene.prototype.getLastMatrixStack = function() {
    return this.lastMatrixStack;
}

Scene.prototype.setMVMatrix = function(newMVMatrix) {
    this.mvMatrix = newMVMatrix;
}
