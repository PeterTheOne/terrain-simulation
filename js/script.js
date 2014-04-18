
var terrainSimulation = function() {

    var scene;
    var camera;
    var renderer;

    var plane;

    var isMousedown = false;
    var mousedownPosition = {
        x: 0,
        y: 0
    };

    var init = function() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', resize, false);
        document.body.appendChild(renderer.domElement);

        renderer.domElement.setAttribute('tabindex', 1);
        renderer.domElement.focus();
        renderer.domElement.addEventListener('keydown', keydown, false);
        renderer.domElement.addEventListener('mousedown', mousedown, false);
        renderer.domElement.addEventListener('mouseup', mouseup, false);
        renderer.domElement.addEventListener('mousemove', mousemove, false);

        var geometry = new THREE.PlaneGeometry(100, 100, 100, 100);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
        plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        gameloop();
    };

    var resize = function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    var keydown = function(event) {
        if (event.keyCode === 87) { // w
            camera.translateZ(-1);
        } else if (event.keyCode === 83) { // s
            camera.translateZ(1);
        } else if (event.keyCode === 65) { // a
            camera.translateX(-1);
        } else if (event.keyCode === 68) { // d
            camera.translateX(1);
        }
    };

    var mousedown = function(event) {
        if (event.keyCode === 0) { // first mouse button
            isMousedown = true;
            mousedownPosition.x = event.offsetX / window.innerWidth;
            mousedownPosition.y = event.offsetY / window.innerHeight;
        }
    };

    var mouseup = function(event) {
        if (event.keyCode === 0) { // first mouse button
            isMousedown = false;
        }
    };

    var mousemove = function(event) {
        if (isMousedown) {
            var newMousedownPosition = {
                x: event.offsetX / window.innerWidth,
                y: event.offsetY / window.innerHeight
            };
            var mouseDiff = {
                x: newMousedownPosition.x - mousedownPosition.x,
                y: newMousedownPosition.y - mousedownPosition.y
            };
            camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -mouseDiff.x * 10);
            camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -mouseDiff.y * 10);
            mousedownPosition = newMousedownPosition;
        }
    };

    var gameloop = function() {
        requestAnimationFrame(gameloop);
        update();
        render();
    };

    var update = function() {

    };

    var render = function() {
        renderer.render(scene, camera);
    };

    return {init:init};
}();

terrainSimulation.init();