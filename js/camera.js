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

Camera.prototype.handleMouseCoords = function(mouseX, mouseY) {
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
}

Camera.prototype.handleRotation = function(newX, newY) {

    var deltaX = newX - this.lastMouseX;

    var newRotationMatrix = mat4.create();

    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degToRad(deltaX / 10), [0, 1, 0]);

    var deltaY = newY - this.lastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degToRad(deltaY / 10), [1, 0, 0]);

    mat4.multiply(this.cameraRotationMatrix, newRotationMatrix, this.cameraRotationMatrix);

    this.lastMouseX = newX;
    this.lastMouseY = newY;
}

Camera.prototype.handleZoom = function(delta) {

    if (delta) {

        if (delta > 0) {
            this.zoom += 0.01;

        } else {
            this.zoom -= 0.01;

            if (this.zoom < 0.01) {
                this.zoom = 0.1;
            }
        }
    }

}

Camera.prototype.getZoomFactor = function() {
    return this.zoom;
}

Camera.prototype.getXPosition = function() {
    return this.x;
}

Camera.prototype.getYPosition = function() {
    return this.y;
}

Camera.prototype.getZPosition = function() {
    return this.z;
}

Camera.prototype.setXPosition = function(x) {
    this.x = x;
}

Camera.prototype.setYPosition = function(y) {
    this.y = y;
}

Camera.prototype.setZPosition = function(z) {
    this.z = z;
}

Camera.prototype.getRotationMatrix = function() {
    return this.cameraRotationMatrix;
}
