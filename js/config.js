var Config  = {


    textureNames: ["spaceTexture", "marsTexture", "earthTexture", "sunTexture", "moonTexture", "cloudsTexture", "mercuryTexture", "venusTexture", "jupiterTexture", "saturnTexture", "uranusTexture", "neptuneTexture", "saturnRingTexture", "earthNightTexture"],

    textureImages: ["space.jpg", "marsmap1k.jpg", "earthmap1k.jpg", "sunmap.jpg", "moon.gif", "cloudimage.png", "mercurymap.jpg", "venusmap.jpg", "jupitermap.jpg", "saturnmap.jpg", "uranusmap.jpg", "neptunemap.jpg", "ringsRGBA.png", "earthlights1k.jpg"],

    shaderAttributes: ["aVertexPosition", "aTextureCoord1", "aVertexNormal"],

    shaderUniforms: ["uPMatrix", "uMVMatrix", "uTMatrix", "uNMatrix", "uSampler1", "uSampler2", "uSampler3", "uUseLighting", "uMaterialShininess", "uUseMultiTextures", "uAmbientColor", "uPointLightingLocation", "uPointLightingSpecularColor", "uPointLightingDiffuseColor"],

    shaderBuffers: ["planetVertexPositionBuffer", "planetVertexNormalBuffer", "planetVertexTextureCoordBuffer", "planetVertexIndexBuffer", "cubeVertexIndexBuffer", "cubeVertexPositionBuffer", "cubeVertexTextureCoordBuffer", "squareVertexPositionBuffer", "squareVertexTextureCoordBuffer"],

    startZoom: 50,

    lightingActive: true,

    ellipticalOrbitsActive: true,

    ambientLightingColor: 0.2,

    diffuseLightingColor: 0.8,

    specularLightingColor: 0.2,

    specularMaterialShineLevel: 10,

    cloudRotationSpeed: 0.1,

    scenePlanets: [

        {
            name: "sun",
            spinVelocity: 5,
            scaleFactor: 3,
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
            orbitEccentricity: 0.5

        },

        {
            name: "venus",
            spinVelocity: 35,
            scaleFactor: 0.5,
            orbitVelocity: 110,
            orbitRadius: -20,
            orbitEccentricity: 0.5

        },

        {
            name: "earth",
            spinVelocity: 30,
            scaleFactor: 0,
            orbitVelocity: 100,
            orbitRadius: -30,
            orbitEccentricity: 0.5,
            children: ["moon"]

        },

        {
            name: "moon",
            spinVelocity: 30,
            scaleFactor: 0.2,
            orbitVelocity: 1000,
            orbitRadius: -5,
            orbitEccentricity: 0.5

        },

        {
            name: "mars",
            spinVelocity: 30,
            scaleFactor: 0,
            orbitVelocity: 90,
            orbitRadius: -40,
            orbitEccentricity: 0.5

        },

        {
            name: "jupiter",
            spinVelocity: 10,
            scaleFactor: 2.5,
            orbitVelocity: 50,
            orbitRadius: -50,
            orbitEccentricity: 0.5

        },

        {
            name: "jupiter",
            spinVelocity: 10,
            scaleFactor: 2.5,
            orbitVelocity: 50,
            orbitRadius: -50,
            orbitEccentricity: 0.5

        },

        {
            name: "saturn",
            spinVelocity: 10,
            scaleFactor: 1.8,
            orbitVelocity: 40,
            orbitRadius: -60,
            orbitEccentricity: 0.5

        },

        {
            name: "uranus",
            spinVelocity: 15,
            scaleFactor: 1.5,
            orbitVelocity: 20,
            orbitRadius: -70,
            orbitEccentricity: 0.5

        },

        {
            name: "neptune",
            spinVelocity: 15,
            scaleFactor: 1.3,
            orbitVelocity: 10,
            orbitRadius: -80,
            orbitEccentricity: 0.5

        }

    ]

}
