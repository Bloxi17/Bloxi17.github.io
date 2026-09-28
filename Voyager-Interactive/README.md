# Voyager: Edge of the Heliosphere

An interactive, 3D scroll-telling web documentary built with Three.js and GSAP. 

## Features
- **Procedural 3D Modeling:** The Voyager 1 probe is procedurally generated using Three.js geometries (Cylinders, Boxes, and custom materials) — no external `.gltf` or `.obj` files required.
- **Scroll-Telling Camera:** Uses GSAP ScrollTrigger to tie the WebGL camera position and rotation directly to the user's scroll depth.
- **Cinematic Lighting:** Features directional and point lighting to simulate the sun and deep space.
- **Responsive Design:** The canvas resizes automatically, and HTML content floats over the 3D rendering.

## Tech Stack
- HTML / CSS / Vanilla JavaScript
- [Three.js](https://threejs.org/) (WebGL rendering)
- [GSAP](https://greensock.com/gsap/) (Scroll-linked animation timelines)

## Usage
Simply open `index.html` in any modern web browser. Scroll down the page to trigger the cinematic camera movements and progress the story.
