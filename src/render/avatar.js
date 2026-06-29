// =============================================================================
// avatar.js — Low-Poly-Charaktermodell (Bauer) + kleine 3D-Vorschau
// -----------------------------------------------------------------------------
// baueAvatar(cfg) baut ein stilisiertes, freundliches Männchen (Kopf, Haar,
// Pulli/Kutte, Arme, Beine/Jeans, Schuhe, Gesicht) — derselbe Builder wird im
// Spiel (welt.js: der Bauer) UND im Charakter-Menü (Vorschau) genutzt. Über cfg
// werden kosmetische Gegenstände angelegt: ein Hut, ein Zauberstab oder eine Kutte.
//   cfg = { haut, haar, pulli, hose, schuhe,
//           stab:{kind,farbe}|null, hut:{kind,farbe}|null, kutte:{kind,farbe}|null }
// Das Modell steht mit den Füßen auf y = 0 und ist ca. 1,55 Einheiten hoch.
// =============================================================================

import * as THREE from 'three';

const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });

export function baueAvatar(cfg = {}) {
  const c = { haut: 0xf3c79b, haar: 0x3a2e23, pulli: 0x7c4dff, hose: 0x2f4a6b, schuhe: 0xf2f2f2, ...cfg };
  const g = new THREE.Group();
  const add = (mesh, x, y, z = 0) => { mesh.position.set(x, y, z); mesh.castShadow = true; g.add(mesh); return mesh; };

  const hautMat = M(c.haut);
  const haarMat = M(c.haar);
  const koerperFarbe = c.kutte ? c.kutte.farbe : c.pulli; // Kutte ersetzt den Pulli
  const koerperMat = M(koerperFarbe);

  // --- Schuhe ----------------------------------------------------------------
  for (const sx of [-0.13, 0.13]) add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.34), M(c.schuhe)), sx, 0.06, 0.06);

  // --- Beine / Rumpf ---------------------------------------------------------
  if (!c.kutte) {
    for (const sx of [-0.13, 0.13]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.46, 8), M(c.hose)), sx, 0.33, 0);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.07, 14), M(0x26262a)), 0, 0.58, 0); // Gürtel
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.31, 0.52, 14), koerperMat), 0, 0.86, 0);     // Pulli
  } else {
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.52, 1.04, 14), koerperMat), 0, 0.53, 0);     // lange Kutte
  }

  // --- Hals + Arme + Hände ---------------------------------------------------
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), hautMat), 0, 1.14, 0);
  const armL = add(new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.52, 8), koerperMat), -0.31, 0.95, 0);
  armL.rotation.z = 0.2;
  const armR = add(new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.52, 8), koerperMat), 0.31, 0.95, 0);
  armR.rotation.z = -0.2;
  add(new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 6), hautMat), -0.36, 0.7, 0.03);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 6), hautMat), 0.36, 0.7, 0.03);

  // --- Kopf, Ohren, Haar -----------------------------------------------------
  const kopfY = 1.43;
  add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 14), hautMat), 0, kopfY, 0);
  for (const sx of [-0.27, 0.27]) add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), hautMat), sx, kopfY - 0.02, 0);
  const haar = new THREE.Mesh(new THREE.SphereGeometry(0.285, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), haarMat);
  haar.position.set(0, kopfY + 0.03, -0.02); haar.castShadow = true; g.add(haar);
  const fransen = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.12), haarMat);
  fransen.position.set(0, kopfY + 0.17, 0.2); g.add(fransen);

  // --- Gesicht: zwei Augen + Lächeln -----------------------------------------
  for (const sx of [-0.1, 0.1]) {
    const auge = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 10), M(0x241c16, { roughness: 0.4 }));
    auge.position.set(sx, kopfY + 0.04, 0.245); auge.scale.z = 0.5; g.add(auge);
  }
  const mund = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 6, 14, Math.PI), M(0x6b3b2e));
  mund.position.set(0, kopfY - 0.06, 0.25); mund.rotation.z = Math.PI; g.add(mund);

  // --- Kosmetik: Hut & Zauberstab --------------------------------------------
  if (c.hut) baueHut(g, c.hut, kopfY);
  if (c.stab) baueStab(g, c.stab, 0.36, 0.7);

  return g;
}

// --- Hüte --------------------------------------------------------------------
function baueHut(g, hut, kopfY) {
  const mat = M(hut.farbe, { metalness: hut.kind === 'helm' ? 0.4 : 0 });
  const top = kopfY + 0.24;
  if (hut.kind === 'zylinder') {
    g.add(platziere(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 16), mat), 0, top, 0));
    g.add(platziere(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 16), mat), 0, top + 0.18, 0));
  } else if (hut.kind === 'kranz') {
    const k = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.045, 8, 20), mat);
    k.rotation.x = Math.PI / 2; g.add(platziere(k, 0, kopfY + 0.2, 0));
  } else if (hut.kind === 'sombrero') {
    g.add(platziere(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.03, 18), mat), 0, top - 0.02, 0));
    g.add(platziere(new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.26, 16), mat), 0, top + 0.14, 0));
  } else if (hut.kind === 'helm') {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    g.add(platziere(helm, 0, kopfY + 0.06, 0));
    g.add(platziere(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.34), mat), 0, kopfY + 0.34, 0)); // Kamm
  } else { // 'spitzhut' (Zauberhut)
    g.add(platziere(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 18), mat), 0, top - 0.02, 0));
    g.add(platziere(new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.6, 16), mat), 0, top + 0.32, 0));
  }
}

// --- Zauberstäbe (in der rechten Hand) --------------------------------------
function baueStab(g, stab, hx, hy) {
  const grp = new THREE.Group();
  const holzMat = M(0x7a5230);
  const tip = stab.farbe;
  if (stab.kind === 'lineal') {
    const lineal = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.66, 0.016), M(tip));
    grp.add(lineal);
    for (let i = -2; i <= 2; i++) { // ein paar Skalenstriche
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.018), M(0x4a3b2f));
      s.position.y = i * 0.11; grp.add(s);
    }
  } else {
    const griff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 8), holzMat);
    grp.add(griff);
    let spitze;
    if (stab.kind === 'reagenz') { spitze = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.2, 12), M(tip, { transparent: true, opacity: 0.8 })); spitze.position.y = 0.36; }
    else if (stab.kind === 'pinsel') { spitze = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), M(tip)); spitze.position.y = 0.38; }
    else if (stab.kind === 'taktstock') { grp.children[0].material = M(0xffffff); spitze = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), M(0xeeeeee)); spitze.position.y = -0.31; }
    else if (stab.kind === 'feder') { spitze = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 8), M(tip)); spitze.scale.z = 0.3; spitze.position.y = 0.4; }
    else if (stab.kind === 'baguette') { grp.children[0].material = M(tip); grp.children[0].geometry.dispose(); grp.children[0].geometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 10); spitze = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), M(tip)); spitze.position.y = 0.3; const u = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), M(tip)); u.position.y = -0.3; grp.add(u); }
    else if (stab.kind === 'globus') { spitze = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), M(tip)); spitze.position.y = 0.4; }
    else { spitze = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), M(tip, { emissive: tip, emissiveIntensity: 0.5 })); spitze.position.y = 0.38; }
    if (spitze) grp.add(spitze);
  }
  grp.position.set(hx + 0.02, hy + 0.2, 0.06);
  grp.rotation.z = -0.25; grp.rotation.x = -0.2;
  grp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.add(grp);
}

function platziere(mesh, x, y, z) { mesh.position.set(x, y, z); mesh.castShadow = true; return mesh; }

// =============================================================================
// Kleine, eigenständige 3D-Vorschau für das Charakter-Menü.
// Liefert { setzeKosmetik(cfg), dispose() }. Eigener Renderer/Scene/Loop.
// =============================================================================
export function erstelleAvatarVorschau(canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 1.0, 3.3);
  camera.lookAt(0, 0.85, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const sonne = new THREE.DirectionalLight(0xfff2d6, 1.05); sonne.position.set(2, 4, 3); scene.add(sonne);
  const fill = new THREE.DirectionalLight(0x9fb0ff, 0.45); fill.position.set(-3, 2, -2); scene.add(fill);

  // weiche Boden-Ellipse (Spotlight-Optik wie im Referenzbild)
  const boden = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 }));
  boden.rotation.x = -Math.PI / 2; boden.position.y = 0.01; boden.scale.set(1, 0.62, 1); scene.add(boden);

  let avatar = null, laeuft = true;
  const t0 = performance.now();

  function setzeKosmetik(cfg) {
    if (avatar) { scene.remove(avatar); avatar.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); }); }
    avatar = baueAvatar(cfg || {});
    scene.add(avatar);
  }
  function resize() {
    const w = Math.max(80, canvas.clientWidth || 280), h = Math.max(80, canvas.clientHeight || 340);
    const need = canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio());
    if (need) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  }
  function loop(now) {
    if (!laeuft) return;
    resize();
    if (avatar) avatar.rotation.y = -0.35 + Math.sin((now - t0) / 2400) * 0.55; // sanftes Wiegen (3/4-Ansicht)
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    setzeKosmetik,
    dispose() { laeuft = false; if (avatar) scene.remove(avatar); renderer.dispose(); },
  };
}
