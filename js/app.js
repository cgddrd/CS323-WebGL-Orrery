function OrreryApp(gl) {
    this.gl = gl;
}

OrreryApp.prototype.initShaders = function(shaderAttributes, shaderUniforms) {
    var fragmentShader = this.getShader("shader-fs");
    var vertexShader = this.getShader("shader-vs");

    var shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    this.gl.useProgram(shaderProgram);

    this.initialiseShaderAttributes(shaderProgram, shaderAttributes);

    this.initialiseShaderUniforms(shaderProgram, shaderUniforms);

    return shaderProgram;

}

OrreryApp.prototype.initialiseShaderAttributes = function(shaderProgram, shaderAttributes) {
    for (var i = 0, max = shaderAttributes.length; i < max; i++) {
        shaderProgram[shaderAttributes[i]] = this.gl.getAttribLocation(shaderProgram, shaderAttributes[i]);
        this.gl.enableVertexAttribArray(shaderProgram[shaderAttributes[i]]);
    }
}

OrreryApp.prototype.initialiseShaderUniforms = function(shaderProgram, shaderUniforms) {
    for (var i = 0, max = shaderUniforms.length; i < max; i++) {
        shaderProgram[shaderUniforms[i]] = this.gl.getUniformLocation(shaderProgram, shaderUniforms[i]);
    }
}

OrreryApp.prototype.getShader = function(id) {
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
