function TextureCreator(textureNames, textureImages, textureFileURLRoot) {

    this.textureNames = textureNames;
    this.textureImages = textureImages;
    this.textureFileURLRoot = textureFileURLRoot;
    this.textureCollection = this.initialiseTextures(app.getGL());

}

TextureCreator.prototype.initialiseTextures = function (gl) {

    var textures = {};

    for (var i = 0; i < this.textureNames.length; i++) {

        textures[this.textureNames[i]] = gl.createTexture();

        textures[this.textureNames[i]].image = new Image();

        textures[this.textureNames[i]].image.onload = (function (value, scope, texturearray) {
            return function () {
                scope.handleLoadedTexture(texturearray[scope.textureNames[value]], gl);
            }
        })(i, this, textures);

        textures[this.textureNames[i]].image.src = this.textureFileURLRoot + this.textureImages[i];

    }

    return textures;

}

TextureCreator.prototype.handleLoadedTexture = function(texture, gl) {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

     // Check if the image is a power of 2 in both dimensions.
  if (Utils.isPowerOfTwo(texture.image.width) && Utils.isPowerOfTwo(texture.image.height)) {
     // Yes, it's a power of 2. Generate mips.
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
     gl.generateMipmap(gl.TEXTURE_2D);
  } else {
     // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

    gl.bindTexture(gl.TEXTURE_2D, null);
}

TextureCreator.prototype.getTextures = function() {
    return this.textureCollection;
}
