function EventManager(canvas, camera) {

    this.currentlyPressedKeys = {};
    this.mouseDown = false;
    this.camera = camera;

    this.init(canvas);
}

EventManager.prototype.init = function(canvas) {

    canvas.onmousedown = this.handleMouseDown.bind(this);
    document.onmouseup = this.handleMouseUp.bind(this);
    document.onmousemove = this.handleMouseMove.bind(this);
    window.onmousewheel = document.onmousewheel = this.handleMouseWheel.bind(this);
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);
}

EventManager.prototype.handleKeyDown = function(event) {

    this.currentlyPressedKeys[event.keyCode] = true;

    if (String.fromCharCode(event.keyCode) == "S" && Config.spinActive == true) {
        Config.spinActive  = false;
    } else if (String.fromCharCode(event.keyCode) == "S" && Config.spinActive == false) {
        Config.spinActive = true;
    }

    if (String.fromCharCode(event.keyCode) == "G") {
        this.camera.goHome();
    }
}

EventManager.prototype.handleKeyUp = function(event) {
    this.currentlyPressedKeys[event.keyCode] = false;
}

EventManager.prototype.handleMouseMove = function(event) {

    if (!this.mouseDown) {
        return;
    }

    this.camera.handleRotation(event.clientX, event.clientY)
}

EventManager.prototype.handleMouseDown = function(event) {
    this.mouseDown = true;
    this.camera.handleMouseCoords(event.clientX, event.clientY);
}

EventManager.prototype.handleMouseUp = function(event) {
    this.mouseDown = false;
}

EventManager.prototype.handleMouseWheel = function(event) {

    var delta = 0;

    if (!event) {
        event = window.event;
    }

    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }

    this.camera.handleZoom(delta);

}

EventManager.prototype.handleKeys = function() {

    if (this.currentlyPressedKeys[69]) {
        // E
        this.camera.setZPosition(this.camera.getZPosition() -= 0.5);
    }
    if (this.currentlyPressedKeys[87]) {
        // W
        this.camera.setZPosition(this.camera.getZPosition() += 0.5);
    }
    if (this.currentlyPressedKeys[37]) {
        // Left cursor key
        this.camera.setXPosition(this.camera.getXPosition() += 0.5);
    }
    if (this.currentlyPressedKeys[39]) {
        // Right cursor key
        this.camera.setXPosition(this.camera.getXPosition() -= 0.5);
    }
    if (this.currentlyPressedKeys[38]) {
        // Up cursor key
        this.camera.setYPosition(this.camera.getYPosition() -= 0.5);
    }
    if (this.currentlyPressedKeys[40]) {
        // Down cursor key
        this.camera.setYPosition(this.camera.getYPosition() += 0.5);
    }
}
