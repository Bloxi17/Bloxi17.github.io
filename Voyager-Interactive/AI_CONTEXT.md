# VOYAGER: EDGE OF THE HELIOSPHERE
## Comprehensive Architecture, Data Structure & AI Context Specification

> **Target Audience:** AI Coding Agents, Multi-Agent Systems, and Human Graphics Engineers.  
> **Repository:** `Bloxi17/Bloxi17.github.io`  
> **Subdirectory:** `/Voyager-Interactive`  
> **Live Production URL:** [https://bloxi17.github.io/Voyager-Interactive/](https://bloxi17.github.io/Voyager-Interactive/)  
> **Local Port:** `http://127.0.0.1:8080/`

---

## 1. Executive Summary & Purpose

`Voyager: Edge of the Heliosphere` is a museum-grade, anti-slop 3D WebGL interactive documentary experience tracking NASA's **Voyager 1** spacecraft from its 1977 Cape Canaveral launch, through planetary gravity-assist flybys (Jupiter, Saturn, Titan), to its 2012 heliopause crossing into interstellar space.

### Core Visual Principles
1. **Archival Neoclassical / Editorial Typography:** Fonts: `Instrument Serif` (editorial display headers), `JetBrains Mono` (NASA technical telemetry / flight computers), and `Inter Tight` (body copy).
2. **Deep Space Realism:** 4K 360° Milky Way galactic panorama (`sky_pano_-_milkyway.glb`), subtle stardust, inverse-square solar decay, minimal fog (`0.00015`), and PBR specular lighting.
3. **Continuous Kinematic Motion:** Probe and camera motion are governed by parametric 3D Catmull-Rom splines (`flightPathSpline`, `cameraPathSpline`) with dampening lerp interpolation (`smoothFlightProgress`) that never snaps, drops frames, or gets disoriented.
4. **Authentic NASA 3D Assets:** 11 authentic GLB planet models (`Earth`, `Moon`, `Jupiter`, `Saturn` with rings, `Mars`, `Sun`, `Mercury`, `Venus`, `Uranus`, `Neptune`) paired with a high-fidelity Draco-compressed model of Voyager 1.

---

## 2. File & Directory Structure

```
Voyager-Interactive/
├── AI_CONTEXT.md                           # <--- THIS SPECIFICATION FILE
├── README.md                               # Public overview and quickstart
├── ASSETS.md                               # Model sources & attribution notes
├── index.html                              # SINGLE-FILE MASTER APPLICATION (~3,000 lines)
│                                           # (CSS Design System, DOM structure, Three.js WebGL scene,
│                                           #  GSAP ScrollTrigger, Web Audio synthesizer, Canvas certificate)
├── dev-server.js                           # Zero-dependency local Node.js server with GLB MIME types & CORS
├── 3d models/
│   └── Earth/                              # Source downloaded raw model archive
│       ├── Earth.glb, Jupiter.glb, Saturn.glb, Moon.glb, Mars.glb...
│       └── sky_pano_-_milkyway.glb         # 4K equirectangular Milky Way panorama
├── public/
│   └── models/
│       ├── voyager.glb                     # Official NASA Voyager 1 3D model (Draco-compressed)
│       └── planets/                        # Production GLB models loaded by Three.js
│           ├── Earth.glb (488 KB)          # Earth with landmass & atmospheric maps
│           ├── Jupiter.glb (524 KB)        # Jupiter gas giant with Great Red Spot
│           ├── Saturn.glb (333 KB)         # Saturn with 3D torus ring system
│           ├── Moon.glb (1.08 MB)          # Luna surface topography
│           ├── Mars.glb (776 KB)           # Red planet
│           ├── Sun.glb (847 KB)            # Solar sphere
│           ├── Mercury.glb (898 KB)        # Cratered surface
│           ├── Venus.glb (910 KB)          # Volcanic atmosphere
│           ├── Uranus.glb (103 KB)         # Ice giant
│           ├── Neptune.glb (267 KB)        # Deep azure gas giant
│           └── sky_pano_-_milkyway.glb     # 4.4 MB 4096x2048 equirectangular galactic background
└── tests/
    ├── aesthetic_test.js                   # Automated Puppeteer headless Chrome test suite
    └── aesthetic/                          # Automated test visual proof captures (PNG)
        ├── 01_cinematic_solar_system_reveal.png
        ├── 02_chapter1_earth_departure.png
        ├── 03_chapter2_jovian_encounter.png
        ├── 04_chapter3_saturn_gateway.png
        ├── 05_chapter4_golden_record.png
        ├── 06_turntable_console_active.png
        ├── 07_chapter5_interstellar_horizon.png
        ├── 08_archival_flight_certificate.png
        ├── 09_pale_blue_dot_modal.png
        ├── 10_craft_subsystem_inspector.png
        └── 11_inspector_telemetry_drawer.png
```

---

## 3. Data Schemas & Mathematical Models

### 3.1 Kinematic Flight Trajectory Splines

Motion is driven by normalized flight progress: `currentFlightProgress ∈ [0.0, 1.0]`.  
Progress is smoothed every frame via lerp dampening to guarantee zero stutter:

$$\text{smoothFlightProgress}_{t} = \text{smoothFlightProgress}_{t-1} + (\text{currentFlightProgress} - \text{smoothFlightProgress}_{t-1}) \times 0.08$$

#### Probe Path (`flightPathSpline` - `THREE.CatmullRomCurve3`)
| Progress ($p$) | Vector Coordinates $(X, Y, Z)$ | Mission Phase / Chapter |
|---|---|---|
| `0.00` | `(10.5, -17.8, 1.5)` | Hero Welcome / Solar System overview |
| `0.15` | `(1.2, -0.4, 0.5)` | Chapter 01: Earth Departure & Injection |
| `0.28` | `(6.5, 2.0, -18.0)` | Inner Solar System Cruise Corridor |
| `0.42` | `(18.0, 5.5, -45.0)` | Chapter 02: Jovian Gravity Slingshot |
| `0.54` | `(30.0, 11.0, -85.0)` | Jovian-Saturnian Transit Corridor |
| `0.68` | `(44.0, 18.0, -130.0)` | Chapter 03: Saturn Flyby & Northward Deflection |
| `0.82` | `(56.0, 27.0, -175.0)` | Chapter 04: The Golden Record Inspection |
| `1.00` | `(72.0, 38.0, -230.0)` | Chapter 05: Interstellar Horizon Boundary |

#### Camera Path (`cameraPathSpline` - `THREE.CatmullRomCurve3`)
| Progress ($p$) | Vector Coordinates $(X, Y, Z)$ | Cinematic Framing Focus |
|---|---|---|
| `0.00` | `(0.0, 22.0, 105.0)` | Wide celestial perspective of whole solar system |
| `0.15` | `(0.0, 1.2, 11.5)` | Medium-close hero view of Voyager with Earth in background |
| `0.28` | `(3.5, 3.2, -8.0)` | Trailing three-quarter transit perspective |
| `0.42` | `(14.0, 6.5, -34.0)` | Voyager in left foreground, massive Jupiter & moons to right |
| `0.54` | `(26.0, 12.0, -74.0)` | Deep cruise perspective looking outward |
| `0.68` | `(40.0, 19.5, -118.0)` | Voyager in foreground, ringed Saturn & Titan framed |
| `0.82` | `(54.0, 27.5, -168.0)` | Tight macro framing on Golden Record bus |
| `1.00` | `(67.0, 39.0, -216.0)` | Grand cinematic view drifting into pristine interstellar void |

#### Banking & Forward Orientation Math
```javascript
const clampedProg = THREE.MathUtils.clamp(smoothFlightProgress, 0.0001, 0.9999);
const probePos = flightPathSpline.getPointAt(clampedProg);
const tangent = flightPathSpline.getTangentAt(clampedProg).normalize();

// Probe faces along trajectory tangent
const lookTarget = probePos.clone().add(tangent);
probeAnchor.position.copy(probePos);
probeAnchor.lookAt(lookTarget);

// Spacecraft banking into curves
const bankAngle = Math.sin(clampedProg * Math.PI * 3.5) * 0.22;
probeAnchor.rotateZ(bankAngle);

// Camera tracks probe with forward velocity lead
const camTarget = probePos.clone().add(tangent.clone().multiplyScalar(1.2));
camera.lookAt(camTarget);
```

---

### 3.2 Planetary Encounters Data Structure

#### Hero Solar System Overview (`solarSystemGroup` centered at `(0, -18, 0)`)
| Planet | Model Key | Orbital Radii $(R_x, R_z)$ | Model Scale | Orbital Speed | Initial Angle |
|---|---|---|---|---|---|
| Sun | `sun` | Central $(0,0,0)$ | `2.2` | — | — |
| Mercury | `mercury` | $(11.0, 10.5)$ | `0.38` | `0.008` | `3.12` |
| Venus | `venus` | $(17.0, 16.0)$ | `0.60` | `0.005` | `3.10` |
| Earth | `earth` | $(24.0, 22.5)$ | `0.75` | `0.0035` | `3.08` |
| Mars | `mars` | $(32.0, 30.0)$ | `0.50` | `0.0025` | `3.06` |
| Jupiter | `jupiter` | $(46.0, 43.0)$ | `2.10` | `0.0012` | `0.28` |
| Saturn | `saturn` | $(62.0, 57.5)$ | `1.70` | `0.0008` | `0.18` |
| Uranus | `uranus` | $(76.0, 70.5)$ | `0.95` | `0.0005` | `0.12` |
| Neptune | `neptune` | $(90.0, 83.5)$ | `0.90` | `0.0004` | `0.08` |

#### Chapter Encounters (Detailed Close-Up 3D Groups)
1. **Earth Encounter (`earthEncounterGroup`):**
   - Position: `(-10.0, -0.5, -6.0)`
   - Earth Mesh Scale: `2.6`, Axial tilt: `-0.41` rad
   - Moon Mesh Scale: `0.7`, Local pos: `(5.5, 1.8, -2.5)`
2. **Jupiter Encounter (`jupiterEncounterGroup`):**
   - Position: `(22.0, 7.0, -48.0)`
   - Jupiter Mesh Scale: `6.5`
   - Galilean Moons (with green glowing orbit rings):
     - **Io:** Radius: `8.5`, Size: `0.28`, Color: `#e5c158`
     - **Europa:** Radius: `11.5`, Size: `0.24`, Color: `#d9e5eb`
     - **Ganymede:** Radius: `15.5`, Size: `0.38`, Color: `#9e998f`
     - **Callisto:** Radius: `20.0`, Size: `0.35`, Color: `#736c64`
3. **Saturn Encounter (`saturnEncounterGroup`):**
   - Position: `(52.0, 19.0, -135.0)`
   - Saturn Mesh Scale: `4.8`, Ring tilt: `Z: 0.45, X: 0.22`
   - **Titan:** Radius: `16.0`, Size: `0.48`, Color: `#dd9e4b`, with elliptical orbit ribbon.

---

### 3.3 Voyager 1 PBR Material Shaders

The Voyager 1 GLB model utilizes specific mesh child names targeted for custom high-end PBR materials:

```javascript
voyagerModel.traverse((child) => {
    if (child.isMesh && child.material) {
        if (child.name === 'tex_01') {
            // 3.7m High-Gain Parabolic Dish (Mirrors Milky Way & galactic dust)
            child.material.metalness = 0.82;
            child.material.roughness = 0.22;
            child.material.envMapIntensity = 2.8;
        } else if (child.name === 'tex_02_AO') {
            // Gold MLI Thermal Insulation (Golden metallic foil reflections)
            child.material.color = new THREE.Color(0xffd768);
            child.material.metalness = 0.94;
            child.material.roughness = 0.26;
            child.material.envMapIntensity = 2.5;
        } else if (child.name === 'tex_02_AO_dark') {
            // Dark Titanium/Graphite Booms & RTG Units
            child.material.metalness = 0.88;
            child.material.roughness = 0.35;
            child.material.emissive = new THREE.Color(0x280e03);
            child.material.emissiveIntensity = 0.45;
            child.material.envMapIntensity = 1.8;
        }
        child.material.needsUpdate = true;
    }
});
```

---

### 3.4 Screen-Projected HUD Markers (`projectMarker`)

To place 2D NASA leader pins directly over 3D planets in screen coordinates without clipping errors:

```javascript
function projectMarker(id, worldPos, minProg, maxProg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isInspectorActive || smoothFlightProgress < minProg || smoothFlightProgress > maxProg) {
        el.style.display = 'none';
        return;
    }
    const v = worldPos.clone().project(camera);
    // Behind camera or outside WebGL clip frustum [-1, 1]
    if (v.z > 1.0 || v.z < -1.0) {
        el.style.display = 'none';
        return;
    }
    const px = (v.x * 0.5 + 0.5) * window.innerWidth;
    const py = (-v.y * 0.5 + 0.5) * window.innerHeight;
    
    // Viewport bound safety
    if (px < -60 || px > window.innerWidth + 60 || py < -60 || py > window.innerHeight + 60) {
        el.style.display = 'none';
        return;
    }
    el.style.display = 'flex';
    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
}
```

---

### 3.5 Real-Time Telemetry Formulas

1. **Heliocentric Distance ($AU$):**
   $$D(p) = 1.0 + (p^{1.28} \times 162.8)$$
   $$\text{Distance in km} = D(p) \times 149,597,870.7$$
2. **One-Way Radio Light Delay ($\Delta t$):**
   $$\Delta t = D(p) \times 499.00478 \text{ seconds}$$
3. **RTG Wattage Decay ($W$):**
   $$t_{\text{years}} = p \times 48.0$$
   $$W = 470 \times (0.5)^{t_{\text{years}} / 87.7} \times (1 - t_{\text{years}} \times 0.005)$$
4. **Heliocentric Velocity ($v$):**
   - Earth Ascent: $16.5 \rightarrow 18.0 \text{ km/s}$
   - Jupiter Slingshot Boost: $18.0 + \sin\left(\frac{p - 0.25}{0.25} \pi\right) \times 4.2 \text{ km/s}$
   - Interstellar Cruise: $17.02 \text{ km/s}$ ($38,072 \text{ mph}$)

---

## 4. Interactive Subsystems

### 4.1 3D Craft Subsystem Inspector (`subsystemsData`)
Triggered via `[🛰️ INSPECT CRAFT]` button, bottom dock button, or key `'i'`.

| Subsystem Key | Subsystem Title | Local Probe Position | Key Specifications |
|---|---|---|---|
| `dish` | 3.7m High-Gain Dish (HGA) | `(0, 1.2, 0)` | 23W X-Band, 0.5° Beamwidth, 160 bps, DSS-14 Lock |
| `record` | The Golden Record | `(-1.1, -0.2, 0.4)` | Gold-Plated Copper, 16⅔ RPM, U-238 Stylus, >1B Yrs |
| `rtg` | Pu-238 RTG Generators | `(1.6, -0.4, -0.6)` | 470W Launch / ~240W Current, Plutonium-238 Decay |
| `camera` | Scan Platform & Cameras | `(-1.8, 0.4, -0.5)` | 1500mm Optics, Vidicon Tubes, Powered Down 1990 |
| `mag` | 13m Magnetometer Boom | `(0, -1.8, -1.2)` | 13m Deployable Boom, 0.002 nT Sensitivity |

### 4.2 Procedural Audio Synthesizer (`DeepSpaceSynthesizer`)
Built entirely on HTML5 Web Audio API without audio samples or external files:
- **Track 1 (Earth Symphony):** Dual triangle/sine detuned oscillators ($110\text{ Hz} + 164.81\text{ Hz}$) through a modulated lowpass filter with slow $0.15\text{ Hz}$ LFO swell.
- **Track 2 (Analog Vinyl Carrier):** Procedurally generated white noise buffer bandpassed at $1200\text{ Hz}$ mixed with a pristine $1000\text{ Hz}$ sine tone.
- **Track 3 (Interstellar Plasma Wave):** $2800\text{ Hz} \rightarrow 3400\text{ Hz}$ exponential frequency chirp modulated by a $0.4\text{ Hz}$ vibrato LFO.

### 4.3 Archival Certificate Generator (`generateArchivalCertificate`)
Draws directly on a $2400 \times 1500$ 2D HTML5 `<canvas id="cert-canvas">`:
- Deep obsidian `#07090D` background with radial stardust particles.
- Double gold hairline guilloché borders (`#F2B66D`) and neoclassical corner brackets.
- NASA / JPL typographical headers in `Instrument Serif` and `JetBrains Mono`.
- Personalized user callsign with formal diplomatic text.
- $2 \times 2$ technical telemetry quadrant matrix.
- Dynamic UTC issuance timestamp and pseudo-cryptographic SHA-256 validation hash.
- Exported via `canvas.toDataURL('image/png')` for instantaneous lossless PNG download.

### 4.4 Pale Blue Dot Modal (`pbd-modal`)
Triggered via `[🔭 Pale Blue Dot]` button or `'p'` key:
- Recreates the historic Feb 14, 1990 narrow-angle camera frame taken from $40.5\text{ AU}$ ($6\text{ billion km}$).
- Features the diagonal solar flare sunbeam and the $0.12\text{ pixel}$ cyan Earth dot with Carl Sagan's iconic prose.

---

## 5. Execution & Deployment Guide

### Running Locally
```bash
# 1. Navigate to directory
cd "G:\Portfolio ainesh\Voyager-Interactive"

# 2. Run local node server (handles GLB MIME types & CORS)
node dev-server.js

# 3. Open in browser
http://127.0.0.1:8080/
```

### Running on GitHub Pages
- The repository root `Bloxi17.github.io` is a GitHub Pages site.
- Production URL: **`https://bloxi17.github.io/Voyager-Interactive/`**
- Main Portfolio Integration: **`https://bloxi17.github.io/`** (Card #007: "Voyager: Edge of the Heliosphere").

---

## 6. Verification & Automated Testing Suite

The project includes an end-to-end headless Chrome Puppeteer test:
```bash
node tests/aesthetic_test.js
```

### Verified Acceptance Criteria:
1. **Zero Console Errors:** Zero unhandled exceptions, zero network 404s for 3D GLBs or audio.
2. **Zero Preloader Hangs:** Assets load cleanly and trigger `startReveal()` with preloader fade-out.
3. **Continuous Scroll Kinematics:** Smooth progress lerping between all chapters without camera disorientations or clipping.
4. **Interactive Modals:** Inspector opens and closes via DOM/keyboard, Certificate renders at $2400 \times 1500$, Pale Blue Dot opens/closes.
5. **DOM Verification Proofs:** Output PNG captures in `tests/aesthetic/` matching reference photography.

---

## 7. Guidelines for Future AI Modification

If you are an AI assistant extending or modifying this project:
1. **Maintain Single-File Integrity:** Keep HTML, CSS, and JS inside `index.html` unless adding modular sub-libraries. Do not break the unified deployment pipeline.
2. **Preserve Asset Paths:** Planet models must stay in `public/models/planets/` and reference `public/models/planets/<Name>.glb`.
3. **Avoid Stepped Camera Cuts:** All camera and spacecraft movement should evaluate `flightPathSpline` and `cameraPathSpline` using `smoothFlightProgress`. Never use hardcoded absolute cuts during scrolling.
4. **Preserve PBR Material Names:** `tex_01` (dish), `tex_02_AO` (gold foil), and `tex_02_AO_dark` (booms) are internal names inside `voyager.glb`. Do not rename them.
5. **No External Audio Files:** Audio must remain procedurally synthesized via `DeepSpaceSynthesizer` to avoid external CORS, licensing, or 404 errors.
