/*global webglUtils, webglLessonsUI*/
"use strict";

const slides = {
    iterations: undefined,
    zoom: undefined
};

const camera = {
    _zoom: 1.0,
    set zoom (zm) {
        this._zoom = zm;
        if (slides.zoom != undefined)
        {
            slides.zoom.updateValue(zm);
        }
    },
    get zoom() {
        return this._zoom;
    },
    get inverseZoom() {
        return 1.0 / this._zoom;
    },
    _maxIterations: 1000,
    set maxIterations(iter){
        this._maxIterations = iter;
        if (slides.iterations != undefined)
        {
            slides.iterations.updateValue(iter);
        }
    },
    get maxIterations() {
        return this._maxIterations;
    },
    maxIterationsCap: 10000
};

const drag = {
    active: false,
    initialX: 0,
    initialY: 0,
    currentX: 0,
    currentY: 0,
    xOffset: 0,
    yOffset: 0
};

// eslint-disable-next-line no-unused-vars
function main() {
    const canvas = document.querySelector("#canvas");

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // setup GLSL program
    const program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
    gl.useProgram(program);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // Create a buffer to put three 2d clip space points in
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0); // size, type, normalize, stride, offset

    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    const iterationUniformLocation = gl.getUniformLocation(program, "u_maxIterations");
    gl.uniform1i(iterationUniformLocation, camera.maxIterations);
    
    const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);

    const zoomUniform = gl.getUniformLocation(program, "u_zoom");
    gl.uniform1f(zoomUniform, camera.inverseZoom);

    drag.currentX = canvas.width / 2;
    drag.currentY = canvas.height / 2;
    drag.xOffset = canvas.width / 2;
    drag.yOffset = canvas.height / 2;
    const centerUniform = gl.getUniformLocation(program, "u_center");
    gl.uniform2f(centerUniform, drag.currentX, drag.currentX);

    canvas.addEventListener('wheel', (e) => {
        camera.zoom *= 1 - e.deltaY / 1000;
        camera.maxIterations *= 1 - e.deltaY / 5000;
        camera.maxIterations = Math.min(camera.maxIterations, camera.maxIterationsCap);
        console.log(camera.maxIterations);
    }, false);


    canvas.addEventListener("touchstart", dragStart, false);
    canvas.addEventListener("touchend", dragEnd, false);
    canvas.addEventListener("touchmove", dragging, false);

    canvas.addEventListener("mousedown", dragStart, false);
    canvas.addEventListener("mouseup", dragEnd, false);
    canvas.addEventListener("mousemove", dragging, false);

    function dragStart(e) {
        if (e.type === "touchstart") {
            drag.initialX = e.touches[0].clientX * camera.inverseZoom - drag.xOffset;
            drag.initialY = e.touches[0].clientY * camera.inverseZoom - drag.yOffset;
        } else {
            drag.initialX = e.clientX * camera.inverseZoom - drag.xOffset;
            drag.initialY = e.clientY * camera.inverseZoom - drag.yOffset;
        }

        drag.active = true;
    }

    function dragEnd() {
        drag.initialX = drag.currentX;
        drag.initialY = drag.currentY;

        drag.active = false;
    }

    function dragging(e) {
        if (drag.active) {
            e.preventDefault();

            if (e.type === "touchmove") {
                drag.currentX = e.touches[0].clientX * camera.inverseZoom - drag.initialX;
                drag.currentY = e.touches[0].clientY * camera.inverseZoom - drag.initialY;
            } else {
                drag.currentX = e.clientX * camera.inverseZoom - drag.initialX;
                drag.currentY = e.clientY * camera.inverseZoom - drag.initialY;
            }

            drag.xOffset = drag.currentX;
            drag.yOffset = drag.currentY;         
        }
    }

    slides.iterations = webglLessonsUI.setupSlider("#iterations", {slide: (event, ui) => {camera.maxIterations = ui.value;}, min: 1, max: camera.maxIterationsCap});
    slides.iterations.updateValue(camera.maxIterations);
    slides.zoom = webglLessonsUI.setupSlider("#zoom", {slide: updateZoom, min: 0.01, max: 500, step: 0.01, precision: 2});
    slides.zoom.updateValue(camera.zoom);

    function updateZoom(event, ui)
    {
        camera.maxIterations *= ui.value > camera.zoom ? 1.02 : 0.98;
        camera.zoom = ui.value;
    }

    render(gl, program);
}

function render(gl, program) {
    const zoomUniform = gl.getUniformLocation(program, "u_zoom");
    gl.uniform1f(zoomUniform, camera.inverseZoom);

    const centerUniform = gl.getUniformLocation(program, "u_center");
    gl.uniform2f(centerUniform, drag.currentX, drag.currentY);

    const iterationUniformLocation = gl.getUniformLocation(program, "u_maxIterations");
    gl.uniform1i(iterationUniformLocation, camera.maxIterations);

    gl.drawArrays(gl.TRIANGLES, 0, 6); // primitiveType, offset, count

    requestAnimationFrame(() => render(gl, program));
}