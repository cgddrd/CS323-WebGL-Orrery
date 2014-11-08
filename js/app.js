function OrreryApp(gl) {
    this.gl = gl;
    this.buffers = {};
}

OrreryApp.prototype.initShaders = function (shaderAttributes, shaderUniforms) {
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

OrreryApp.prototype.initialiseShaderAttributes = function (shaderProgram, shaderAttributes) {
    for (var i = 0, max = shaderAttributes.length; i < max; i++) {
        shaderProgram[shaderAttributes[i]] = this.gl.getAttribLocation(shaderProgram, shaderAttributes[i]);
        this.gl.enableVertexAttribArray(shaderProgram[shaderAttributes[i]]);
    }
}

OrreryApp.prototype.initialiseShaderUniforms = function (shaderProgram, shaderUniforms) {
    for (var i = 0, max = shaderUniforms.length; i < max; i++) {
        shaderProgram[shaderUniforms[i]] = this.gl.getUniformLocation(shaderProgram, shaderUniforms[i]);
    }
}

OrreryApp.prototype.getShader = function (id) {
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

OrreryApp.prototype.initialiseBuffers = function (shaderBuffers) {

    for (var i = 0, max = shaderBuffers.length; i < max; i++) {

        this.buffers[shaderBuffers[i]] = {};
    }

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

    this.buffers["planetVertexNormalBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexNormalBuffer"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    this.buffers["planetVertexNormalBuffer"].itemSize = 3;
    this.buffers["planetVertexNormalBuffer"].numItems = normalData.length / 3;

    this.buffers["planetVertexTextureCoordBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexTextureCoordBuffer"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    this.buffers["planetVertexTextureCoordBuffer"].itemSize = 2;
    this.buffers["planetVertexTextureCoordBuffer"].numItems = textureCoordData.length / 2;

    this.buffers["planetVertexPositionBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["planetVertexPositionBuffer"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    this.buffers["planetVertexPositionBuffer"].itemSize = 3;
    this.buffers["planetVertexPositionBuffer"].numItems = vertexPositionData.length / 3;

    this.buffers["planetVertexIndexBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers["planetVertexIndexBuffer"]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    this.buffers["planetVertexIndexBuffer"].itemSize = 1;
    this.buffers["planetVertexIndexBuffer"].numItems = indexData.length;

    this.buffers["cubeVertexPositionBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["cubeVertexPositionBuffer"]);
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
    this.buffers["cubeVertexPositionBuffer"].itemSize = 3;
    this.buffers["cubeVertexPositionBuffer"].numItems = 24;

    // -- SET cube TEXTURES --

    this.buffers["cubeVertexTextureCoordBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["cubeVertexTextureCoordBuffer"]);
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
    this.buffers["cubeVertexTextureCoordBuffer"].itemSize = 2;
    this.buffers["cubeVertexTextureCoordBuffer"].numItems = 24;

    // -- SET CUBE VERTICES INDEX BUFFER --

    this.buffers["cubeVertexIndexBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers["cubeVertexIndexBuffer"]);

    var cubeVertexIndices = [
      0, 1, 2, 0, 2, 3, // Front face
      4, 5, 6, 4, 6, 7, // Back face
      8, 9, 10, 8, 10, 11, // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23 // Left face
    ]

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    this.buffers["cubeVertexIndexBuffer"].itemSize = 1;
    this.buffers["cubeVertexIndexBuffer"].numItems = 36;

    this.buffers["squareVertexPositionBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["squareVertexPositionBuffer"]);
    vertices = [
         1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.buffers["squareVertexPositionBuffer"].itemSize = 3;
    this.buffers["squareVertexPositionBuffer"].numItems = 4;

    this.buffers["squareVertexTextureCoordBuffer"] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers["squareVertexTextureCoordBuffer"]);

    texvert = [1.0, 0.0,
              0.0, 0.0,
              1.0, 1.0,
              0.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texvert), gl.STATIC_DRAW);

    this.buffers["squareVertexTextureCoordBuffer"].itemSize = 2;
    this.buffers["squareVertexTextureCoordBuffer"].numItems = 4;

}

OrreryApp.prototype.getBuffers = function() {
    return this.buffers;
}
