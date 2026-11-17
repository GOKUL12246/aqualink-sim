import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimulation } from '../context/SimulationContext';
import {
  Eye, RotateCw, Play, Pause, ArrowDownUp,
  Sliders, Sparkles, Layers, Camera, Activity
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: crisp high-contrast canvas-texture sprite label with badge
// ─────────────────────────────────────────────────────────────────────────────
function makeTextSprite(
  title: string,
  badge: string,
  accentColor = '#00f2fe',
  bgColor = 'rgba(2, 10, 22, 0.94)'
) {
  const W = 960, H = 160;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Smooth dark capsule background
  ctx.fillStyle = bgColor;
  (ctx as CanvasRenderingContext2D).roundRect(6, 6, W - 12, H - 12, 24);
  ctx.fill();

  // Vibrant neon border
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3.5;
  (ctx as CanvasRenderingContext2D).roundRect(6, 6, W - 12, H - 12, 24);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Badge pill on left
  const badgeWidth = 160;
  ctx.fillStyle = accentColor;
  (ctx as CanvasRenderingContext2D).roundRect(28, 32, badgeWidth, 96, 14);
  ctx.fill();

  ctx.fillStyle = '#020813';
  ctx.font = 'bold 40px "Rajdhani", "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, 28 + badgeWidth / 2, 80);

  // Main title text in crisp bright white
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 48px "Rajdhani", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 28 + badgeWidth + 28, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.5, 0.75, 1);
  return sprite;
}

// ─────────────────────────────────────────────────────────────────────────────
// Packet trail type
// ─────────────────────────────────────────────────────────────────────────────
interface PacketTrail {
  mesh: THREE.Mesh;
  glow: THREE.Mesh;   // larger additive glow behind packet
  t: number;
  speed: number;
  offset: number;
  waypoints: THREE.Vector3[];
}

export const UnderwaterSimulation: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    cameraPreset, setCameraPreset,
    showInternals, setShowInternals,
    isRotating, setIsRotating,
    isSimulationRunning, setIsSimulationRunning,
    nodeDeploymentState, nodeDeploymentDepth,
    toggleDeployment,
    sensors, comm, biofouling, energy, faults, buoy,
    wiperAngle, triggerManualCleaning,
  } = useSimulation();

  const [overlayHUD, setOverlayHUD] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);

  // ─────────── live refs (read inside the rAF loop without re-creating scene) ───────────
  const simRef = useRef({
    depth: nodeDeploymentDepth,
    currentSpeed: energy.waterCurrentSpeed,
    turbineRPM: energy.turbineRPM,
    wiperAngle,
    biofouling: biofouling.percentage,
    opticalActive: comm.currentMode === 'OPTICAL',
    acousticActive: comm.currentMode === 'ACOUSTIC',
    commFailed: comm.currentMode === 'FAILED',
    opticalQ: comm.opticalQuality,
    acousticQ: comm.acousticQuality,
    turbidity: sensors.turbidity,
    isRotating,
    showInternals,
    wireframe: wireframeMode,
    turbineStopped: faults.turbineStopped,
    buoyDisconnected: faults.buoyDisconnected,
    batteryPct: energy.batteryPercent,
    isCleaning: biofouling.isCleaning,
  });

  useEffect(() => {
    simRef.current = {
      depth: nodeDeploymentDepth,
      currentSpeed: energy.waterCurrentSpeed,
      turbineRPM: energy.turbineRPM,
      wiperAngle,
      biofouling: biofouling.percentage,
      opticalActive: comm.currentMode === 'OPTICAL',
      acousticActive: comm.currentMode === 'ACOUSTIC',
      commFailed: comm.currentMode === 'FAILED',
      opticalQ: comm.opticalQuality,
      acousticQ: comm.acousticQuality,
      turbidity: sensors.turbidity,
      isRotating,
      showInternals,
      wireframe: wireframeMode,
      turbineStopped: faults.turbineStopped,
      buoyDisconnected: faults.buoyDisconnected,
      batteryPct: energy.batteryPercent,
      isCleaning: biofouling.isCleaning,
    };
  });

  // Camera preset handler
  useEffect(() => {
    const r = threeRef.current;
    if (!r.controls || !r.camera) return;
    const ny = -simRef.current.depth * 0.4;
    const cam = r.camera!;
    const ctl = r.controls!;
    switch (cameraPreset) {
      case 'node':     ctl.target.set(0, ny, 0);      cam.position.set(0, ny + 1.5, 8);      break;
      case 'overview': ctl.target.set(0, ny * 0.4, 0);  cam.position.set(14, ny * 0.3 + 10, 26); break;
      case 'window':   ctl.target.set(1.3, ny, 0);    cam.position.set(3.5, ny + 0.5, 2);    break;
      case 'turbine':  ctl.target.set(-1.9, ny, 0);   cam.position.set(-4, ny + 1, 3);       break;
      case 'internal': ctl.target.set(0, ny, 0);       cam.position.set(0, ny + 0.4, 3.5);    setShowInternals(true); break;
      case 'buoy':     ctl.target.set(0, 10.5, 0);    cam.position.set(6, 13, 10);         break;
      case 'seabed':   ctl.target.set(0, -12, 0);      cam.position.set(10, -8, 18);        break;
    }
    ctl.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPreset]);

  // ─────────────────────── Three.js scene objects ref ──────────────────────
  const threeRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    nodeGroup?: THREE.Group;
    hullMesh?: THREE.Mesh;
    turbineRotor?: THREE.Group;
    wiperPivot?: THREE.Group;
    lensBioMesh?: THREE.Mesh;
    internalGroup?: THREE.Group;
    esp32Light?: THREE.PointLight;
    optBeam?: THREE.Mesh;
    acousticRings?: THREE.Mesh[];
    buoyGroup?: THREE.Group;
    tetherPoints?: THREE.BufferGeometry;
    particles?: THREE.Points;
    kelpGroup?: THREE.Group;
    fishGroups?: THREE.Group[];
    statusRing?: THREE.Mesh;
    statusLight?: THREE.PointLight;
    packetTrails?: PacketTrail[];
    buoyComRings?: THREE.Mesh[];
    satPulse?: THREE.Mesh;
    nodeLabel?: THREE.Sprite;
    buoyLabel?: THREE.Sprite;
    tetherLine?: THREE.Line;
    beaconLight?: THREE.PointLight;
    nodeSpot?: THREE.SpotLight;
    nodeSpot2?: THREE.SpotLight;
    waterGeo?: THREE.PlaneGeometry;
    waterVerts?: THREE.BufferAttribute;
  }>({});

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN SCENE SETUP
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const W = container.clientWidth, H = container.clientHeight;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010b16);
    scene.fog = new THREE.FogExp2(0x03152a, 0.030);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.05, 600);
    camera.position.set(14, 6, 26);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── Controls ───────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.5;
    controls.maxDistance = 80;

    // ── Lighting ──────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0d3058, 3.5));
    const sun = new THREE.DirectionalLight(0x88ddff, 4.5);
    sun.position.set(10, 32, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.far = 90;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x083060, 1.2);
    fill.position.set(0, -16, 0);
    scene.add(fill);
    const side = new THREE.DirectionalLight(0x0066aa, 1.8);
    side.position.set(-15, 5, 10);
    scene.add(side);

    // Node accent lights
    const nodeSpot = new THREE.SpotLight(0x00f2fe, 12, 20, Math.PI / 5, 0.4, 1.5);
    nodeSpot.position.set(3, 5, 8);
    scene.add(nodeSpot);
    const nodeSpot2 = new THREE.SpotLight(0x44aaff, 8, 20, Math.PI / 6, 0.5, 1.5);
    nodeSpot2.position.set(-4, 2, 6);
    scene.add(nodeSpot2);

    // ── God Rays ──────────────────────────────────────────────────────────
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x44ccff, transparent: true, opacity: 0.10,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 10; i++) {
      const geo = new THREE.ConeGeometry(0.5 + i * 0.45, 36, 8, 1, true);
      const m = new THREE.Mesh(geo, rayMat);
      m.position.set((Math.random() - 0.5) * 24, 14, (Math.random() - 0.5) * 24);
      m.rotation.set((Math.random() - 0.5) * 0.25, 0, (Math.random() - 0.5) * 0.25);
      scene.add(m);
    }

    // ── Water Surface ─────────────────────────────────────────────────────
    const waterGeo = new THREE.PlaneGeometry(120, 120, 56, 56);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0a5a8e, roughness: 0.08, metalness: 0.92,
      transparent: true, opacity: 0.74, side: THREE.DoubleSide,
    });
    const waterSurf = new THREE.Mesh(waterGeo, waterMat);
    waterSurf.rotation.x = -Math.PI / 2;
    waterSurf.position.y = 11.0;
    scene.add(waterSurf);
    const waterVerts = waterGeo.attributes.position as THREE.BufferAttribute;

    // ── Seabed ────────────────────────────────────────────────────────────
    const sbGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
    const sbPos = sbGeo.attributes.position;
    for (let i = 0; i < sbPos.count; i++) {
      const x = sbPos.getX(i), y = sbPos.getY(i);
      sbPos.setZ(i, Math.sin(x * 0.17) * Math.cos(y * 0.17) * 0.8 + Math.sin(x * 0.38 + y * 0.32) * 0.3);
    }
    sbGeo.computeVertexNormals();
    const sbMat = new THREE.MeshStandardMaterial({ color: 0x0e2a3d, roughness: 0.95 });
    const seabed = new THREE.Mesh(sbGeo, sbMat);
    seabed.rotation.x = -Math.PI / 2;
    seabed.position.y = -13.8;
    seabed.receiveShadow = true;
    scene.add(seabed);

    // Rocks
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x0a1f2d, roughness: 0.9 });
    for (let i = 0; i < 40; i++) {
      const rg = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.9, 1);
      const rm = new THREE.Mesh(rg, rockMat);
      rm.position.set((Math.random() - 0.5) * 60, -13.6 + Math.random() * 0.4, (Math.random() - 0.5) * 60);
      rm.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(rm);
    }

    // Kelp
    const kelpGroup = new THREE.Group();
    const kelpMat = new THREE.MeshStandardMaterial({ color: 0x0a5c3c, roughness: 0.6, side: THREE.DoubleSide });
    for (let k = 0; k < 50; k++) {
      const kx = (Math.random() - 0.5) * 60, kz = (Math.random() - 0.5) * 60;
      if (Math.hypot(kx, kz) < 6) continue;
      const h = 4 + Math.random() * 7;
      const kg = new THREE.PlaneGeometry(0.4, h, 2, 12);
      const km = new THREE.Mesh(kg, kelpMat);
      km.position.set(kx, -13.8 + h / 2, kz);
      km.rotation.y = Math.random() * Math.PI;
      kelpGroup.add(km);
    }
    scene.add(kelpGroup);

    // Particles (floating debris/bubbles)
    const PC = 1800;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
      pArr[i * 3]     = (Math.random() - 0.5) * 50;
      pArr[i * 3 + 1] = -13 + Math.random() * 28;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x5cd9ff, size: 0.11, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending,
    }));
    scene.add(particles);

    // Fish
    const fishMat = new THREE.MeshStandardMaterial({ color: 0x1a9bd4, metalness: 0.7, roughness: 0.3 });
    const fishGroups: THREE.Group[] = [];
    for (let f = 0; f < 18; f++) {
      const fg = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.6, 6), fishMat);
      body.rotation.z = Math.PI / 2;
      fg.add(body);
      fg.position.set((Math.random() - 0.5) * 25, -9 + Math.random() * 11, (Math.random() - 0.5) * 25);
      scene.add(fg);
      fishGroups.push(fg);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  3D AquaLink Node – high clarity, industrial marine design
    // ══════════════════════════════════════════════════════════════════════
    const nodeGroup = new THREE.Group();
    nodeGroup.position.y = -nodeDeploymentDepth * 0.4;
    scene.add(nodeGroup);

    nodeSpot.target = nodeGroup;
    nodeSpot2.target = nodeGroup;

    // Materials
    const matHull    = new THREE.MeshStandardMaterial({ color: 0x1c2638, metalness: 0.90, roughness: 0.22 });
    const matYellow  = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.55, roughness: 0.30 });
    const matChrome  = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.98, roughness: 0.12 });
    const matAcrylic = new THREE.MeshPhysicalMaterial({
      color: 0x88c8ff, transparent: true, opacity: 0.42,
      transmission: 0.9, roughness: 0.04, ior: 1.49,
    });
    const matBlue   = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const matPCB    = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.5 });
    const matOrange = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.3, roughness: 0.5 });

    // — Main pressure hull —
    const hullGeo = new THREE.CylinderGeometry(0.80, 0.80, 2.9, 40);
    hullGeo.rotateZ(Math.PI / 2);
    const hullMesh = new THREE.Mesh(hullGeo, matHull);
    hullMesh.castShadow = true; hullMesh.receiveShadow = true;
    nodeGroup.add(hullMesh);

    // End caps
    const capGeo = new THREE.SphereGeometry(0.80, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    const capFront = new THREE.Mesh(capGeo, matHull);
    capFront.rotation.z = Math.PI / 2;
    capFront.position.x = 1.45;
    capFront.castShadow = true;
    nodeGroup.add(capFront);
    const capBack = new THREE.Mesh(capGeo, matHull);
    capBack.rotation.z = -Math.PI / 2;
    capBack.position.x = -1.45;
    capBack.castShadow = true;
    nodeGroup.add(capBack);

    // Yellow clamping collars (3)
    const collarGeo = new THREE.TorusGeometry(0.82, 0.09, 20, 40);
    collarGeo.rotateY(Math.PI / 2);
    [-1.05, 0, 1.05].forEach(x => {
      const c = new THREE.Mesh(collarGeo, matYellow);
      c.position.x = x;
      nodeGroup.add(c);
    });

    // Hex bolts on collars
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2;
      const bg = new THREE.CylinderGeometry(0.028, 0.028, 0.08, 6);
      bg.rotateZ(Math.PI / 2);
      const bm = new THREE.Mesh(bg, matChrome);
      bm.position.set(1.05, Math.cos(angle) * 0.82, Math.sin(angle) * 0.82);
      nodeGroup.add(bm);
    }

    // Yellow skid protection rails
    const skidGeo = new THREE.CylinderGeometry(0.045, 0.045, 3.2, 10);
    skidGeo.rotateZ(Math.PI / 2);
    [[0, -0.98, 0.52], [0, -0.98, -0.52]].forEach(([x, y, z]) => {
      const s = new THREE.Mesh(skidGeo, matYellow);
      s.position.set(x, y, z);
      nodeGroup.add(s);
    });

    // Cross-braces at skid ends
    const braceGeo = new THREE.CylinderGeometry(0.028, 0.028, 1.08, 8);
    [-1.35, 0, 1.35].forEach(x => {
      const b = new THREE.Mesh(braceGeo, matYellow);
      b.position.set(x, -0.98, 0);
      nodeGroup.add(b);
    });

    // Lifting bail
    const bailRing = new THREE.TorusGeometry(0.16, 0.034, 14, 28);
    const bail = new THREE.Mesh(bailRing, matYellow);
    bail.position.set(0, 0.96, 0);
    bail.rotation.x = Math.PI / 2;
    nodeGroup.add(bail);

    // Transparent mid-window
    const winGeo = new THREE.CylinderGeometry(0.81, 0.81, 0.9, 40, 1, true);
    winGeo.rotateZ(Math.PI / 2);
    const winMesh = new THREE.Mesh(winGeo, matAcrylic);
    nodeGroup.add(winMesh);

    // ── Internal electronics ──────────────────────────────────────────────
    const internalGroup = new THREE.Group();
    nodeGroup.add(internalGroup);

    // Main PCB
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.045, 0.56), matPCB);
    pcb.position.set(0, -0.15, 0);
    internalGroup.add(pcb);

    // ESP32 chip
    const esp = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.038, 0.20),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    esp.position.set(0.1, -0.1, 0.12);
    internalGroup.add(esp);

    // Metal RF shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.022, 0.13),
      new THREE.MeshStandardMaterial({ color: 0xc8c8c8, metalness: 0.95 }));
    shield.position.set(0.09, -0.085, 0.12);
    internalGroup.add(shield);

    // Activity LEDs
    const ledGeo = new THREE.SphereGeometry(0.02, 8, 8);
    [[0.22, -0.075, 0.16, 0x00f2fe], [-0.1, -0.075, 0.16, 0x10b981], [0.1, -0.075, -0.1, 0xf59e0b]].forEach(([px, py, pz, col]) => {
      const led = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: col as number }));
      led.position.set(px as number, py as number, pz as number);
      internalGroup.add(led);
    });

    const esp32Light = new THREE.PointLight(0x00f2fe, 3.5, 1.4);
    esp32Light.position.set(0.22, -0.04, 0.16);
    internalGroup.add(esp32Light);

    // Battery cells (3S)
    const batMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
    for (let i = 0; i < 3; i++) {
      const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.077, 0.077, 0.34, 16), batMat);
      cell.rotation.z = Math.PI / 2;
      cell.position.set(-0.38 + i * 0.19, -0.24, -0.09);
      internalGroup.add(cell);
    }

    // Capacitors
    const capMatEl = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    for (let c = 0; c < 5; c++) {
      const el = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.1, 12), capMatEl);
      el.position.set(-0.14 + c * 0.07, -0.08, -0.17);
      internalGroup.add(el);
    }

    // ── Optical Module (front face, +X) ──────────────────────────────────
    const optMount = new THREE.Mesh(
      (() => { const g = new THREE.CylinderGeometry(0.42, 0.44, 0.26, 32); g.rotateZ(Math.PI / 2); return g; })(),
      matHull
    );
    optMount.position.x = 1.52;
    nodeGroup.add(optMount);

    const optRing = new THREE.Mesh(
      (() => { const g = new THREE.TorusGeometry(0.34, 0.034, 18, 36); g.rotateY(Math.PI / 2); return g; })(),
      matChrome
    );
    optRing.position.x = 1.65;
    nodeGroup.add(optRing);

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x00e0ff, transmission: 0.95, transparent: true,
      roughness: 0.03, opacity: 0.94, ior: 1.76,
    });
    const lensGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.058, 36);
    lensGeo.rotateZ(Math.PI / 2);
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.x = 1.68;
    nodeGroup.add(lensMesh);

    // Biofouling overlay on lens
    const bioGeo = new THREE.CircleGeometry(0.285, 36);
    bioGeo.rotateY(Math.PI / 2);
    const bioMat = new THREE.MeshStandardMaterial({
      color: 0x2e4a08, transparent: true, opacity: 0.08, roughness: 0.9, side: THREE.DoubleSide,
    });
    const lensBioMesh = new THREE.Mesh(bioGeo, bioMat);
    lensBioMesh.position.x = 1.705;
    nodeGroup.add(lensBioMesh);

    // Blue LED emitter glow behind lens
    const emGeo = new THREE.SphereGeometry(0.08, 18, 18);
    const emMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const emMesh = new THREE.Mesh(emGeo, emMat);
    emMesh.position.x = 1.62;
    nodeGroup.add(emMesh);
    const emLight = new THREE.PointLight(0x00f2fe, 7, 5);
    emLight.position.x = 1.62;
    nodeGroup.add(emLight);

    // Optical beam cone
    const beamGeo = new THREE.ConeGeometry(2.6, 18, 36, 1, true);
    beamGeo.rotateZ(-Math.PI / 2);
    beamGeo.translate(9, 0, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe, transparent: true, opacity: 0.32,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const optBeam = new THREE.Mesh(beamGeo, beamMat);
    optBeam.position.set(1.70, 0, 0);
    nodeGroup.add(optBeam);

    // ── Silicone Wiper ────────────────────────────────────────────────────
    const servoBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.17, 0.11),
      matYellow
    );
    servoBox.position.set(1.60, 0.40, 0.22);
    nodeGroup.add(servoBox);

    const wiperPivot = new THREE.Group();
    wiperPivot.position.set(1.68, 0.40, 0.22);
    nodeGroup.add(wiperPivot);
    const wiperArm = new THREE.Mesh(
      (() => { const g = new THREE.CylinderGeometry(0.014, 0.014, 0.42, 8); g.translate(0, -0.21, 0); return g; })(),
      matChrome
    );
    wiperPivot.add(wiperArm);
    const wiperBlade = new THREE.Mesh(
      (() => { const g = new THREE.BoxGeometry(0.024, 0.36, 0.018); g.translate(0, -0.26, 0); return g; })(),
      matBlue
    );
    wiperPivot.add(wiperBlade);

    // ── Acoustic Dome (top) ───────────────────────────────────────────────
    const acoGeo = new THREE.SphereGeometry(0.37, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    const aco = new THREE.Mesh(acoGeo, new THREE.MeshStandardMaterial({ color: 0x2a3a4f, metalness: 0.88, roughness: 0.28 }));
    aco.position.set(0.2, 0.80, 0);
    nodeGroup.add(aco);
    const piezo = new THREE.Mesh(
      (() => { const g = new THREE.TorusGeometry(0.28, 0.042, 14, 32); g.rotateX(Math.PI / 2); return g; })(),
      matYellow
    );
    piezo.position.set(0.2, 0.82, 0);
    nodeGroup.add(piezo);

    // Acoustic wave rings
    const acousticRings: THREE.Mesh[] = [];
    for (let r = 0; r < 5; r++) {
      const rg = new THREE.RingGeometry(0.5, 0.65, 40);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(rg, rm);
      ring.position.set(0.2, 0.90, 0);
      nodeGroup.add(ring);
      acousticRings.push(ring);
    }

    // ── Sensor probe cluster ───────────────────────────────────────────────
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0.65, -0.80, 0.44);
    nodeGroup.add(sensorGroup);
    sensorGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.20), matHull));
    const tempProbe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.25, 8), matChrome);
    tempProbe.position.set(-0.06, -0.14, 0.055);
    sensorGroup.add(tempProbe);
    const pressPort = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.10, 14), matChrome);
    pressPort.position.set(0.044, -0.08, 0.055);
    sensorGroup.add(pressPort);
    const turbGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12);
    const turbWin = new THREE.Mesh(turbGeo, matOrange);
    turbWin.position.set(0.1, -0.14, -0.04);
    sensorGroup.add(turbWin);

    // ── Hydrodynamic turbine ───────────────────────────────────────────────
    const turbMount = new THREE.Mesh(
      (() => { const g = new THREE.CylinderGeometry(0.19, 0.26, 0.56, 20); g.rotateZ(Math.PI / 2); return g; })(),
      matHull
    );
    turbMount.position.x = -1.56;
    nodeGroup.add(turbMount);

    const nozzle = new THREE.Mesh(
      (() => { const g = new THREE.TorusGeometry(0.42, 0.055, 16, 36); g.rotateY(Math.PI / 2); return g; })(),
      matChrome
    );
    nozzle.position.x = -1.90;
    nodeGroup.add(nozzle);

    const turbineRotor = new THREE.Group();
    turbineRotor.position.x = -1.90;
    nodeGroup.add(turbineRotor);

    const spinner = new THREE.Mesh(
      (() => { const g = new THREE.ConeGeometry(0.24, 0.50, 20); g.rotateZ(Math.PI / 2); return g; })(),
      matYellow
    );
    turbineRotor.add(spinner);

    for (let b = 0; b < 3; b++) {
      const angle = (b / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(
        (() => { const g = new THREE.BoxGeometry(0.034, 0.86, 0.14); g.translate(0, 0.43, 0); return g; })(),
        new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.88, roughness: 0.22 })
      );
      blade.rotation.x = angle;
      blade.rotation.y = 0.32;
      turbineRotor.add(blade);
      const tip = new THREE.Mesh(
        (() => { const g = new THREE.BoxGeometry(0.036, 0.16, 0.14); g.translate(0, 0.75, 0); return g; })(),
        matYellow
      );
      tip.rotation.x = angle;
      tip.rotation.y = 0.32;
      turbineRotor.add(tip);
    }

    // ── Status LED ring ─────────────────────────────────────────────────
    const statusRing = new THREE.Mesh(
      (() => { const g = new THREE.TorusGeometry(0.81, 0.030, 16, 44); g.rotateY(Math.PI / 2); return g; })(),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    nodeGroup.add(statusRing);
    const statusLight = new THREE.PointLight(0x10b981, 3.5, 7);
    nodeGroup.add(statusLight);

    // ── HUD Labels: Razor-Sharp Sprite with Neon Glow & Crisp White Text ──
    const nodeLabel = makeTextSprite('AquaLink NODE-01', 'SUBSEA', '#00f2fe');
    nodeLabel.position.set(0, 1.55, 0);
    nodeGroup.add(nodeLabel);

    // ══════════════════════════════════════════════════════════════════════
    //  SURFACE BUOY – detailed realistic model
    // ══════════════════════════════════════════════════════════════════════
    const buoyGroup = new THREE.Group();
    buoyGroup.position.set(0, 11.0, 0);
    scene.add(buoyGroup);

    // Float hull ring
    const buoyHullGeo = new THREE.TorusGeometry(1.6, 0.65, 22, 44);
    buoyHullGeo.rotateX(Math.PI / 2);
    const buoyHull = new THREE.Mesh(buoyHullGeo,
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.40 })
    );
    buoyGroup.add(buoyHull);

    // Deck plate
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.28, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    deck.position.y = 0.20;
    buoyGroup.add(deck);

    // Solar panel array
    const solar = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 1.4, 36),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.12 })
    );
    solar.rotation.x = -Math.PI / 2;
    solar.position.y = 0.33;
    buoyGroup.add(solar);

    // Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.070, 0.090, 3.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.92 })
    );
    mast.position.y = 1.9;
    buoyGroup.add(mast);

    // Antennas
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2;
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.65, 8),
        new THREE.MeshStandardMaterial({ color: 0xc8c8c8, metalness: 0.9 })
      );
      ant.position.set(Math.cos(ang) * 0.09, 3.2, Math.sin(ang) * 0.09);
      ant.rotation.x = 0.42;
      buoyGroup.add(ant);
    }

    const radome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.18, metalness: 0.12 })
    );
    radome.position.set(0.60, 0.55, 0);
    buoyGroup.add(radome);

    const beaconMesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xffee00 })
    );
    beaconMesh.position.y = 3.6;
    buoyGroup.add(beaconMesh);
    const beaconLight = new THREE.PointLight(0xffee00, 4.5, 14);
    beaconLight.position.y = 3.6;
    buoyGroup.add(beaconLight);

    // Surface buoy communication rings
    const buoyComRings: THREE.Mesh[] = [];
    for (let r = 0; r < 6; r++) {
      const rg = new THREE.RingGeometry(0.5, 0.72, 48);
      rg.rotateX(-Math.PI / 2);
      const rm = new THREE.MeshBasicMaterial({
        color: 0xfbbf24, transparent: true, opacity: 0,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(rg, rm);
      ring.position.y = 0.08;
      buoyGroup.add(ring);
      buoyComRings.push(ring);
    }

    // Upward satellite beam cone
    const satBeamGeo = new THREE.ConeGeometry(2.2, 12, 28, 1, true);
    satBeamGeo.translate(0, 6, 0);
    const satBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const satBeam = new THREE.Mesh(satBeamGeo, satBeamMat);
    satBeam.position.y = 3.6;
    buoyGroup.add(satBeam);

    // Satellite pulse sphere
    const satPulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 })
    );
    satPulse.position.set(0, 22, 0);
    scene.add(satPulse);
    const satOrbitGeo = new THREE.TorusGeometry(1.4, 0.03, 10, 60);
    const satOrbit = new THREE.Mesh(satOrbitGeo,
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.4 })
    );
    satOrbit.position.set(0, 22, 0);
    satOrbit.rotation.x = Math.PI / 2.5;
    scene.add(satOrbit);
    const satLight = new THREE.PointLight(0xfbbf24, 4, 16);
    satLight.position.set(0, 22, 0);
    scene.add(satLight);

    // Buoy label
    const buoyLabel = makeTextSprite('SURFACE BUOY GATEWAY', 'RELAY', '#fbbf24');
    buoyLabel.position.set(0, 4.6, 0);
    buoyGroup.add(buoyLabel);

    // ══════════════════════════════════════════════════════════════════════
    //  TETHER LINE (node → buoy)
    // ══════════════════════════════════════════════════════════════════════
    const tetherPts = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 10.5, 0),
      new THREE.Vector3(0, nodeGroup.position.y + 0.9, 0),
    ]);
    const tetherLine = new THREE.Line(tetherPts,
      new THREE.LineBasicMaterial({ color: 0x00f2fe, linewidth: 2 })
    );
    scene.add(tetherLine);

    // ══════════════════════════════════════════════════════════════════════
    //  DATA PACKET TRAILS
    // ══════════════════════════════════════════════════════════════════════
    const packetTrails: PacketTrail[] = [];
    const packetCoreGeo = new THREE.SphereGeometry(0.10, 12, 12);
    const packetGlowGeo = new THREE.SphereGeometry(0.26, 12, 12);

    const makeTrail = (
      waypoints: THREE.Vector3[],
      color: number,
      speedMult = 1,
      phaseOffset = 0,
    ): PacketTrail => {
      const coreMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 1.0,
        blending: THREE.AdditiveBlending,
      });
      const glowMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const mesh = new THREE.Mesh(packetCoreGeo.clone(), coreMat);
      const glow = new THREE.Mesh(packetGlowGeo.clone(), glowMat);
      scene.add(mesh);
      scene.add(glow);
      return { mesh, glow, t: phaseOffset % 1, speed: 0.0032 * speedMult, offset: phaseOffset, waypoints };
    };

    const nodeY = nodeGroup.position.y;
    const buoyY = 11.0;

    // Node → Buoy: 5 cyan streams
    for (let i = 0; i < 5; i++) {
      const wp = [
        new THREE.Vector3(0, nodeY + 0.6, 0),
        new THREE.Vector3(0.5 * Math.cos(i), (nodeY + buoyY) / 2 + 2, 0.4 * Math.sin(i)),
        new THREE.Vector3(0, buoyY - 0.6, 0),
      ];
      packetTrails.push(makeTrail(wp, 0x00f2fe, 1.0 + i * 0.05, i * 0.20));
    }
    // Buoy → Satellite: 4 amber streams
    for (let i = 0; i < 4; i++) {
      const wp = [
        new THREE.Vector3(0, buoyY + 3.6, 0),
        new THREE.Vector3((Math.random() - 0.5) * 2.5, 16, (Math.random() - 0.5) * 2),
        new THREE.Vector3(0, 22, 0),
      ];
      packetTrails.push(makeTrail(wp, 0xfbbf24, 0.65, i * 0.25));
    }

    // Store refs
    threeRef.current = {
      renderer, scene, camera, controls,
      nodeGroup, hullMesh, turbineRotor, wiperPivot,
      lensBioMesh,
      internalGroup,
      esp32Light,
      optBeam,
      acousticRings,
      buoyGroup,
      tetherPoints: tetherPts,
      tetherLine,
      particles,
      kelpGroup,
      fishGroups,
      statusRing,
      statusLight,
      packetTrails,
      buoyComRings,
      satPulse,
      nodeLabel,
      buoyLabel,
      beaconLight,
      nodeSpot,
      nodeSpot2,
      waterGeo,
      waterVerts,
    };

    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let raf: number;
    const clock = new THREE.Clock();

    const lerpWaypoints = (wps: THREE.Vector3[], t: number, out: THREE.Vector3) => {
      const seg = wps.length - 1;
      const scaled = t * seg;
      const idx = Math.min(Math.floor(scaled), seg - 1);
      const f = scaled - idx;
      out.lerpVectors(wps[idx], wps[idx + 1], f);
    };

    const tmpVec = new THREE.Vector3();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const p = simRef.current;

      controls.update();

      // Node Y tracking
      const targetY = -p.depth * 0.4;
      nodeGroup.position.y += (targetY - nodeGroup.position.y) * 0.08;
      if (p.isRotating) nodeGroup.rotation.y += 0.007;

      nodeSpot.position.set(
        nodeGroup.position.x + 3,
        nodeGroup.position.y + 5,
        nodeGroup.position.z + 8
      );
      nodeSpot2.position.set(
        nodeGroup.position.x - 4,
        nodeGroup.position.y + 2,
        nodeGroup.position.z + 6
      );

      if (wiperPivot) wiperPivot.rotation.x = (p.wiperAngle * Math.PI) / 180;

      const bm = lensBioMesh.material as THREE.MeshStandardMaterial;
      bm.opacity = Math.max(0.03, (p.biofouling / 100) * 0.90);
      bm.color.setHex(p.biofouling > 70 ? 0x1a2e05 : p.biofouling > 35 ? 0x2d4a12 : 0x4d7c0f);

      if (!p.turbineStopped && p.turbineRPM > 0) {
        const rps = (p.turbineRPM / 60) * Math.PI * 2;
        turbineRotor.rotation.x += rps * dt;
      }

      const beamMatL = optBeam.material as THREE.MeshBasicMaterial;
      if (p.opticalActive && !p.commFailed) {
        optBeam.visible = true;
        const qf = p.opticalQ / 100;
        beamMatL.opacity = Math.max(0.05, (0.26 + Math.sin(elapsed * 16) * 0.08) * qf);
        optBeam.scale.z = 0.28 + qf * 0.72;
      } else {
        optBeam.visible = false;
      }

      acousticRings.forEach((ring, i) => {
        if (p.acousticActive && !p.commFailed) {
          ring.visible = true;
          const phase = (elapsed * 1.8 + i * 0.22) % 1;
          ring.scale.set(1 + phase * 7, 1 + phase * 7, 1);
          (ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.80 * (p.acousticQ / 100);
        } else {
          ring.visible = false;
        }
      });

      internalGroup.visible = true;
      (hullMesh.material as THREE.MeshStandardMaterial).wireframe = p.wireframe;
      (hullMesh.material as THREE.MeshStandardMaterial).transparent = p.showInternals;
      (hullMesh.material as THREE.MeshStandardMaterial).opacity = p.showInternals ? 0.20 : 1;

      esp32Light.intensity = Math.sin(elapsed * 10) > 0.1 ? 3.5 : 0.1;

      const col = p.commFailed ? 0xef4444 : p.acousticActive ? 0xf59e0b : 0x00f2fe;
      (statusRing.material as THREE.MeshBasicMaterial).color.setHex(col);
      statusLight.color.setHex(col);
      statusLight.intensity = 2.5 + Math.sin(elapsed * 2) * 0.8;

      const waveY = 11.0 + Math.sin(elapsed * 1.4) * 0.30;
      buoyGroup.position.y = waveY;
      buoyGroup.rotation.z = Math.cos(elapsed * 1.1) * 0.08;
      buoyGroup.rotation.x = Math.sin(elapsed * 0.85) * 0.07;

      beaconLight.intensity = Math.floor(elapsed * 2) % 2 === 0 ? 5.5 : 0.1;

      const tPos = tetherPts.attributes.position;
      tPos.setXYZ(0, buoyGroup.position.x, buoyGroup.position.y - 0.65, buoyGroup.position.z);
      tPos.setXYZ(1, nodeGroup.position.x, nodeGroup.position.y + 0.9, nodeGroup.position.z);
      tPos.needsUpdate = true;
      tetherLine.visible = !p.buoyDisconnected;

      buoyComRings.forEach((ring, i) => {
        if (!p.buoyDisconnected) {
          ring.visible = true;
          const phase = (elapsed * 1.2 + i * 0.18) % 1;
          ring.scale.set(1 + phase * 10, 1, 1 + phase * 10);
          (ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.60;
        } else {
          ring.visible = false;
        }
      });

      satBeam.rotation.y = elapsed * 0.4;
      (satBeamMat as THREE.MeshBasicMaterial).opacity = p.buoyDisconnected
        ? 0.02
        : 0.14 + Math.sin(elapsed * 1.8) * 0.06;

      satPulse.position.set(
        Math.sin(elapsed * 0.3) * 1.2,
        22 + Math.sin(elapsed * 2) * 0.5,
        Math.cos(elapsed * 0.3) * 1.2
      );
      (satPulse.material as THREE.MeshBasicMaterial).opacity = p.buoyDisconnected
        ? 0.08
        : 0.5 + Math.sin(elapsed * 2.8) * 0.4;
      satOrbit.rotation.y += 0.004;

      if (packetTrails) {
        packetTrails.forEach((trail, idx) => {
          const isSubseaTrail = idx < 5;
          const linkOk = isSubseaTrail
            ? (p.opticalActive || p.acousticActive) && !p.commFailed
            : !p.buoyDisconnected;

          if (!linkOk) {
            trail.mesh.visible = false;
            trail.glow.visible = false;
            return;
          }

          if (isSubseaTrail) {
            const ny2 = nodeGroup.position.y;
            trail.waypoints[0].set(0, ny2 + 0.6, 0);
            trail.waypoints[1].set(
              0.6 * Math.sin(elapsed * 0.8 + idx),
              (ny2 + buoyGroup.position.y) / 2 + 2.2,
              0.5 * Math.cos(elapsed * 0.7 + idx)
            );
            trail.waypoints[2].set(0, buoyGroup.position.y - 0.6, 0);
          }

          trail.t = (trail.t + trail.speed) % 1;
          lerpWaypoints(trail.waypoints, trail.t, tmpVec);
          trail.mesh.position.copy(tmpVec);
          trail.glow.position.copy(tmpVec);

          const pulse = 0.6 + Math.abs(Math.sin(trail.t * Math.PI * 10)) * 0.5;
          trail.mesh.scale.setScalar(pulse);
          trail.glow.scale.setScalar(pulse);

          const c = isSubseaTrail
            ? (p.opticalActive ? 0x00f2fe : 0x38bdf8)
            : 0xfbbf24;
          (trail.mesh.material as THREE.MeshBasicMaterial).color.setHex(c);
          (trail.glow.material as THREE.MeshBasicMaterial).color.setHex(c);

          trail.mesh.visible = true;
          trail.glow.visible = true;
          (trail.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 + Math.sin(elapsed * 10 + idx) * 0.1;
          (trail.glow.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(elapsed * 6 + idx) * 0.10;
        });
      }

      const waterArr = waterVerts.array as Float32Array;
      for (let i = 0; i < waterVerts.count; i++) {
        const x = waterVerts.getX(i), y = waterVerts.getY(i);
        waterArr[i * 3 + 2] = Math.sin(x * 0.5 + elapsed * 1.3) * 0.20 + Math.cos(y * 0.5 + elapsed * 0.95) * 0.14;
      }
      waterVerts.needsUpdate = true;
      waterGeo.computeVertexNormals();

      const pArr2 = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PC; i++) {
        pArr2[i * 3]     += p.currentSpeed * 0.045;
        pArr2[i * 3 + 1] += 0.012;
        if (pArr2[i * 3]     > 24)  pArr2[i * 3]     = -24;
        if (pArr2[i * 3 + 1] > 11)  pArr2[i * 3 + 1] = -13;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      kelpGroup.children.forEach((c, i) => {
        c.rotation.z = Math.sin(elapsed * 1.3 + i * 0.6) * 0.14 + p.currentSpeed * 0.07;
      });

      fishGroups.forEach((fg, fi) => {
        const t2 = elapsed * 0.75 + fi * 0.65;
        const r2 = 10 + (fi % 3) * 2.8;
        fg.position.set(Math.cos(t2 * 0.38) * r2, -9 + Math.sin(t2 * 0.9) * 2.2, Math.sin(t2 * 0.38) * r2);
        fg.rotation.y = -(t2 * 0.38) - Math.PI / 2 + Math.sin(elapsed * 8) * 0.07;
      });

      (scene.fog as THREE.FogExp2).density = 0.030 + (p.turbidity / 35) * 0.030;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`relative w-full ${isCompact ? 'h-full min-h-[480px]' : 'h-[calc(100vh-148px)] min-h-[660px]'} rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl`}>
      {/* Three.js Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── Top Control Bar ── */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-2 z-20">
        {/* Sim Control */}
        <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 gap-1.5 shadow-2xl flex-wrap">
          <button onClick={() => setIsSimulationRunning(!isSimulationRunning)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${isSimulationRunning
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/60'
              : 'bg-amber-500/25 text-amber-200 border border-amber-400/60'}`}>
            {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulationRunning ? 'RUNNING' : 'PAUSED'}
          </button>
          <button onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${isRotating
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,242,254,0.25)]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            Rotate 3D
          </button>
          <button onClick={() => setShowInternals(!showInternals)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${showInternals
              ? 'bg-purple-500/25 text-purple-200 border border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
            <Eye className="w-3.5 h-3.5" />
            {showInternals ? 'X-Ray Active' : 'Show Internals'}
          </button>
          <button onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${wireframeMode
              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
            <Layers className="w-3.5 h-3.5" />
            Wireframe
          </button>
          <button onClick={toggleDeployment}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              nodeDeploymentState === 'RETRIEVING' || nodeDeploymentState === 'DEPLOYING'
                ? 'bg-blue-600 text-white animate-pulse'
                : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}>
            <ArrowDownUp className="w-3.5 h-3.5" />
            {nodeDeploymentState === 'DEPLOYED' ? 'Retrieve Node' : 'Deploy Node'}
          </button>
          <button onClick={triggerManualCleaning} disabled={biofouling.isCleaning}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 hover:bg-cyan-500/30 disabled:opacity-50">
            <Sparkles className={`w-3.5 h-3.5 ${biofouling.isCleaning ? 'animate-spin' : ''}`} />
            {biofouling.isCleaning ? `Cleaning ${biofouling.cleaningProgress}%` : 'Clean Lens Wiper'}
          </button>
        </div>

        {/* Camera Presets */}
        <div className="flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 gap-1 shadow-2xl ml-auto">
          <Camera className="w-4 h-4 text-cyan-300 mx-1.5" />
          {([
            { id: 'node', label: 'Node' },
            { id: 'overview', label: 'Full View' },
            { id: 'window', label: 'Lens' },
            { id: 'turbine', label: 'Turbine' },
            { id: 'internal', label: 'PCB' },
            { id: 'buoy', label: 'Buoy' },
            { id: 'seabed', label: 'Seabed' },
          ] as const).map(p => (
            <button key={p.id} onClick={() => setCameraPreset(p.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${cameraPreset === p.id
                ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setOverlayHUD(!overlayHUD)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 ml-1"
            title="Toggle HUD Telemetry Overlay">
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── HUD Overlays ── */}
      {overlayHUD && (
        <>
          {/* Bottom-Left: Node Status */}
          <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 text-xs text-white w-[290px] z-20 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe] animate-pulse shrink-0" />
                <span className="font-bold text-white font-mono tracking-wider text-xs">AquaLink NODE-01</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wide ${
                nodeDeploymentState === 'DEPLOYED' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50' : 'bg-amber-500/25 text-amber-300 border border-amber-500/50'}`}>
                {nodeDeploymentState}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {[
                ['DEPTH',     `${nodeDeploymentDepth.toFixed(1)} m`,   'text-cyan-300'],
                ['PRESSURE',  `${sensors.pressure.toFixed(2)} bar`,     'text-emerald-300'],
                ['TEMP',      `${sensors.temperature.toFixed(1)} °C`,   'text-white'],
                ['TURBIDITY', `${sensors.turbidity.toFixed(1)} NTU`,    sensors.turbidity > 40 ? 'text-amber-300' : 'text-white'],
              ].map(([label, val, cls]) => (
                <div key={label as string} className="bg-slate-950 p-2 rounded-xl border border-slate-800/90">
                  <div className="text-slate-400 font-bold text-[10px] tracking-wider mb-0.5">{label}</div>
                  <div className={`font-bold text-sm ${cls}`}>{val}</div>
                </div>
              ))}
            </div>

            {/* Biofouling Progress Bar */}
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/90 space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400 font-bold text-[10px]">BIOFOULING RISK</span>
                <span className={`font-bold ${biofouling.percentage > 60 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {biofouling.percentage.toFixed(1)}% [{biofouling.riskLevel}]
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className={`h-full rounded-full transition-all duration-300 ${biofouling.percentage > 70 ? 'bg-rose-500' : biofouling.percentage > 35 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${biofouling.percentage}%` }} />
              </div>
            </div>
          </div>

          {/* Bottom-Right: Comm & Energy */}
          <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 text-xs text-white w-[305px] z-20 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-300 shrink-0" />
                <span className="font-bold text-white font-mono text-xs tracking-wider">HARVEST &amp; COMM</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wide ${
                comm.currentMode === 'OPTICAL' ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50' :
                comm.currentMode === 'ACOUSTIC' ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50' :
                'bg-rose-500/25 text-rose-200 border border-rose-400/50'}`}>
                {comm.currentMode}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/90 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold text-[10px]">TURBINE GENERATOR</span>
                  <span className="text-amber-300 font-bold">{energy.turbineRPM} RPM (+{energy.powerGenerated.toFixed(1)}W)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (energy.turbineRPM / 650) * 100)}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/90 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold text-[10px]">OPTICAL SIGNAL QUALITY</span>
                  <span className="text-cyan-300 font-bold">{comm.opticalQuality}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${comm.opticalQuality}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/90">
                  <div className="text-slate-400 font-bold text-[10px] tracking-wider mb-0.5">BATTERY SoC</div>
                  <div className={`font-bold text-sm ${energy.batteryPercent < 20 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {energy.batteryPercent.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/90">
                  <div className="text-slate-400 font-bold text-[10px] tracking-wider mb-0.5">CURRENT SPEED</div>
                  <div className="text-amber-300 font-bold text-sm">{energy.waterCurrentSpeed.toFixed(1)} m/s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Centre-Left: Data Forwarding Status Column */}
          <div className="absolute left-3 top-[50%] -translate-y-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-4 text-xs text-white w-[220px] z-20 shadow-2xl space-y-3">
            <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider pb-1.5 border-b border-slate-800 flex items-center justify-between">
              <span>DATA PIPELINE</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>

            {/* Step 1: Node */}
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe]" />
                <div className="w-0.5 h-7 bg-gradient-to-b from-cyan-400 to-transparent" />
              </div>
              <div>
                <div className="font-bold text-white text-xs mb-0.5">AquaLink Node</div>
                <div className={`text-[11px] font-mono font-semibold ${comm.currentMode === 'OPTICAL' ? 'text-cyan-300' : 'text-amber-300'}`}>
                  {comm.currentMode} @ {comm.currentMode === 'OPTICAL' ? comm.opticalQuality : comm.acousticQuality}%
                </div>
              </div>
            </div>

            {/* Step 2: Buoy */}
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                <div className="w-0.5 h-7 bg-gradient-to-b from-amber-400 to-transparent" />
              </div>
              <div>
                <div className="font-bold text-white text-xs mb-0.5">Surface Buoy</div>
                <div className={`text-[11px] font-mono font-semibold ${faults.buoyDisconnected ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {faults.buoyDisconnected ? 'DISCONNECTED' : 'ONLINE'}
                </div>
              </div>
            </div>

            {/* Step 3: Satellite */}
            <div className="flex items-start gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs mb-0.5">Satellite / LTE</div>
                <div className={`text-[11px] font-mono font-semibold ${buoy.satelliteUplink ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {buoy.satelliteUplink ? 'Uplink Active' : 'NO SIGNAL'}
                </div>
              </div>
            </div>

            {/* Packet stats */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="font-mono text-xs text-slate-300 flex justify-between">
                <span>Tx Packets:</span>
                <span className="text-cyan-300 font-bold">{comm.packetsTransmitted.toLocaleString()}</span>
              </div>
              <div className="font-mono text-xs text-slate-300 flex justify-between">
                <span>Success Rate:</span>
                <span className="text-emerald-300 font-bold">{comm.packetSuccessRate}%</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Depth Ruler */}
      <div className="absolute top-20 right-3 h-56 w-10 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl flex flex-col justify-between items-center py-2.5 text-xs font-mono text-slate-300 select-none pointer-events-none z-10 shadow-lg">
        {[0, 5, 10, 15, 20, 25].map(d => (
          <span key={d} className={d === 25 || d === 0 ? 'text-cyan-300 font-black' : 'font-semibold'}>{d}m</span>
        ))}
        <div className="absolute w-full h-1 bg-cyan-400 shadow-[0_0_10px_#00f2fe] transition-all duration-200"
          style={{ top: `${Math.min(93, Math.max(5, (nodeDeploymentDepth / 25) * 100))}%` }} />
      </div>

      {/* SIMULATED badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/40 shadow-lg">
          ★ SIMULATION ACTIVE — HIGH-PRECISION SOFTWARE TWIN ★
        </span>
      </div>
    </div>
  );
};
