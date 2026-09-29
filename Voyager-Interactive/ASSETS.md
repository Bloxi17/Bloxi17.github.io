# Asset Credits & Attribution

## 3D Models
### Voyager 1 Spacecraft
* **File:** `public/models/voyager.glb` (1.64 MB, 4 meshes, 3 materials, 4 embedded PBR maps)
* **Optimization:** glTF 2.0 Draco compression via `@gltf-transform/cli`
* **Source:** [NASA 3D Resources / NASA Science](https://science.nasa.gov/) (Voyager Probe B)
* **License:** Public Domain / NASA Guidelines
* **Attribution:** Model courtesy of NASA / JPL-Caltech.

---

## Planetary & Celestial Textures
All planetary and sky textures sourced from Solar System Scope in 2K equirectangular map projection:
* **Files:**
  * `public/textures/sun.jpg` (2048×1024)
  * `public/textures/earth_day.jpg` (2048×1024)
  * `public/textures/earth_clouds.png` (2048×1024, true 32-bit alpha transparency)
  * `public/textures/mars.jpg` (2048×1024)
  * `public/textures/jupiter.jpg` (2048×1024)
  * `public/textures/saturn.jpg` (2048×1024)
  * `public/textures/saturn_ring.png` (2048×125, alpha transparency ring strip)
  * `public/textures/milkyway.jpg` (2048×1024, 360° deep-space celestial dome)
* **Source:** [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)
* **License:** CC BY 4.0 (Creative Commons Attribution 4.0 International)
* **Attribution:** Textures provided by Solar System Scope (https://www.solarsystemscope.com/textures/) under Creative Commons Attribution 4.0 International License.

---

## Vendor Libraries & Addons
* **Files (`public/vendor/`):**
  * `OrbitControls.js`
  * `EffectComposer.js`
  * `RenderPass.js`
  * `ShaderPass.js`
  * `UnrealBloomPass.js`
  * `CopyShader.js`
  * `LuminosityHighPassShader.js`
* **Source:** Three.js repository (`mrdoob/three.js` r128 addons)
* **License:** MIT License (Copyright (c) 2010-2024 Three.js authors)

---

## Procedural Sound Synthesis
* **Implementation:** HTML5 Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`, procedural white/pink noise buffer generator).
* **Dependencies:** None (zero external audio media files, zero external network requests).
