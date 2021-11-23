/*global webglUtils*/
"use strict";

const camera = {
    zoom: 1.0,
    maxIterations: 1000
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
    gl.uniform1f(zoomUniform, camera.zoom);

    drag.currentX = canvas.width / 2;
    drag.currentY = canvas.height / 2;
    drag.xOffset = canvas.width / 2;
    drag.yOffset = canvas.height / 2;
    const centerUniform = gl.getUniformLocation(program, "u_center");
    gl.uniform2f(centerUniform, drag.currentX, drag.currentX);

    canvas.addEventListener('wheel', (e) => {
        camera.zoom *= 1 + e.deltaY / 1000;
        camera.maxIterations *= 1 - e.deltaY / 5000;
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
            drag.initialX = e.touches[0].clientX * camera.zoom - drag.xOffset;
            drag.initialY = e.touches[0].clientY * camera.zoom - drag.yOffset;
        } else {
            drag.initialX = e.clientX * camera.zoom - drag.xOffset;
            drag.initialY = e.clientY * camera.zoom - drag.yOffset;
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
                drag.currentX = e.touches[0].clientX * camera.zoom - drag.initialX;
                drag.currentY = e.touches[0].clientY * camera.zoom - drag.initialY;
            } else {
                drag.currentX = e.clientX * camera.zoom - drag.initialX;
                drag.currentY = e.clientY * camera.zoom - drag.initialY;
            }

            drag.xOffset = drag.currentX;
            drag.yOffset = drag.currentY;         
        }
    }


    render(gl, program);
}

function render(gl, program) {
    const zoomUniform = gl.getUniformLocation(program, "u_zoom");
    gl.uniform1f(zoomUniform, camera.zoom);

    const centerUniform = gl.getUniformLocation(program, "u_center");
    gl.uniform2f(centerUniform, drag.currentX, drag.currentY);

    const iterationUniformLocation = gl.getUniformLocation(program, "u_maxIterations");
    gl.uniform1i(iterationUniformLocation, camera.maxIterations);

    gl.drawArrays(gl.TRIANGLES, 0, 6); // primitiveType, offset, count

    requestAnimationFrame(() => render(gl, program));
}