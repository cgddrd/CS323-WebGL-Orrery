/**
 * Provides facilities for initialising and managing textures required by the application.
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 *
 * @param {string[]} textureNames - Array of texture names to be used as keys within the generated texture collection.
 * @param {string[]} textureImages - Array of texture image URL locations used to initialise and load texture collection.
 * @param {string} textureFileURLRoot - Root URL location for all texture image files.
 */
function TextureCreator(textureNames, textureImages, textureFileURLRoot) {

    this.textureNames = textureNames;
    this.textureImages = textureImages;
    this.textureFileURLRoot = textureFileURLRoot;
    this.textureCollection = this.initialiseTextures(app.getGL());

}

/**
 * Initialises the collection of application textures based on the texture names and image locations provided from the configuration file.
 * @param {WebGL} gl - Reference to WebGL library.
 */
TextureCreator.prototype.initialiseTextures = function (gl) {

    var textures = {};

    //Loop through the specified collection of texture names, creating a new WebGL texture object for each before loading the related image file location.
    for (var i = 0; i < this.textureNames.length; i++) {

        textures[this.textureNames[i]] = gl.createTexture();

        textures[this.textureNames[i]].image = new Image();


        //We have to make sure that we pass THIS instance of the TextureCreator object into the callback. ('scope' parameter).
        textures[this.textureNames[i]].image.onload = (function (value, scope, texturearray) {
            return function () {

                //Initialise the texture once its image has been loaded asynchronously.
                scope.handleLoadedTexture(texturearray[scope.textureNames[value]], gl);
            }
        })(i, this, textures);

        //Set the image URL location using the root URL location and the specific image name for the given texture.
        textures[this.textureNames[i]].image.src = this.textureFileURLRoot + this.textureImages[i];

    }

    return textures;

}

/**
 * Registers the new texture with WebGL once the texture image has been successfulyl loaded asynchronously. (Acts as callback upon image load).
 * @param {object} tetxure - The new texture to register with WebGL.
 * @param {WebGL} gl - Reference to WebGL library.
 */
TextureCreator.prototype.handleLoadedTexture = function(texture, gl) {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

     // Check if the current image is a power of 2 in both dimensions.
  if (Utils.isPowerOfTwo(texture.image.width) && Utils.isPowerOfTwo(texture.image.height)) {

      // If so, go ahead and generate mip-maps.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);

  } else {

      // Otherwise, turn off mip-maps and set wrapping to clamp to edge.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  }

    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Returns the collection of initialised textures required by the application.
 */
TextureCreator.prototype.getTextures = function() {
    return this.textureCollection;
}
