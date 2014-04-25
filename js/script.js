
var terrainSimulation = function() {

    var scene;
    var camera;
    var renderer;

    var waterGeometry;
    var geometry;
    var waterPlane;
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

    var worldWidth = 20;
    var worldDepth = 20;
    var geometryWidth = 100;
    var geometryDepth = 100;

    var stone;
    var sand;
    var water;

    var clock = new THREE.Clock();

    var init = function() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        camera.position.x = 0;
        camera.position.y = 70;
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', resize, false);
        document.body.appendChild(renderer.domElement);

        var canvas = renderer.domElement;
        canvas.setAttribute('tabindex', 1);
        canvas.focus();
        canvas.addEventListener('keydown', keydown, false);
        canvas.addEventListener('keyup', keyup, false);
        canvas.addEventListener('mousedown', mousedown, false);
        canvas.addEventListener('mouseup', mouseup, false);
        canvas.addEventListener('mousemove', mousemove, false);

        geometry = new THREE.PlaneGeometry(geometryWidth, geometryDepth, worldWidth - 1, worldDepth - 1 );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        geometry.dynamic = true;

        stone = generateStone(worldWidth, worldDepth);
        sand = generateSand(worldWidth, worldDepth);
        water = generateWater(worldWidth, worldDepth);
        for (var i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].y = stone[i] + sand[i];
        }

        var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
        plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        var stoneGeometry = new THREE.PlaneGeometry(geometryWidth, geometryDepth, worldWidth - 1, worldDepth - 1 );
        stoneGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        for (var i = 0; i < stoneGeometry.vertices.length; i++) {
            stoneGeometry.vertices[i].y = stone[i];
        }
        var stoneMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
        var stonePlane = new THREE.Mesh(stoneGeometry, stoneMaterial);
        scene.add(stonePlane);

        waterGeometry = new THREE.PlaneGeometry(geometryWidth, geometryDepth, worldWidth - 1, worldDepth - 1 );
        waterGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        waterGeometry.dynamic = true;
        for (var i = 0; i < waterGeometry.vertices.length; i++) {
            waterGeometry.vertices[i].y = stone[i] + sand[i] + water[i];
        }
        var waterMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true});
        waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
        scene.add(waterPlane);

        gameloop();
    };

    var generateStone = function(width, height) {
        var size = width * height;
        var data = new Float32Array(size);

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                data[x * width + y] = y * 5;
                //data[x * width + y] = 10;
            }
        }
        return data;
    };

    var generateSand = function(width, height) {
        var size = width * height;
        var data = new Float32Array(size);

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                //data[x * width + y] = x * 2 + (y * 4) % 10;
                data[x * width + y] = 10;
            }
        }
        return data;
    };

    var generateWater = function(width, height) {
        var size = width * height;
        var data = new Float32Array(size);

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                //data[x * width + y] = x * 2 + (y * 4) % 10;
                data[x * width + y] = 2;
            }
        }
        return data;
    };

    var updateSand = function() {
        var width = worldWidth;
        var height = worldDepth;

        var size = width * height;
        var diffData = new Float32Array(size);

        // generate diff
        for (var x1 = 0; x1 < width; x1++) {
            for (var y1 = 0; y1 < height; y1++) {
                if (sand[x1 * worldWidth + y1] <= 0) {
                    continue;
                }
                for (var x2 = -1; x2 <= 1; x2++) {
                    for (var y2 = -1; y2 <= 1; y2++) {
                        var x = x1 + x2;
                        var y = y1 + y2;
                        if (x < 0 || x >= width || y < 0 || y >= height) {
                            continue;
                        }
                        if (x2 == 0 && y2 == 0) {
                            continue;
                        }

                        var heightDiff = getHeight(x1, y1) - getHeight(x, y);
                        var distance = Math.sqrt(x2 * x2  + y2 * y2);
                        var slopeLength = Math.sqrt(heightDiff * heightDiff + distance * distance);
                        var alpha = Math.asin(heightDiff / slopeLength);
                        // 90 degree is 1, 0 degree is 0
                        var alphaNormalized = (alpha / Math.PI);
                        var sandMoved =  alphaNormalized * alphaNormalized * (heightDiff / 2) * 1;
                        if (sandMoved > 0.01) {
                            diffData[x1 * width + y1] -= sandMoved;
                            diffData[x * width + y] += sandMoved;
                        }

                    }
                }
            }
        }

        // apply diff
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var value = sand[x * width + y] + diffData[x * width + y];
                if (value < 0) {
                    sand[x * width + y] = 0;
                } else {
                    sand[x * width + y] = value;
                }
            }
        }
    };

    var updateWater = function() {
        var width = worldWidth;
        var height = worldDepth;

        var size = width * height;
        var diffData = new Float32Array(size);

        // generate diff
        for (var x1 = 0; x1 < width; x1++) {
            for (var y1 = 0; y1 < height; y1++) {
                if (water[x1 * worldWidth + y1] <= 0) {
                    continue;
                }
                for (var x2 = -1; x2 <= 1; x2++) {
                    for (var y2 = -1; y2 <= 1; y2++) {
                        var x = x1 + x2;
                        var y = y1 + y2;
                        if (x < 0 || x >= width || y < 0 || y >= height) {
                            continue;
                        }
                        if (x2 == 0 && y2 == 0) {
                            continue;
                        }

                        var heightDiff = getHeightWater(x1, y1) - getHeightWater(x, y);
                        var distance = Math.sqrt(x2 * x2  + y2 * y2);
                        var slopeLength = Math.sqrt(heightDiff * heightDiff + distance * distance);
                        var alpha = Math.asin(heightDiff / slopeLength);
                        // 90 degree is 1, 0 degree is 0
                        var alphaNormalized = (alpha / Math.PI);
                        var waterMoved = (heightDiff / 2) * 0.1;
                        if (waterMoved > 0) {
                            diffData[x1 * width + y1] -= waterMoved;
                            diffData[x * width + y] += waterMoved;
                        }

                    }
                }
            }
        }

        // apply diff
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var value = water[x * width + y] + diffData[x * width + y];
                if (value < 0) {
                    water[x * width + y] = 0;
                } else {
                    water[x * width + y] = value;
                }
            }
        }
    };

    var getHeight = function(x, y) {
        return stone[x * worldWidth + y] + sand[x * worldWidth + y];
    };

    var getHeightWater = function(x, y) {
        return stone[x * worldWidth + y] + sand[x * worldWidth + y] + water[x * worldWidth + y];
    };

    var resize = function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    var keydown = function(event) {
        switch (event.keyCode) {
            case 87: // w
                moveForwardsKeyDown = true;
                break;
            case 83: // s
                moveBackwardsKeyDown = true;
                break;
            case 65: // a
                moveLeftKeyDown = true;
                break;
            case 68: // d
                moveRightKeyDown = true;
                break;
            case 82: // r
                //sand = generateSand(worldWidth, worldDepth);
                sand[55] = 100;
                break;
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
        update(clock.getDelta());
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
                x: 500,
                y: 500
            };
            camera.rotateOnAxis(new THREE.Vector3(0, -1, 0), mouseDiff.x * deltaTime * mouseSensitivity.x);
            camera.rotateOnAxis(new THREE.Vector3(-1, 0, 0), mouseDiff.y * deltaTime * mouseSensitivity.y);
            mousedownPosition = newMousedownPosition;
        }
        // keyboard
        var movementSpeed = 10;
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

        updateSand();
        updateWater();
        for (var i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].y = stone[i] + sand[i];
        }
        for (var i = 0; i < waterGeometry.vertices.length; i++) {
            waterGeometry.vertices[i].y = water[i] + stone[i] + sand[i];
        }
        geometry.verticesNeedUpdate = true;
        waterGeometry.verticesNeedUpdate = true;
    };

    var render = function() {
        renderer.render(scene, camera);
    };

    return {init: init};
}();

terrainSimulation.init();