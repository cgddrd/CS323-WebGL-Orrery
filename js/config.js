var Config  = {


    textureNames: ["spaceTexture", "marsTexture", "earthTexture", "sunTexture", "moonTexture", "cloudsTexture", "mercuryTexture", "venusTexture", "jupiterTexture", "saturnTexture", "uranusTexture", "neptuneTexture", "saturnRingTexture", "earthNightTexture"],

    textureImages: ["space.jpg", "marsmap1k.jpg", "earthmap1k.jpg", "sunmap.jpg", "moon.gif", "cloudimage.png", "mercurymap.jpg", "venusmap.jpg", "jupitermap.jpg", "saturnmap.jpg", "uranusmap.jpg", "neptunemap.jpg", "ringsRGBA.png", "earthlights1k.jpg"],

    shaderAttributes: ["aVertexPosition", "aTextureCoord1", "aVertexNormal"],

    shaderUniforms: ["uPMatrix", "uMVMatrix", "uTMatrix", "uNMatrix", "uSampler1", "uSampler2", "uSampler3", "uUseLighting", "uMaterialShininess", "uUseMultiTextures", "uAmbientColor", "uPointLightingLocation", "uPointLightingSpecularColor", "uPointLightingDiffuseColor"],

    shaderBuffers: ["planetVertexPositionBuffer", "planetVertexNormalBuffer", "planetVertexTextureCoordBuffer", "planetVertexIndexBuffer", "cubeVertexIndexBuffer", "cubeVertexPositionBuffer", "cubeVertexTextureCoordBuffer", "squareVertexPositionBuffer", "squareVertexTextureCoordBuffer"]


}
