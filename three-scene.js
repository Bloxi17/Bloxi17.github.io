/**
 * three-scene.js — Interactive 3D Background & Scroll-Linked Core Engine
 * Powered by Three.js with hardware-accelerated WebGL + Direct Manipulation Physics
 */

class Interactive3DScene {
  constructor() {
    this.container = document.getElementById('webgl-background');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Mesh Groups
    this.mainGroup = null;
    this.coreMesh = null;
    this.wireframeMesh = null;
    this.particleField = null;

    // Interaction & Animation State
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    // Drag / Momentum Physics (Apple Direct Manipulation)
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragRotX = 0;
    this.dragRotY = 0;
    this.dragVelX = 0;
    this.dragVelY = 0;
    this.lastDragTime = 0;

    // Scroll interpolation targets
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    // Customizable Playground Parameters
    this.params = {
      spinSpeed: 1.0,
      wireframeColor: 0x3b82f6,
      coreColor: 0x18181c,
      wireframeVisible: true,
      coreVisible: true,
      particleCount: 160
    };

    this.init();
  }

  async init() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      try {
        await this.loadThreeScript();
      } catch (e) {
        console.warn('Three.js failed to load, falling back to Canvas 3D engine.', e);
        this.initCanvasFallback();
        return;
      }
    }

    this.setupThree();
    this.createGeometry();
    this.createParticles();
    this.createLights();
    this.bindEvents();
    this.animate();
  }

  loadThreeScript() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('CDN unreachable'));
      document.head.appendChild(script);
    });
  }

  setupThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x09090b, 0.05);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);
  }

  createGeometry() {
    // Outer kinetic Icosahedron Wireframe
    const outerGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: this.params.wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.wireframeMesh = new THREE.Mesh(outerGeo, wireframeMat);
    this.mainGroup.add(this.wireframeMesh);

    // Inner Faceted Core with Specular Reflectance
    const innerGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: this.params.coreColor,
      metalness: 0.85,
      roughness: 0.25,
      flatShading: true,
      wireframe: false
    });
    this.coreMesh = new THREE.Mesh(innerGeo, coreMat);
    this.mainGroup.add(this.coreMesh);

    // Add glowing vertex nodes
    const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const pos = outerGeo.attributes.position;
    this.nodesGroup = new THREE.Group();

    for (let i = 0; i < pos.count; i += 3) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      this.nodesGroup.add(node);
    }
    this.mainGroup.add(this.nodesGroup);
  }

  createParticles() {
    const pCount = this.params.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    this.particleField = new THREE.Points(geometry, material);
    this.scene.add(this.particleField);
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    this.pointLight1 = new THREE.PointLight(0x3b82f6, 3, 20);
    this.pointLight1.position.set(4, 3, 5);
    this.scene.add(this.pointLight1);

    this.pointLight2 = new THREE.PointLight(0xffffff, 1.5, 15);
    this.pointLight2.position.set(-4, -3, -2);
    this.scene.add(this.pointLight2);
  }

  bindEvents() {
    // Window resize
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pointer move for subtle camera tracking
    window.addEventListener('pointermove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Update point light to track cursor subtly
      if (this.pointLight1) {
        this.pointLight1.position.x = this.targetMouseX * 5;
        this.pointLight1.position.y = -this.targetMouseY * 5;
      }
    }, { passive: true });

    // Direct Manipulation (Drag to rotate 3D core)
    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastDragTime = performance.now();
      this.dragVelX = 0;
      this.dragVelY = 0;
      this.container.setPointerCapture(e.pointerId);
    });

    this.container.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastDragTime);

      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;

      this.dragVelY = (dx / dt) * 0.08;
      this.dragVelX = (dy / dt) * 0.08;

      this.dragRotY += dx * 0.006;
      this.dragRotX += dy * 0.006;

      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastDragTime = now;
    });

    const endDrag = () => {
      this.isDragging = false;
    };
    this.container.addEventListener('pointerup', endDrag);
    this.container.addEventListener('pointercancel', endDrag);

    // Scroll progress observation
    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Pause rendering when tab is hidden to conserve GPU/battery
    if (document.hidden) return;

    // Smooth dampening of mouse tracking
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Smooth scroll interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;

    // Apply drag velocity with momentum decay
    if (!this.isDragging) {
      this.dragVelX *= 0.94;
      this.dragVelY *= 0.94;
      this.dragRotX += this.dragVelX;
      this.dragRotY += this.dragVelY;
    }

    if (this.mainGroup) {
      // Base continuous rotation
      const time = performance.now() * 0.0006 * this.params.spinSpeed;

      this.mainGroup.rotation.x = time * 0.6 + this.mouseY * 0.35 + this.dragRotX;
      this.mainGroup.rotation.y = time + this.mouseX * 0.45 + this.dragRotY;

      // Scroll-Linked Spatial Transformation
      // 0.0 (Hero): Center-right, scale 1.0
      // 0.3 (Projects): Translates to left side, expands scale
      // 0.7 (Capabilities): Shifts back right, topological tilt
      // 1.0 (Contact): Centers and contracts into focal core
      const p = this.scrollProgress;

      let targetPosX = 1.8;
      let targetPosY = 0;
      let targetPosZ = 0;
      let targetScale = 1.0;

      if (p < 0.25) {
        // Hero stage
        const t = p / 0.25;
        targetPosX = 1.6 - t * 0.8;
        targetPosY = -t * 0.5;
        targetScale = 1.0 + t * 0.2;
      } else if (p < 0.65) {
        // Projects / Case Studies stage
        const t = (p - 0.25) / 0.4;
        targetPosX = 0.8 - t * 2.2; // Move to the left
        targetPosY = -0.5 + t * 0.8;
        targetScale = 1.2 - t * 0.1;
      } else if (p < 0.85) {
        // Capabilities Bento stage
        const t = (p - 0.65) / 0.2;
        targetPosX = -1.4 + t * 2.8; // Move to the right
        targetPosY = 0.3 - t * 0.6;
        targetScale = 1.1;
      } else {
        // Contact stage
        const t = (p - 0.85) / 0.15;
        targetPosX = 1.4 - t * 1.4; // Center
        targetPosY = -0.3 + t * 0.3;
        targetScale = 1.1 - t * 0.25;
      }

      // Responsive offset for mobile screens
      if (window.innerWidth < 768) {
        targetPosX *= 0.3; // keep closer to center on narrow screens
        targetScale *= 0.85;
      }

      this.mainGroup.position.x += (targetPosX - this.mainGroup.position.x) * 0.06;
      this.mainGroup.position.y += (targetPosY - this.mainGroup.position.y) * 0.06;
      this.mainGroup.position.z += (targetPosZ - this.mainGroup.position.z) * 0.06;

      const currentScale = this.mainGroup.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.06;
      this.mainGroup.scale.set(newScale, newScale, newScale);

      // Inner core independent counter-rotation
      if (this.coreMesh) {
        this.coreMesh.rotation.y = -time * 1.2;
        this.coreMesh.rotation.z = time * 0.4;
      }
    }

    if (this.particleField) {
      this.particleField.rotation.y = performance.now() * 0.0001;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Parameter controls from on-page playground
  setSpinSpeed(val) {
    this.params.spinSpeed = parseFloat(val);
  }

  setWireframeMode(enabled) {
    this.params.wireframeVisible = enabled;
    if (this.wireframeMesh) this.wireframeMesh.visible = enabled;
    if (this.nodesGroup) this.nodesGroup.visible = enabled;
  }

  setCoreMode(enabled) {
    this.params.coreVisible = enabled;
    if (this.coreMesh) this.coreMesh.visible = enabled;
  }

  setWireframeColor(hexColor) {
    if (this.wireframeMesh) {
      this.wireframeMesh.material.color.set(hexColor);
    }
  }

  // Graceful Canvas 2D fallback if WebGL is unavailable
  initCanvasFallback() {
    const ctx = this.container.getContext('2d');
    if (!ctx) return;

    let rotY = 0;
    const render = () => {
      ctx.clearRect(0, 0, this.container.width, this.container.height);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      
      const cx = this.container.width / 2;
      const cy = this.container.height / 2;
      rotY += 0.01;

      ctx.beginPath();
      ctx.arc(cx, cy, 80 + Math.sin(rotY) * 10, 0, Math.PI * 2);
      ctx.stroke();

      requestAnimationFrame(render);
    };
    render();
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.interactive3D = new Interactive3DScene();
});
