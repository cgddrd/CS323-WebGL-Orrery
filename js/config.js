var Config  = {

    textureFileURLRoot: "images/textures/",

    textureNames: ["spaceTexture", "marsTexture", "earthTexture", "sunTexture", "moonTexture", "cloudsTexture", "mercuryTexture", "venusTexture", "jupiterTexture", "saturnTexture", "uranusTexture", "neptuneTexture", "saturnRingTexture", "earthNightTexture"],

    textureImages: ["space.jpg", "marsmap1k.jpg", "earthmap1k.jpg", "sunmap.jpg", "moon.gif", "cloudimage.png", "mercurymap.jpg", "venusmap.jpg", "jupitermap.jpg", "saturnmap.jpg", "uranusmap.jpg", "neptunemap.jpg", "ringsRGBA.png", "earthlights1k.jpg"],

    shaderAttributes: ["aVertexPosition", "aTextureCoord1", "aVertexNormal"],

    shaderUniforms: ["uPMatrix", "uMVMatrix", "uTMatrix", "uNMatrix", "uSampler1", "uSampler2", "uSampler3", "uUseLighting", "uMaterialShininess", "uUseMultiTextures", "uAmbientColor", "uPointLightingLocation", "uPointLightingSpecularColor", "uPointLightingDiffuseColor", "uAttenuation"],

    skyboxShaderAttributes: ["aVertexPosition", "aTextureCoord1", "aVertexNormal"],

    skyboxShaderUniforms: ["uPMatrix", "uMVMatrix", "uTMatrix", "uNMatrix", "uSampler1"],

    shaderBuffers: ["planetVertexPositionBuffer", "planetVertexNormalBuffer", "planetVertexTextureCoordBuffer", "planetVertexIndexBuffer", "cubeVertexIndexBuffer", "cubeVertexPositionBuffer", "cubeVertexTextureCoordBuffer", "squareVertexPositionBuffer", "squareVertexTextureCoordBuffer"],

    startZoom: 100,

    spinActive: true,

    lightingActive: true,

    ellipticalOrbitsActive: true,

    ambientLightingColor: 0.2,

    diffuseLightingColor: 0.8,

    specularLightingColor: 0.3,

    specularMaterialShineLevel: 10,

    cloudRotationSpeed: 0.1,

    currentOrbitEccentricity: 0.5,

    currentAttenuation: 0.0001,

    cameraAxisRotation: true,

    cameraZoomLimit: 40,

    animationSpeed: 1,

    animationDirection : 1,

    scaleFactor: 1,

    scenePlanets: [

        {
            name: "sun",
            spinVelocity: 5,
            scaleFactor: 4,
            orbitVelocity: 0,
            orbitRadius: 0,
            orbitEccentricity: 0,
            children: ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"],
            root: true

        },

        {
            name: "mercury",
            spinVelocity: 40,
            scaleFactor: 0.3,
            orbitVelocity: 120,
            orbitRadius: -10,
            orbitEccentricity: 0.6

        },

        {
            name: "venus",
            spinVelocity: 35,
            scaleFactor: 0.5,
            orbitVelocity: 110,
            orbitRadius: -30,
            orbitEccentricity: 0.6

        },

        {
            name: "earth",
            spinVelocity: 30,
            scaleFactor: 0,
            orbitVelocity: 100,
            orbitRadius: -50,
            orbitEccentricity: 0.6,
            children: ["moon"]

        },

        {
            name: "moon",
            spinVelocity: 30,
            scaleFactor: 0.4,
            orbitVelocity: 500,
            orbitRadius: -10,
            orbitEccentricity: 0.6,
            tilt: 40

        },

        {
            name: "mars",
            spinVelocity: 30,
            scaleFactor: 0,
            orbitVelocity: 90,
            orbitRadius: -70,
            orbitEccentricity: 0.6

        },

        {
            name: "jupiter",
            spinVelocity: 10,
            scaleFactor: 2.5,
            orbitVelocity: 50,
            orbitRadius: -100,
            orbitEccentricity: 0.6

        },

        {
            name: "saturn",
            spinVelocity: 10,
            scaleFactor: 1.8,
            orbitVelocity: 40,
            orbitRadius: -120,
            orbitEccentricity: 0.5

        },

        {
            name: "uranus",
            spinVelocity: 15,
            scaleFactor: 1.5,
            orbitVelocity: 20,
            orbitRadius: -160,
            orbitEccentricity: 0.6

        },

        {
            name: "neptune",
            spinVelocity: 15,
            scaleFactor: 1.3,
            orbitVelocity: 10,
            orbitRadius: -180,
            orbitEccentricity: 0.6

        }

    ]

}
