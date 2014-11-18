/**
 * Handles all of the events triggered by user input within the application.
 * @constructor
 * @author Connor Goddard [clg11@aber.ac.uk]
 *
 * Portions of this code have been modified from original code available at: http://learningwebgl.com/blog/?p=571
 */
function EventManager() {

    this.currentlyPressedKeys = {};
    this.mouseDown = false;
    this.camera = app.getCamera();

    //Initialise the event handlers.
    this.init(app.getCanvas());
}

/**
 * Initialises all of the mouse, keyboard and UI slider event handlers for the application.
 * @param {DOM object} canvas - Reference to HTML5 DOM 'Canvas' object used for mouse interaction.
 */
EventManager.prototype.init = function(canvas) {

    canvas.onmousedown = this.handleMouseDown.bind(this);
    document.onmouseup = this.handleMouseUp.bind(this);
    document.onmousemove = this.handleMouseMove.bind(this);
    window.onmousewheel = document.onmousewheel = this.handleMouseWheel.bind(this);
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);

    //Setup jQuery UI slider widget event handlers.
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

        $("#velocity-slider").slider( "option", "disabled", !Config.spinActive);
        $("#direction-slider").slider( "option", "disabled", !Config.spinActive);

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

/**
 * Handles key down events, processing specific letter key commands individually.
 * @param {event} event - Keyboard event to be processed.
 */
EventManager.prototype.handleKeyDown = function(event) {

    //Activate the handling of commands for the current key being pressed.
    this.currentlyPressedKeys[event.keyCode] = true;

    //If the 'S' key is pressed, fire the event handler for the "toggle animation" UI control. ('S' key is an alias for this event.)
    if (String.fromCharCode(event.keyCode) == "S") {
        $( "#toggle-animation" ).trigger( "click" );
    }

}

/**
 * Handles key up events for the application.
 * @param {event} event - Keyboard event to be processed.
 */
EventManager.prototype.handleKeyUp = function(event) {

    //Disable the processing of commands for keys that are no longer being pressed.
    this.currentlyPressedKeys[event.keyCode] = false;
}

/**
 * Handles mouse move events, in particular handling scene rotations in repsponse to mouse movements.
 * @param {event} event - Mouse event to be processed.
 */
EventManager.prototype.handleMouseMove = function(event) {

    if (!this.mouseDown) {
        return;
    }

    this.camera.handleRotation(event.clientX, event.clientY)
}

/**
 * Handles mouse down events, in particular handling scene rotations in repsponse to mouse movements.
 * @param {event} event - Mouse event to be processed.
 */
EventManager.prototype.handleMouseDown = function(event) {
    this.mouseDown = true;
    this.camera.handleMouseCoords(event.clientX, event.clientY);
}

/**
 * Handles mouse up events.
 * @param {event} event - Mouse event to be processed.
 */
EventManager.prototype.handleMouseUp = function(event) {
    this.mouseDown = false;
}

/**
 * Handles mouse wheel events, in particular handling scene zooming based on the mouse wheel scroll position.
 * @param {event} event - Mouse event to be processed.
 */
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

/**
 * Handles firing events for specific keyboard keys, in particular handling scene translations and scene zooming.
 */
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
