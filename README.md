# Webgl2 Mandelbrot Set
A simple version of the Mandelbrot Set to learn and explore WebGL and shaders. This project was created to learn WebGL and explore its advantages.

## How it works
live preview [here](https://cgessinger.github.io/Webgl2-Mandelbrot-Set/)
You can Zoom using the mouse wheel or touchpad scrolling. Scrolling on mobile is not working yet.

You can move by just dragging. Dragging works on mobile and pc.

Keep in mind that currently, the colors are random. That's why sometimes the page seems empty. Try refreshing and find a cool color set.

## Why WebGL and why WebGL2?
In the first place, WebGL is an API to run so-called shaders on the GPU instead of the CPU. 
Since the GPU is normally much faster than the CPU, many programs can benefit of much better performance.
I choose WebGL as it's running in the browser and therefore can be used by almost anyone. 
I decided not to use other libraries like three.js or pixijs as I wanted to learn the low-level background of rendering and shaders. 
Also, for the projects I have in mind, learning WebGL takes the same amount of time as any other library.
Still, I decided to go with WebGL2 because it has a few benefits over WebGL1 and is finally supported by all modern browsers.

Other WebGL projects coming soon...
