// =============================================================================
// szene.js — Three.js-Grundgerüst: Renderer, Kamera, Licht, Nebel, Steuerung
// -----------------------------------------------------------------------------
// Setzt den Low-Poly-Look um: weiches gerichtetes Licht + Ambient, sanfte
// Schatten, dezenter Nebel in die Ferne, leicht schräge 3/4-Kamera (drehbar/
// zoombar via OrbitControls). Alle Look-Werte kommen aus data/look.js.
// =============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { grad } from '../data/look.js';

export function erstelleSzene(canvas, look) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(look.himmelFarbe);
  scene.fog = new THREE.Fog(look.nebelFarbe, look.nebelNah, look.nebelFern);

  // --- Kamera: leicht schräg von oben (3/4- bis Top-down) -------------------
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 220);
  const d = look.kameraDistanz;
  const n = grad(look.kameraNeigung);
  camera.position.set(0, d * Math.sin(n), d * Math.cos(n));
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = look.kameraMinDistanz;
  controls.maxDistance = look.kameraMaxDistanz;
  controls.maxPolarAngle = grad(80); // nicht unter den Horizont schwenken
  controls.minPolarAngle = grad(15);
  controls.update();

  // --- Beleuchtung ----------------------------------------------------------
  const ambient = new THREE.AmbientLight(look.ambientFarbe, look.ambientStaerke);
  scene.add(ambient);

  // Sanftes Himmel/Boden-Licht für den freundlichen Pastell-Look.
  const hemi = new THREE.HemisphereLight(look.himmelFarbe, look.bodenFarbe, 0.45);
  scene.add(hemi);

  const sonne = new THREE.DirectionalLight(look.sonneFarbe, look.sonneStaerke);
  const az = grad(look.sonneAzimut), hoehe = grad(look.sonneHoehe);
  sonne.position.set(
    Math.cos(hoehe) * Math.cos(az) * 30,
    Math.sin(hoehe) * 30,
    Math.cos(hoehe) * Math.sin(az) * 30
  );
  sonne.castShadow = true;
  const r = look.gitterRadius + 4;
  sonne.shadow.camera.left = -r; sonne.shadow.camera.right = r;
  sonne.shadow.camera.top = r; sonne.shadow.camera.bottom = -r;
  sonne.shadow.camera.near = 1; sonne.shadow.camera.far = 80;
  sonne.shadow.mapSize.set(1024, 1024);
  sonne.shadow.bias = -0.0005;
  scene.add(sonne);
  scene.add(sonne.target);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // Palette beim Biom-Wechsel umstellen (Himmel + Nebel).
  function setzePalette(palette) {
    if (!palette) return;
    if (palette.himmel != null) scene.background = new THREE.Color(palette.himmel);
    if (palette.nebel != null && scene.fog) scene.fog.color = new THREE.Color(palette.nebel);
  }

  return { renderer, scene, camera, controls, lichter: { ambient, hemi, sonne }, resize, setzePalette };
}
