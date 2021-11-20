/*global webglUtils*/

"use strict";

var zoom_active = false;
var move_active = false;
var mouseX = 0;
var mouseY = 0;
var scaling = [2.0, 2.0];
var center = [0.0, 0.0];

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

    const maxIterationUniform = gl.getUniformLocation(program, "u_maxInterations");
    gl.uniform1i(maxIterationUniform, 1000);

    const scaleUniform = gl.getUniformLocation(program, "u_scale");
    gl.uniform2fv(scaleUniform, scaling);

    const centerUniform = gl.getUniformLocation(program, "u_center");
    gl.uniform2fv(centerUniform, center);

    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
    

    /*
    canvas.addEventListener('wheel', (e) => {
        changeZoom(gl, program, zoomUniform, e.deltaY * 0.1);
        render(gl, program);
    }, false);
    */

    canvas.addEventListener('mousedown', (e) => {
        zoom_active = true;
        move_active = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, false);

    canvas.addEventListener('mouseup', () => {
        zoom_active = false;
        move_active = false;
    }, false);

    canvas.addEventListener('mousemove', (e) => {
        if(move_active)
        {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    }, false);

    render(gl, program);
}

function render(gl, program) {
    if(zoom_active)
    {
        var scaleUniform = gl.getUniformLocation(program, "u_scale");
        scaling[0] *= 1 / 1.01;
        scaling[1] *= 1 / 1.01;
        gl.uniform2fv(scaleUniform, scaling);

        var centerUniform = gl.getUniformLocation(program, "u_center");
        center[0] =  ( (mouseX - center[0] * scaling[0]) / gl.canvas.width * 2.0 - 1.0 );
        center[1] = - ( (mouseY - center[1] * scaling[1]) / gl.canvas.height * 2.0 - 1.0 );
        gl.uniform2fv(centerUniform, center);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6); // primitiveType, offset, count

    requestAnimationFrame(() => render(gl, program));
}