var createScene = function (engine) {
    
    var scene = new BABYLON.Scene(engine);

    // Camera setup
    var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    camera.setPosition(new BABYLON.Vector3(0, 5, -10));
    camera.attachControl(canvas, true);
    camera.upperBetaLimit = Math.PI / 2;
    camera.lowerRadiusLimit = 4;

    // Light setup
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Knot mesh
    var knot = BABYLON.Mesh.CreateTorusKnot("knot", 1, 0.4, 128, 64, 2, 3, scene);

    // Spheres with pivot matrix
    var createSphere = function (name, translation) {
        var sphere = BABYLON.Mesh.CreateSphere(name, 16, 1.5, scene);
        sphere.setPivotMatrix(BABYLON.Matrix.Translation(translation.x, translation.y, translation.z), false);
        return sphere;
    };

    var yellowSphere = createSphere("yellowSphere", new BABYLON.Vector3(3, 0, 0));
    var blueSphere = createSphere("blueSphere", new BABYLON.Vector3(-1, 3, 0));
    var greenSphere = createSphere("greenSphere", new BABYLON.Vector3(0, 0, 3));

    // Satellite material generation
    var generateSatelliteMaterial = function (root, color, others) {
        var material = new BABYLON.StandardMaterial("satelliteMat" + root.name, scene);
        material.diffuseColor = color;

        var probe = new BABYLON.ReflectionProbe("satelliteProbe" + root.name, 512, scene);
        others.forEach(function (other) {
            probe.renderList.push(other);
        });

        material.reflectionTexture = probe.cubeTexture;
        material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        material.reflectionFresnelParameters.bias = 0.02;

        root.material = material;
        probe.attachToMesh(root);
    };

    // Mirror setup
    var createMirror = function (name, scaling, position, mirrorPlane, renderList, rotation, texture) {
        var mirror = BABYLON.Mesh.CreateBox(name, 1.0, scene);
        mirror.scaling = scaling;
        mirror.position = position;
        mirror.rotation = rotation;
        mirror.material = new BABYLON.StandardMaterial(name + "Mat", scene);
        mirror.material.reflectionTexture = new BABYLON.MirrorTexture(name, 256, scene, true);
        mirror.material.reflectionTexture.mirrorPlane = mirrorPlane;
        mirror.material.reflectionTexture.renderList = renderList;
        if(texture === "Wall"){
            mirror.material.diffuseTexture = new BABYLON.Texture("textures/Bricks061_1K_Color.webp", scene);
            mirror.material.reflectionTexture.level = 0.75;
            mirror.material.reflectionTexture.blurKernel = 40;
            // mirror.material.reflectionTexture.adaptiveBlurKernel = 32;
            // mirror.material.reflectionTexture.reflectionLevel = 3;
        }
        else{
            mirror.material.diffuseTexture = new BABYLON.Texture("textures/Tiles045_1K_Color.webp", scene);
            mirror.material.reflectionTexture.level = 0.75;
            mirror.material.reflectionTexture.blurKernel = 30;
            // mirror.material.reflectionTexture.adaptiveBlurKernel = 32;
            // mirror.material.reflectionTexture.reflectionLevel = 3;
        }
        
        mirror.material.diffuseTexture.uScale = 10;
        mirror.material.diffuseTexture.vScale = 10;
        
        
        // mirror.material.alpha = 0.15;
        return mirror;
    };

    var renderList = [greenSphere, yellowSphere, blueSphere, knot];
    var mirror = createMirror("Mirror", new BABYLON.Vector3(100.0, 0.01, 100.0), new BABYLON.Vector3(0, -2, 0), new BABYLON.Plane(0, -1.0, 0, -2.0), renderList, BABYLON.Vector3.Zero(), "ground");

    // Wall mirrors
    var wallmirror1 = createMirror("wallmirror1", new BABYLON.Vector3(20.0, 20.0, 0.01), new BABYLON.Vector3(0, 2.5, 10), new BABYLON.Plane(0, 0, 1, -10), renderList.concat([mirror]), new BABYLON.Vector3(0, -Math.PI, 0), "Wall");
    var wallmirror2 = createMirror("wallmirror2", new BABYLON.Vector3(20.0, 20.0, 0.01), new BABYLON.Vector3(0, 2.5, -10), new BABYLON.Plane(0, 0, -1, -10), renderList.concat([mirror]), new BABYLON.Vector3(0, -Math.PI, 0), "Wall");
    var wallmirror3 = createMirror("wallmirror3", new BABYLON.Vector3(20.0, 20.0, 0.01), new BABYLON.Vector3(10, 2.5, 0), new BABYLON.Plane(1, 0, 0, -10), renderList.concat([mirror]), new BABYLON.Vector3(0, -Math.PI / 2, 0), "Wall");
    var wallmirror4 = createMirror("wallmirror4", new BABYLON.Vector3(20.0, 20.0, 0.01), new BABYLON.Vector3(-10, 2.5, 0), new BABYLON.Plane(-1, 0, 0, -10), renderList.concat([mirror]), new BABYLON.Vector3(0, -Math.PI / 2, 0), "Wall");

    mirror.material.reflectionTexture.renderList.push(wallmirror1, wallmirror2, wallmirror3, wallmirror4);

    // Main material setup
    var mainMaterial = new BABYLON.StandardMaterial("main", scene);
    knot.material = mainMaterial;
    var probe = new BABYLON.ReflectionProbe("main", 512, scene);
    probe.renderList.push(yellowSphere, greenSphere, blueSphere, mirror, wallmirror1, wallmirror2, wallmirror3, wallmirror4);
    mainMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0.5);
    mainMaterial.reflectionTexture = probe.cubeTexture;
    mainMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    mainMaterial.reflectionFresnelParameters.bias = 0.02;

    // Generate satellite materials
    generateSatelliteMaterial(yellowSphere, BABYLON.Color3.Yellow(), renderList.concat([wallmirror1, wallmirror2, wallmirror3, wallmirror4]));
    generateSatelliteMaterial(greenSphere, BABYLON.Color3.Green(), renderList.concat([wallmirror1, wallmirror2, wallmirror3, wallmirror4]));
    generateSatelliteMaterial(blueSphere, BABYLON.Color3.Blue(), renderList.concat([wallmirror1, wallmirror2, wallmirror3, wallmirror4]));

    // Fog setup
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = scene.clearColor;
    scene.fogStart = 20.0;
    scene.fogEnd = 50.0;

    // Animations
    scene.registerBeforeRender(function () {
        yellowSphere.rotation.y += 0.0025;
        greenSphere.rotation.y += 0.0025;
        blueSphere.rotation.y += 0.0025;
    });

    // GUI for swapping spheres and adjusting mirror properties
    var gui = new dat.GUI();
    var params = {
        swapYellowAndGreen: function() {
            swapPositions(yellowSphere, greenSphere);
        },
        swapYellowAndBlue: function() {
            swapPositions(yellowSphere, blueSphere);
        },
        swapGreenAndBlue: function() {
            swapPositions(greenSphere, blueSphere);
        }
    };

    gui.add(params, 'swapYellowAndGreen').name('Swap Yellow and Green');
    gui.add(params, 'swapYellowAndBlue').name('Swap Yellow and Blue');
    gui.add(params, 'swapGreenAndBlue').name('Swap Green and Blue');
    

    var swapPositions = function (sphere1, sphere2) {
        // Get the pivot matrices
        var pivotMatrix1 = sphere1.getPivotMatrix().clone();
        var pivotMatrix2 = sphere2.getPivotMatrix().clone();

        // Swap the pivot matrices
        sphere1.setPivotMatrix(pivotMatrix2, false);
        sphere2.setPivotMatrix(pivotMatrix1, false);
    };

    return scene;
};

var canvas = document.getElementById("renderer");
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var engine = new BABYLON.Engine(canvas, true,{disableWebGL2Support: false});

if(window.innerWidth < window.innerHeight)
engine.setHardwareScalingLevel(1);

var scene = createScene(engine);

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});