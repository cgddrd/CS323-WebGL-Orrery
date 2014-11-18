/**
 * Provides facilities to that enable interaction with the scene-model including rotation, zooming and translation.
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 */
function Camera() {

    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.zoom = 1.0;

    //CG - Ensure Z value is negative at the start.
    this.z = (0 - Config.startZoom);
    this.x = 0;
    this.y = 0;
    this.cameraRotationMatrix = mat4.create();

}

/**
 * Updates last known coordinates of mouse position required in order to rotate the scene by an appropiate degree.
 * @param {int} mouseX - X coordinate from the current mouse position.
 * @param {int} mouseY - Y coordinate from the current mouse position.
 */
Camera.prototype.handleMouseCoords = function(mouseX, mouseY) {
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
}

/**
 * Rotates the application scene based on the user's mouse movements.
 * @param {int} newX - X coordinate from the current mouse position.
 * @param {int} newY - Y coordinate from the current mouse position.
 */
Camera.prototype.handleRotation = function(newX, newY) {

    //Calculate the difference between the last mouse position, and the current position.
    var deltaX = newX - this.lastMouseX;
    var deltaY = newY - this.lastMouseY;


    var newRotationMatrix = mat4.create();

    mat4.identity(newRotationMatrix);

    //Rotate the entire scene by the difference in X and Y position of the mouse (deltaX and deltaY).
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degreesToRadians(deltaX / 10), [0, 1, 0]);

    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degreesToRadians(deltaY / 10), [1, 0, 0]);

    mat4.multiply(this.cameraRotationMatrix, newRotationMatrix, this.cameraRotationMatrix);

    this.lastMouseX = newX;
    this.lastMouseY = newY;
}
/**
 * Rotates the application scene based on the scrolling of the mouse wheel.
 * @param {int} delta - Position of the scroll wheel (<0 = Zoom out, >0 = Zoom 1)
 */
Camera.prototype.handleZoom = function(delta) {

    if (delta) {

        //If the user has scrolled down, then zoom in.
        if (delta > 0) {

            this.zoom += 0.25;

            //Check that we are zooming within the pre-defined limits (set in application configuration file)
            this.zoom = (this.zoom >= Config.cameraZoomLimit) ? Config.cameraZoomLimit : this.zoom;

        //Otherwise zoom out.
        } else {

            this.zoom -= 0.25;

            this.zoom = (this.zoom <= (1-Config.cameraZoomLimit)) ? (1-Config.cameraZoomLimit) : this.zoom;

        }
    }

}

/**
 * Returns the current factor by which the scene is zoomed in or out.
 */
Camera.prototype.getZoomFactor = function() {
    return this.zoom;
}

/**
 * Returns the current X position of the camera in the world-space.
 */
Camera.prototype.getXPosition = function() {
    return this.x;
}

/**
 * Returns the current Y position of the camera in the world-space.
 */
Camera.prototype.getYPosition = function() {
    return this.y;
}

/**
 * Returns the current Z position of the camera in the world-space.
 */
Camera.prototype.getZPosition = function() {
    return this.z;
}

/**
 * Sets the current X position of the camera in the world-space.
 * @param {int} x - The new X position coordinate.
 */
Camera.prototype.setXPosition = function(x) {
    this.x = x;
}

/**
 * Sets the current Y position of the camera in the world-space.
 * @param {int} y - The new Y position coordinate.
 */
Camera.prototype.setYPosition = function(y) {
    this.y = y;
}

/**
 * Sets the current Z position of the camera in the world-space.
 * @param {int} z - The new Z position coordinate.
 */
Camera.prototype.setZPosition = function(z) {
    this.z = z;
}

/**
 * Returns the current rotation matrix of the camera.
 */
Camera.prototype.getRotationMatrix = function() {
    return this.cameraRotationMatrix;
}
