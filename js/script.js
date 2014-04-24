
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
    var newMousedownPosition = {
        x: 0,
        y: 0
    };

    var moveForwardsKeyDown = false;
    var moveBackwardsKeyDown = false;
    var moveLeftKeyDown = false;
    var moveRightKeyDown = false;

    var oldTimestamp = 0;

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
        renderer.domElement.addEventListener('keyup', keyup, false);
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
            moveForwardsKeyDown = true;
        } else if (event.keyCode === 83) { // s
            moveBackwardsKeyDown = true;
        } else if (event.keyCode === 65) { // a
            moveLeftKeyDown = true;
        } else if (event.keyCode === 68) { // d
            moveRightKeyDown = true;
        }
    };

    var keyup = function(event) {
        if (event.keyCode === 87) { // w
            moveForwardsKeyDown = false;
        } else if (event.keyCode === 83) { // s
            moveBackwardsKeyDown = false;
        } else if (event.keyCode === 65) { // a
            moveLeftKeyDown = false;
        } else if (event.keyCode === 68) { // d
            moveRightKeyDown = false;
        }
    };

    var mousedown = function(event) {
        var keyCode = event.keyCode || event.which - 1;
        if (keyCode === 0) { // first mouse button
            isMousedown = true;
            // todo: maybe use offset, but offset doesn't work on FF.
            mousedownPosition.x = event.pageX / window.innerWidth;
            mousedownPosition.y = event.pageY / window.innerHeight;
            newMousedownPosition = mousedownPosition;
        }
    };

    var mouseup = function(event) {
      var keyCode = event.keyCode || event.which - 1;
        if (keyCode === 0) { // first mouse button
            isMousedown = false;
        }
    };

    var mousemove = function(event) {
        if (isMousedown) {
            // todo: maybe use offset, but offset doesn't work on FF.
            newMousedownPosition = {
                x: event.pageX / window.innerWidth,
                y: event.pageY / window.innerHeight
            };
        }
    };

    var gameloop = function(timestamp) {
        requestAnimationFrame(gameloop);

        var deltaTime = 0;
        if (typeof timestamp != 'undefined') {
            if (oldTimestamp !== 0) {
                deltaTime = timestamp - oldTimestamp;
            }
            oldTimestamp = timestamp;
        }

        update(deltaTime);
        render();
    };

    var update = function(deltaTime) {
        //console.log(1000 / deltaTime);

        // input update
        // mouse
        if (isMousedown) {
            var mouseDiff = {
                x: newMousedownPosition.x - mousedownPosition.x,
                y: newMousedownPosition.y - mousedownPosition.y
            };
            var mouseSensitivity = {
                x: 0.5,
                y: 0.5
            };
            camera.rotateOnAxis(new THREE.Vector3(0, -1, 0), mouseDiff.x * deltaTime * mouseSensitivity.x);
            camera.rotateOnAxis(new THREE.Vector3(-1, 0, 0), mouseDiff.y * deltaTime * mouseSensitivity.y);
            mousedownPosition = newMousedownPosition;
        }
        // keyboard
        var movementSpeed = 0.05;
        if (moveForwardsKeyDown) {
            camera.translateZ(-movementSpeed * deltaTime);
        }
        if (moveBackwardsKeyDown) {
            camera.translateZ(movementSpeed * deltaTime);
        }
        if (moveLeftKeyDown) {
            camera.translateX(-movementSpeed * deltaTime);
        }
        if (moveRightKeyDown) {
            camera.translateX(movementSpeed * deltaTime);
        }


    };

    var render = function() {
        renderer.render(scene, camera);
    };

    return {init: init};
}();

terrainSimulation.init();