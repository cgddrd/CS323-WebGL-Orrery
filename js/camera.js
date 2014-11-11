function Camera(canvas) {

    this.currentlyPressedKeys = {};
    this.enableSpin = true;
    this.mouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.zoom = 1.0;

    //CG - Ensure Z value is negative at the start.
    this.z = (0 - Config.startZoom);
    this.x = 0;
    this.y = 0;
    this.cameraRotationMatrix = mat4.create();

    this.init(canvas);

}

Camera.prototype.init = function(canvas) {

    canvas.onmousedown = this.handleMouseDown.bind(this);
    document.onmouseup = this.handleMouseUp.bind(this);
    document.onmousemove = this.handleMouseMove.bind(this);
    window.onmousewheel = document.onmousewheel = this.handleMouseWheel.bind(this);
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);

}

Camera.prototype.handleKeyDown = function(event) {

    this.currentlyPressedKeys[event.keyCode] = true;

    if (String.fromCharCode(event.keyCode) == "S" && this.enableSpin == true) {
        this.enableSpin = false;
    } else if (String.fromCharCode(event.keyCode) == "S" && this.enableSpin == false) {
        this.enableSpin = true;
    }
}

Camera.prototype.handleKeyUp = function(event) {
    this.currentlyPressedKeys[event.keyCode] = false;
}

Camera.prototype.handleMouseDown = function(event) {
    this.mouseDown = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
}


Camera.prototype.handleMouseUp = function(event) {
    this.mouseDown = false;
}


Camera.prototype.handleMouseMove = function(event) {

    if (!this.mouseDown) {
        return;
    }

    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - this.lastMouseX
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degToRad(deltaX / 10), [0, 1, 0]);

    var deltaY = newY - this.lastMouseY;
    mat4.rotate(newRotationMatrix, newRotationMatrix, Utils.degToRad(deltaY / 10), [1, 0, 0]);

    mat4.multiply(this.cameraRotationMatrix, newRotationMatrix, this.cameraRotationMatrix);

    this.lastMouseX = newX;
    this.lastMouseY = newY;
}

Camera.prototype.handleMouseWheel = function(event) {

    var delta = 0;

    if (!event) {
        event = window.event;
    }

    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }

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

Camera.prototype.handleKeys = function() {
    if (this.currentlyPressedKeys[69]) {
        // E
        this.z -= 0.5;
    }
    if (this.currentlyPressedKeys[87]) {
        // W
        this.z += 0.5;
    }
    if (this.currentlyPressedKeys[37]) {
        // Left cursor key
        this.x += 0.5;
    }
    if (this.currentlyPressedKeys[39]) {
        // Right cursor key
        this.x -= 0.5;
    }
    if (this.currentlyPressedKeys[38]) {
        // Up cursor key
        this.y -= 0.5;
    }
    if (this.currentlyPressedKeys[40]) {
        // Down cursor key
        this.y += 0.5;
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

Camera.prototype.getRotationMatrix = function() {
    return this.cameraRotationMatrix;
}

Camera.prototype.isSpinEnabled = function() {
    return this.enableSpin;
}
