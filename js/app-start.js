var app;

function appStart() {

    $( "#eccentricity-slider" ).slider({ min: 0.0, max: 1.0, step: 0.1, value: Config.currentOrbitEccentricity });

    $( "#attenuation-slider" ).slider({ min: 0.00001, max: 0.001, step: 0.0001, value: Config.currentAttenuation });

    $( "#ambient-slider" ).slider({ min: 0, max: 1, step: 0.1, value: Config.ambientLightingColor });

    $( "#diffuse-slider" ).slider({ min: 0, max: 1, step: 0.1, value: Config.diffuseLightingColor });

    $( "#specular-slider" ).slider({ min: 0, max: 1, step: 0.1, value: Config.specularLightingColor });

    $( "#direction-slider" ).slider({ min: -1.0, max: 1.0, step: 2, value: 1.0 });

    $( "#velocity-slider" ).slider({ min: 0.0, max: 4.0, step: 0.1, value: 1.0 });

    var canvas = document.getElementById("app-canvas");

    app = new OrreryApp(canvas);

    app.init();
}
