function EventManager(canvas) {
    this.currentlyPressedKeys = {};
    this.mouseDown = false;
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
        camera.goHome();
    }
}

EventManager.prototype.handleKeyUp = function(event) {
    this.currentlyPressedKeys[event.keyCode] = false;
}

EventManager.prototype.handleMouseMove = function(event) {

    if (!this.mouseDown) {
        return;
    }

    camera.handleRotation(event.clientX, event.clientY)
}

EventManager.prototype.handleMouseDown = function(event) {
    this.mouseDown = true;
    camera.handleMouseCoords(event.clientX, event.clientY);
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

    camera.handleZoom(delta);

}

EventManager.prototype.handleKeys = function() {

    if (this.currentlyPressedKeys[69]) {
        // E
        camera.setZPosition(camera.getZPosition() -= 0.5);
    }
    if (this.currentlyPressedKeys[87]) {
        // W
        camera.setZPosition(camera.getZPosition() += 0.5);
    }
    if (this.currentlyPressedKeys[37]) {
        // Left cursor key
        camera.setXPosition(camera.getXPosition() += 0.5);
    }
    if (this.currentlyPressedKeys[39]) {
        // Right cursor key
        camera.setXPosition(camera.getXPosition() -= 0.5);
    }
    if (this.currentlyPressedKeys[38]) {
        // Up cursor key
        camera.setYPosition(camera.getYPosition() -= 0.5);
    }
    if (this.currentlyPressedKeys[40]) {
        // Down cursor key
        camera.setYPosition(camera.getYPosition() += 0.5);
    }
}
