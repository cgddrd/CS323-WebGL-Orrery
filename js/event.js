function EventManager() {

    this.currentlyPressedKeys = {};
    this.mouseDown = false;
    this.camera = app.getCamera();

    this.init(app.getCanvas());
}

EventManager.prototype.init = function(canvas) {

    canvas.onmousedown = this.handleMouseDown.bind(this);
    document.onmouseup = this.handleMouseUp.bind(this);
    document.onmousemove = this.handleMouseMove.bind(this);
    window.onmousewheel = document.onmousewheel = this.handleMouseWheel.bind(this);
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);

    $( "#eccentricity-slider" ).on("slide", function( event, ui ) {
        Config.currentOrbitEccentricity = ui.value;
    } );

    $( "#attenuation-slider" ).on("slide", function( event, ui ) {
        Config.currentAttenuation = ui.value;
    } );

    $( "#ambient-slider" ).on("slide", function( event, ui ) {
        Config.ambientLightingColor = ui.value;
    } );

    $( "#diffuse-slider" ).on("slide", function( event, ui ) {
        Config.diffuseLightingColor = ui.value;
    } );

    $( "#specular-slider" ).on("slide", function( event, ui ) {
        Config.specularLightingColor = ui.value;
    } );

    $( "#velocity-slider" ).on("slide", function( event, ui ) {
        Config.animationSpeed = ui.value;
    } );

    $( "#direction-slider" ).on("slide", function( event, ui ) {
        Config.animationDirection = ui.value;
    } );

    $( "#toggle-animation" ).on("click", function( event, ui ) {


        Config.spinActive = Config.spinActive ? false : true;

        if (Config.spinActive) {
            $(this).text("Pause");
            $(this).css("background-color", "rgba(36,36,36,0.8)");
        } else {
            $(this).text("Play");
            $(this).css("background-color", "rgba(80,80,80,0.8)");
        }

    } );

    $( "#toggle-orbit" ).on("click", function( event, ui ) {


        Config.ellipticalOrbitsActive = Config.ellipticalOrbitsActive ? false : true;

        $("#eccentricity-slider").slider( "option", "disabled", !Config.ellipticalOrbitsActive);

        if (Config.ellipticalOrbitsActive) {
            $(this).text("Circular");
            $(this).css("background-color", "rgba(36,36,36,0.8)");
        } else {
            $(this).text("Elliptical");
            $(this).css("background-color", "rgba(80,80,80,0.8)");
        }

    } );

    $( "#toggle-lighting" ).on("click", function( event, ui ) {

        Config.lightingActive = Config.lightingActive ? false : true;

        $("#ambient-slider").slider( "option", "disabled", !Config.lightingActive);
        $("#diffuse-slider").slider( "option", "disabled", !Config.lightingActive);
        $("#specular-slider").slider( "option", "disabled", !Config.lightingActive);
        $("#attenuation-slider").slider( "option", "disabled", !Config.lightingActive);

        if (Config.lightingActive) {
            $(this).text("Disable Lighting");
            $(this).css("background-color", "rgba(36,36,36,0.8)");
        } else {
            $(this).text("Enable Lighting");
            $(this).css("background-color", "rgba(80,80,80,0.8)");
        }

    } );
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
        this.camera.setZPosition(this.camera.z -= 0.5);
    }
    if (this.currentlyPressedKeys[87]) {
        // W
        this.camera.setZPosition(this.camera.z += 0.5);
    }
    if (this.currentlyPressedKeys[37]) {
        // Left cursor key
        this.camera.setXPosition(this.camera.x += 0.5);
    }
    if (this.currentlyPressedKeys[39]) {
        // Right cursor key
        this.camera.setXPosition(this.camera.x -= 0.5);
    }
    if (this.currentlyPressedKeys[38]) {
        // Up cursor key
        this.camera.setYPosition(this.camera.y -= 0.5);
    }
    if (this.currentlyPressedKeys[40]) {
        // Down cursor key
        this.camera.setYPosition(this.camera.y += 0.5);
    }
}
