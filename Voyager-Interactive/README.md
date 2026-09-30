# Voyager: Edge of the Heliosphere

An interactive, museum-grade 3D WebGL scroll-telling documentary tracking the historic interstellar journey of NASA's Voyager 1 spacecraft.

Built with Three.js, GSAP ScrollTrigger, and HTML5 Web Audio & Canvas APIs.

---

## Live Features & Capabilities

### 1. 3D WebGL Kinematic Scroll Experience
* **Official NASA Voyager 1 Probe:** High-fidelity 3D spacecraft model with Draco compression, featuring the 3.7m High-Gain Dish, scan platform, RTG generators, magnetometer boom, and Golden Record.
* **Cinematic Planetary Encounters:**
  * **Sol (Sun):** Self-illuminated solar core with procedural pulsing corona.
  * **Earth:** Dual-mesh sphere with high-res surface geography and independently rotating atmospheric cloud layer with true alpha transparency.
  * **Mars:** Red planet waypoint along the inner system trajectory.
  * **Jupiter:** High-resolution banded gas giant featuring the Great Red Spot.
  * **Saturn:** Realistic oblate spheroid with UV-mapped radial ring geometry (`saturn_ring.png` with transparency) that casts dynamic shadows.
* **Lighting Arc & Post-Processing:**
  * Dynamic solar light decay calibrated inverse-square from 1.0 AU to 160+ AU.
  * High-performance Three.js `UnrealBloomPass` + `EffectComposer` pipeline generating atmospheric solar glow and metallic dish specular highlights.
* **Astronomical Trajectory & Waveforms:**
  * Faint planetary orbit circles around Sol for Earth, Mars, Jupiter, and Saturn.
  * 3D Catmull-Rom hyperbolic flight spline showing Voyager's trajectory out of the ecliptic.
  * Live concentric radio wavefront pulses emanating along the 3.7m dish vector toward Earth.

---

### 2. Interactive Systems & Subsystem Suite

#### 🛰️ 3D Craft Subsystem Inspector Mode (`[🛰️ INSPECT CRAFT]` or `I` Key)
* Freezes flight trajectory and centers Voyager 1 in viewport.
* Activates 360° `OrbitControls` mouse drag rotation and scroll zoom.
* Projects 5 interactive 3D screen-space hotspot reticles:
  1. **3.7m High-Gain Dish (HGA):** Microwave S/X-band telecommunications specs.
  2. **Scan Platform & Cameras:** Wide/Narrow angle camera optics and shutter status.
  3. **The Golden Record:** Phonograph cover inscriptions and symbolic pulsar map.
  4. **Pu-238 RTG Power Units:** Plutonium decay curve and current wattage output.
  5. **13m Magnetometer Boom:** Triaxial fluxgate instruments and interstellar field readings.
* Clicking any hotspot opens a sliding glassmorphic technical telemetry drawer.
* Pressing `ESC` or clicking `Resume Mission` restores flight path.

#### 🔭 "Pale Blue Dot" Reverence Modal (`[🔭 PALE BLUE DOT]` or `P` Key)
* Recreates the iconic February 14, 1990 narrow-angle camera frame taken from 40.5 AU (6 billion km).
* Features the diagonal golden solar ray, pulsing 0.12-pixel cyan Earth dot, targeting reticle, and Carl Sagan's historic quote.

#### 🎵 Golden Record Turntable Console & Web Audio Synthesizer (`[🔊 AUDIO: ON/OFF]` or `M` Key)
* Interactive phonograph turntable in Chapter 4 with spinning gold record and live frequency visualizer bars.
* 100% zero-dependency Web Audio API procedural sound synthesizer:
  * **Track 01 — Earth Symphony:** Multiphonic harmonic drone, pink-noise ocean waves, and thunderous low-frequency rumbles.
  * **Track 02 — Analog Carrier & Grooves:** 16⅔ RPM vinyl surface friction crackle and 1 kHz NASA telemetry carrier wave.
  * **Track 03 — Interstellar Plasma Whistle:** Gliding high-frequency sine whistle simulating Voyager 1's plasma wave instrument detecting interstellar space.

#### 📜 Interstellar Flight Dispatch Certificate Generator
* Interactive terminal in Chapter 5 allowing observers to register their callsign or name.
* High-resolution 1200×750 HTML5 archival canvas renderer complete with gold security borders, NASA/JPL seals, mission kinematics (velocity, distance, light time), and cryptographic verification hash.
* Instant 1-click PNG certificate download.

#### ⏱️ Real-Time NASA / JPL DSN Telemetry HUD Layer
* **Live UTC Clock & Elapsed Mission Time:** Calculates continuous mission time (`T+48Y 23D...`) since September 5, 1977 launch.
* **Deep Space Network Ground Station Lock:** Real-time cycle between Goldstone (DSS-14), Canberra (DSS-43), and Madrid (DSS-63).
* **Kinematics:** Dynamic velocity in MPH and KM/S, distance in AU and billions of KM, one-way radio light time, and RTG electrical wattage decay curve.
* **Right-Rail Mission Scrubber:** Five interactive chapter milestones with scroll-progress indicator.

---

## Development & Test Scripts

### 1. Start Local Dev Server
```bash
# Node server (serves on port 8080)
node dev-server.js

# Or using Python
python -m http.server 8080
```
Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in any modern browser.

### 2. Run Automated Browser Verification Suite
```bash
node tests/stage4_test.js
```
Automated headless Chrome test verifies:
* 0 console errors and 0 console warnings across the entire session.
* Captures high-resolution chapter screenshots into `tests/stage4/`:
  * `chapter_01_earth_departure.png`
  * `chapter_02_jovian_encounter.png`
  * `chapter_03_saturn_gateway.png`
  * `chapter_04_golden_record.png`
  * `chapter_05_interstellar_horizon.png`
* Captures interactive feature proofs:
  * `feature_01_craft_inspector.png`
  * `feature_02_hotspot_telemetry_drawer.png`
  * `feature_03_pale_blue_dot_modal.png`
  * `feature_04_turntable_console_active.png`
  * `feature_05_interstellar_flight_certificate.png`
  * `full_scroll_end.png`
* Captures 15 continuous top-to-bottom scroll recording frames in `tests/stage4/frames/frame_01.png` to `frame_15.png`.

---

## Asset Attribution & Licenses

### 3D Models (`public/models/`)
* **`voyager.glb`**:
  * **Description:** Official high-fidelity 3D model of Voyager 1 with PBR materials, high-gain dish, science booms, RTG power units, and Golden Record.
  * **Format:** glTF 2.0 Binary (Draco compressed, 1.64 MB).
  * **Source:** [NASA 3D Resources / NASA Science](https://science.nasa.gov/)
  * **License:** Public Domain / NASA Guidelines.
  * **Attribution:** Model courtesy of NASA / JPL-Caltech.

### Textures (`public/textures/`)
All spherical textures are 2K equirectangular projections (2048×1024):
* **`sun.jpg`** — 2048×1024
* **`earth_day.jpg`** — 2048×1024
* **`earth_clouds.png`** — 2048×1024 (True 32-bit RGBA alpha transparency)
* **`mars.jpg`** — 2048×1024
* **`jupiter.jpg`** — 2048×1024
* **`saturn.jpg`** — 2048×1024
* **`saturn_ring.png`** — 2048×125 (Radial strip with alpha transparency)
* **`milkyway.jpg`** — 2048×1024 (360° celestial sphere)
* **Source:** [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)
* **License:** Creative Commons Attribution 4.0 International (CC BY 4.0).
* **Attribution:** Textures provided by Solar System Scope (https://www.solarsystemscope.com/textures/).

### Vendor Libraries (`public/vendor/`)
* `OrbitControls.js`, `EffectComposer.js`, `RenderPass.js`, `ShaderPass.js`, `UnrealBloomPass.js`, `CopyShader.js`, `LuminosityHighPassShader.js`
* **Source:** Three.js addons repository (r128)
* **License:** MIT License.

---

## 🤖 Full Context for AI Assistants

For full technical specifications, 3D scene graph schemas, parametric spline coordinates, and Web Audio DSP diagrams, consult the dedicated context file:
👉 **[`AI_CONTEXT.md`](AI_CONTEXT.md)**

