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

Orbital.prototype.drawOrbital = function (isSpinEnabled, gl, shaderProgram, scene) {

    this.eccentricity = Config.currentOrbitEccentricity;

    //Push matrix for planet orbit.
    scene.pushMVMatrix();

    if (isSpinEnabled) {
        this.increaseSpin();
    }

    if (this.tilt > 0 && Config.ellipticalOrbitsActive) {
        mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degToRad(this.tilt), [0, 0, 1]);
    }

    if (this.orbitVelocity > 0) {
        mat4.rotate(scene.getMVMatrix(), scene.getMVMatrix(), Utils.degToRad(this.orbitAngle), [0, 1, 0]);
    }

    if (this.initialOrbitRadius != 0) {

        //CG - Calculate the change in the radius (used for the translation).

        this.orbitRadius = Config.ellipticalOrbitsActive ? ((this.initialOrbitRadius * (1 + this.eccentricity)) / (1 + this.eccentricity * Math.cos(Utils.degToRad(this.orbitAngle)))) * Config.scaleFactor : ((this.initialOrbitRadius * (1 + 0)) / (1 + 0 * Math.cos(Utils.degToRad(this.orbitAngle)))) * Config.scaleFactor;

        //CG - Translate using this radius.
        mat4.translate(scene.getMVMatrix(), scene.getMVMatrix(), [this.orbitRadius, 0, 0]);

    }

    //Push matrix for planet.
    scene.pushMVMatrix();

    if (this.children.length > 0) {

        //Recursive function to draw child orbitals.
        for (var i = 0; i < this.children.length; i++) {
            var currentOrbital = this.children[i];
            currentOrbital.drawOrbital(isSpinEnabled, gl, shaderProgram, scene);
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

    scene.setMatrixUniforms(gl, shaderProgram);

    gl.drawElements(gl.TRIANGLES, this.buffers["planetVertexIndexBuffer"].numItems, gl.UNSIGNED_SHORT, 0);

  /*      var m = mat4.create();

    mat4.multiply(m, scene.getMVMatrix(), scene.getPMatrix());

    var x = m[12] ;

    var y = m[13];

    //console.log('x = ' + scene.getMVMatrix()[12] + ', y = ' + scene.getMVMatrix()[13] + ', z = ' + scene.getMVMatrix()[14] )

    var winX =  Math.round((( x + 1 ) / 2.0) * app.getCanvas().width );

    var winY =  Math.round((( 1 - y ) / 2.0) * app.getCanvas().height );  */


 /*   var clipSpacePos = vec4.create();




    var point3D = vec4.fromValues(scene.getMVMatrix()[12], scene.getMVMatrix()[13], scene.getMVMatrix()[14], 1);

    //console.log(mat4.str(scene.getMVMatrix()))

    var multiply1 = vec4.create();

    var multiply2 = vec4.create();

    //clipSpacePos = projectionMatrix * (viewMatrix * vec4(point3D, 1.0));

    vec4.transformMat4(multiply1, point3D, scene.getMVMatrix());

    vec4.transformMat4(multiply2, multiply1, scene.getPMatrix());



    var vector3 = vec3.fromValues((multiply2[0] / multiply2[3]), (multiply2[1] / multiply2[3]), (multiply2[2] / multiply2[3]));

       // console.log(vector3)

    var winX = ((vector3[0] + 1) / 2.0) * app.getCanvas().width;

    var winY = ((vector3[1] + 1) / 2.0) * app.getCanvas().height;

    console.log('screen x = ' + winX + ', screen y = ' + winY ); */




    scene.popMVMatrix();

    if (this.name === "saturn") {

        // document.getElementById("saturn-label").style.left = winX + 'px';
      //  document.getElementById("saturn-label").style.top = winY + 'px';

        //CG - Push the current matrix for saturn to another stack ready to render the rings of saturn last.
        scene.getLastMatrixStack().push(scene.getMVMatrix());



    }

    scene.popMVMatrix();

}

Orbital.prototype.increaseSpin = function () {

    var timeNow = new Date().getTime();

    if (this.lastAnimTime != 0) {

        var elapsed = timeNow - this.lastAnimTime;

        //CG  - Calculate the change in orbit angle, and use this to rotate an elliptical orbit using the orbit velocity.

        this.orbitAngle += Config.ellipticalOrbitsActive ? ((elapsed * this.initialOrbitRadius * this.initialOrbitRadius * (this.orbitVelocity * Config.animationSpeed * Config.animationDirection)) / (this.orbitRadius * this.orbitRadius))/ 1000.0 : ((this.orbitVelocity * Config.animationSpeed * Config.animationDirection) / 2 * elapsed) / 1000.0;


        this.spinAngle += ((this.spinVelocity * Config.animationSpeed) * elapsed) / 1000.0;

    }

    this.lastAnimTime = timeNow;
}

Orbital.prototype.addChildOrbital = function (childOrbital) {

    this.children.push(childOrbital);

}
