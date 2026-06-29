// =============================================================================
// welt.js — Sichtbare Spielwelt: Gitter, Bauer, Pflanzen, Kurve, Effekte, Deko
// -----------------------------------------------------------------------------
// Übersetzt den Spielzustand (Felder, Zauberkurve, Treffer) in Low-Poly-3D.
// Gameplay und Funktionsgraph sind dasselbe: Der gewirkte Zauber wird als
// leuchtendes Band gezeichnet, getroffene Felder blitzen auf.
//
// Koordinaten-Konvention:  Gitter (gx, gy)  →  Welt (x = gx·S, y = 0, z = −gy·S)
// So zeigt +gy "nach hinten" und der Graph liegt lesbar in der Bodenebene.
// =============================================================================

import * as THREE from 'three';
import { baueAvatar } from './avatar.js';

// Kleiner lokaler Helfer: Reifegrad eines wachsenden Feldes (0..1).
function wachstumsGrad(feld, now) {
  if (!feld || !feld.reifBei) return 0;
  const ges = feld.reifBei - feld.gepflanztBei;
  if (ges <= 0) return 1;
  return Math.max(0, Math.min(1, (now - feld.gepflanztBei) / ges));
}

export class Welt {
  constructor(scene, look) {
    this.scene = scene;
    this.look = look;
    this.S = look.kachelGroesse;
    this.radius = look.gitterRadius;

    this._dummy = new THREE.Object3D();
    this._scratch = new THREE.Color();
    this.vorschauSet = new Set(); // Schlüssel der Vorschau-Felder
    this.trefferFlash = new Map(); // schluessel -> endZeit (ms)
    this.pflanzenFarben = {}; // pflanzeId -> Farbwert (von main.js gesetzt)
    this._kosmetik = {}; // angelegte Kosmetik-Konfiguration des Bauern (von main.js)
    this.kurveGruppe = new THREE.Group();
    this.achsenGruppe = new THREE.Group(); // radiusabhängig → bei Wachstum neu gebaut
    this.baumGruppe = new THREE.Group();   // Deko-Bäume am Acker-Rand
    this.burstListe = []; // aktive Partikel-Effekte
    this.zeit = 0;

    scene.add(this.kurveGruppe, this.achsenGruppe, this.baumGruppe);

    this._baueZellen();
    this._baueGitter();
    this._baueAchsen();
    this._bauePflanzen();
    this._baueBauer();
    this._baueDeko();
  }

  // Entfernt & entsorgt alle Kinder einer Gruppe (für radiusabhängigen Neuaufbau).
  _leereGruppe(gruppe) {
    for (const kind of [...gruppe.children]) {
      gruppe.remove(kind);
      kind.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
    }
  }

  // Vergrößert (oder ändert) den sichtbaren Acker-Radius: baut Gitter, Achsen,
  // Pflanzen-Instanzen und Rand-Bäume neu auf. Farben setzt der Aufrufer via
  // setzeBiomePalette() danach erneut.
  setzeRadius(neuerRadius) {
    if (!Number.isInteger(neuerRadius) || neuerRadius === this.radius) return;
    this.radius = neuerRadius;
    if (this.gitter) { this.scene.remove(this.gitter); this.gitter.geometry.dispose(); this.gitter.material.dispose(); }
    if (this.pflanzen) { this.scene.remove(this.pflanzen); this.pflanzen.geometry.dispose(); this.pflanzen.material.dispose(); }
    this._baueZellen();
    this._baueGitter();
    this._baueAchsen();
    this._bauePflanzen();
    this._baueBaeume();
    this.vorschauSet.clear();
    this.trefferFlash.clear();
  }

  schluessel(gx, gy) { return `${gx},${gy}`; }
  gridToWorld(gx, gy, y = 0) { return new THREE.Vector3(gx * this.S, y, -gy * this.S); }

  // Feste Reihenfolge aller Zellen → Index für die Instanced-Meshes.
  _baueZellen() {
    this.zellen = [];
    this.indexVon = new Map();
    for (let gx = -this.radius; gx <= this.radius; gx++) {
      for (let gy = -this.radius; gy <= this.radius; gy++) {
        const key = this.schluessel(gx, gy);
        this.indexVon.set(key, this.zellen.length);
        this.zellen.push({ gx, gy, key });
      }
    }
  }

  // --- Boden-Kacheln als InstancedMesh (eine Draw-Call für alle Felder) -----
  _baueGitter() {
    const S = this.S, L = this.look.kachelLuecke, H = this.look.kachelHoehe;
    const geo = new THREE.BoxGeometry(S - L, H, S - L);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.95 });
    this.gitter = new THREE.InstancedMesh(geo, mat, this.zellen.length);
    this.gitter.receiveShadow = true;
    this.basisFarben = [];
    for (let i = 0; i < this.zellen.length; i++) {
      const { gx, gy } = this.zellen[i];
      const p = this.gridToWorld(gx, gy, -H / 2);
      this._dummy.position.copy(p);
      this._dummy.scale.set(1, 1, 1);
      this._dummy.updateMatrix();
      this.gitter.setMatrixAt(i, this._dummy.matrix);
      this.basisFarben.push(new THREE.Color());
    }
    this.gitter.instanceMatrix.needsUpdate = true;
    this._setzeBasisFarben();
    this.scene.add(this.gitter);
  }

  // Schachbrett-Grundfarben + Ursprung/Achsen-Akzente (palettenabhängig).
  _setzeBasisFarben(palette) {
    const boden = new THREE.Color(palette?.boden ?? this.look.bodenFarbe);
    const boden2 = new THREE.Color(palette?.boden2 ?? this.look.bodenFarbe2);
    const pfad = new THREE.Color(this.look.pfadFarbe);
    const ursprung = new THREE.Color(this.look.ursprungFarbe);
    for (let i = 0; i < this.zellen.length; i++) {
      const { gx, gy } = this.zellen[i];
      let c;
      if (gx === 0 && gy === 0) c = ursprung.clone();
      else if (gx === 0 || gy === 0) c = ((gx + gy) & 1 ? boden : boden2).clone().lerp(pfad, 0.35);
      else c = (gx + gy) & 1 ? boden.clone() : boden2.clone();
      this.basisFarben[i].copy(c);
      this.gitter.setColorAt(i, c);
    }
    this.gitter.instanceColor.needsUpdate = true;
  }

  // --- Leuchtende Achsenlinien ---------------------------------------------
  _baueAchsen() {
    this._leereGruppe(this.achsenGruppe);
    const laenge = (2 * this.radius + 1) * this.S;
    const mat = new THREE.MeshStandardMaterial({
      color: this.look.achseFarbe, emissive: this.look.achseFarbe,
      emissiveIntensity: 0.6, flatShading: true,
    });
    const dicke = 0.06, y = this.look.kachelHoehe / 2 + 0.02;
    const xAchse = new THREE.Mesh(new THREE.BoxGeometry(laenge, dicke, dicke), mat);
    xAchse.position.set(0, y, 0);
    const yAchse = new THREE.Mesh(new THREE.BoxGeometry(dicke, dicke, laenge), mat);
    yAchse.position.set(0, y, 0);
    this.achsenGruppe.add(xAchse, yAchse);
  }

  // --- Pflanzen als InstancedMesh (Reifegrad → Skalierung) ------------------
  _bauePflanzen() {
    const geo = new THREE.IcosahedronGeometry(0.34, 0); // facettierte Low-Poly-Knolle
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.85 });
    this.pflanzen = new THREE.InstancedMesh(geo, mat, this.zellen.length);
    this.pflanzen.castShadow = true;
    for (let i = 0; i < this.zellen.length; i++) {
      this._dummy.position.set(0, -50, 0); // anfangs versteckt
      this._dummy.scale.set(0.001, 0.001, 0.001);
      this._dummy.updateMatrix();
      this.pflanzen.setMatrixAt(i, this._dummy.matrix);
      this.pflanzen.setColorAt(i, new THREE.Color(0xffffff));
    }
    this.pflanzen.instanceMatrix.needsUpdate = true;
    this.scene.add(this.pflanzen);
  }

  // --- Der statische Bauer im Ursprung -------------------------------------
  _baueBauer() {
    // Der Bauer ist jetzt ein Low-Poly-Männchen (avatar.js) — derselbe Builder wie
    // im Charakter-Menü. Über setzeKosmetik() bekommt er Hut/Stab/Kutte.
    this.bauer = new THREE.Group();
    this.bauer.scale.setScalar(0.62); // an den Feld-Maßstab anpassen
    this._fuelleBauer();
    this.scene.add(this.bauer);

    // Ziel-Pfeil zeigt den aktuellen Drehwinkel θ an.
    const pfeilMat = new THREE.MeshStandardMaterial({
      color: this.look.kurveFarbe, emissive: this.look.kurveFarbe, emissiveIntensity: 0.5, flatShading: true,
    });
    this.zielPfeil = new THREE.Group();
    const schaft = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.05), pfeilMat);
    schaft.position.x = 0.7 + this.S * 0.3;
    const spitze = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 6), pfeilMat);
    spitze.rotation.z = -Math.PI / 2;
    spitze.position.x = 1.4 + this.S * 0.3 + 0.15;
    this.zielPfeil.add(schaft, spitze);
    this.zielPfeil.position.y = 0.25;
    this.scene.add(this.zielPfeil);
  }

  // (Neu-)Baut den Avatar des Bauern aus der aktuellen Kosmetik-Konfiguration.
  _fuelleBauer() {
    for (const kind of [...this.bauer.children]) {
      this.bauer.remove(kind);
      kind.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
    }
    this.bauer.add(baueAvatar(this._kosmetik || {}));
  }

  // Legt dem Bauern kosmetische Gegenstände an (Hut/Stab/Kutte) und baut ihn neu.
  setzeKosmetik(cfg) {
    this._kosmetik = cfg || {};
    if (this.bauer) this._fuelleBauer();
  }

  // Richtet den Ziel-Pfeil entlang einer GITTER-Richtung (dx, dy) aus — in der
  // Regel zum fernen Ende der gewirkten Kurve, damit der Pfeil dorthin zeigt, wo
  // der Funktionsgraph tatsächlich verläuft (und nicht nur entlang der θ-Achse).
  //
  // Mapping: Gitterrichtung (dx, dy) → Weltrichtung (dx, 0, −dy). Der Pfeil zeigt
  // im lokalen Frame entlang +x; eine Y-Drehung um φ bildet (1,0,0) auf
  // (cosφ, 0, −sinφ) ab. Mit φ = atan2(dy, dx) stimmen Welt- und Gitterrichtung
  // überein. (Für die reine θ-Achse ist (dx,dy) = (cosθ, sinθ) ⇒ φ = θ.)
  setzeZielrichtung(dx, dy) {
    if (!this.zielPfeil || Math.hypot(dx, dy) < 1e-4) return;
    this.zielPfeil.rotation.y = Math.atan2(dy, dx);
  }

  // --- Rand-Bäume (radiusabhängig → bei Acker-Wachstum neu platziert) -------
  _baueBaeume() {
    this._leereGruppe(this.baumGruppe);
    const aussen = (this.radius + 2.5) * this.S;
    const stammMat = new THREE.MeshStandardMaterial({ color: 0x9c6b3f, flatShading: true });
    const laubFarben = [0x7ec96b, 0x6bbf86, 0xa8d672];
    for (let i = 0; i < 22; i++) {
      const baum = new THREE.Group();
      const winkel = (i / 22) * Math.PI * 2 + Math.random() * 0.2;
      const dist = aussen + Math.random() * 6;
      const stamm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.0, 6), stammMat);
      stamm.position.y = 0.5; stamm.castShadow = true;
      const laub = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.7 + Math.random() * 0.4, 0),
        new THREE.MeshStandardMaterial({ color: laubFarben[i % 3], flatShading: true })
      );
      laub.position.y = 1.4; laub.castShadow = true;
      baum.add(stamm, laub);
      baum.position.set(Math.cos(winkel) * dist, 0, Math.sin(winkel) * dist);
      this.baumGruppe.add(baum);
    }
  }

  // --- Atmosphärische Deko: Bäume + umherfliegende Schmetterlinge -----------
  _baueDeko() {
    this._baueBaeume();

    // Umherfliegende Low-Poly-Schmetterlinge.
    this.schmetterlinge = [];
    const flMat = new THREE.MeshStandardMaterial({ color: 0xff9ad1, flatShading: true, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.05, 3), flMat.clone());
      m.material.color.setHSL(Math.random(), 0.7, 0.7);
      this.scene.add(m);
      this.schmetterlinge.push({ mesh: m, basis: Math.random() * Math.PI * 2, r: 4 + Math.random() * 6, hoehe: 1.5 + Math.random() * 2 });
    }
  }

  // === Pro-Frame-Aktualisierung ===========================================
  aktualisiere(spielfeld, dt, now) {
    this.zeit += dt;
    const pulse = 0.5 + 0.5 * Math.sin(this.zeit * 4);

    // 1) Pflanzen & Boden-Kacheln aus den Feldzuständen ableiten.
    for (let i = 0; i < this.zellen.length; i++) {
      const { gx, gy, key } = this.zellen[i];
      const feld = spielfeld.feldAn(gx, gy);

      // Pflanzen-Instanz
      let skala = 0.001, farbe = this._scratch.set(0xffffff);
      const sichtbar = feld && (feld.zustand === 'wachsend' || feld.zustand === 'erntereif');
      if (sichtbar) {
        const pf = this.pflanzenFarben[feld.pflanzeId];
        if (feld.zustand === 'erntereif') {
          skala = 1.0 + 0.06 * pulse;
          farbe = this._scratch.set(pf || 0x88cc66).lerp(new THREE.Color(0xffffff), 0.25 * pulse);
        } else {
          skala = 0.25 + 0.75 * wachstumsGrad(feld, now);
          farbe = this._scratch.set(pf || 0x88cc66).multiplyScalar(0.85);
        }
        const p = this.gridToWorld(gx, gy, 0.34 * skala);
        this._dummy.position.copy(p);
        this._dummy.scale.set(skala, skala, skala);
      } else {
        this._dummy.position.set(0, -50, 0);
        this._dummy.scale.set(0.001, 0.001, 0.001);
      }
      this._dummy.rotation.set(0, 0, 0);
      this._dummy.updateMatrix();
      this.pflanzen.setMatrixAt(i, this._dummy.matrix);
      this.pflanzen.setColorAt(i, farbe);

      // Boden-Kachelfarbe: Basis + Reife-Tönung + Vorschau + Treffer-Blitz.
      const c = this._scratch.copy(this.basisFarben[i]);
      if (feld && feld.zustand === 'erntereif') c.lerp(new THREE.Color(this.look.erntereifFarbe), 0.30 * pulse);
      if (this.vorschauSet.has(key)) c.lerp(new THREE.Color(this.look.zielVorschauFarbe), 0.55);
      const flashEnde = this.trefferFlash.get(key);
      if (flashEnde) {
        const rest = (flashEnde - now) / 350;
        if (rest > 0) c.lerp(new THREE.Color(this.look.trefferFarbe), Math.min(1, rest));
        else this.trefferFlash.delete(key);
      }
      this.gitter.setColorAt(i, c);
    }
    this.pflanzen.instanceMatrix.needsUpdate = true;
    this.pflanzen.instanceColor.needsUpdate = true;
    this.gitter.instanceColor.needsUpdate = true;

    // 2) Bauer wippt leicht, Schmetterlinge kreisen.
    if (this.bauer) this.bauer.position.y = 0.02 * Math.sin(this.zeit * 2);
    for (const s of this.schmetterlinge) {
      const t = this.zeit * 0.6 + s.basis;
      s.mesh.position.set(Math.cos(t) * s.r, s.hoehe + Math.sin(t * 3) * 0.4, Math.sin(t) * s.r);
      s.mesh.rotation.y = -t;
      s.mesh.rotation.z = Math.sin(t * 8) * 0.6; // flatternde Flügel
    }

    // 3) Kurve-Band ausblenden, Bursts animieren.
    this._aktualisiereKurve(dt);
    this._aktualisiereBursts(dt);
  }

  // Stellt die Wirkung eines Zaubers dar — Kurve, Splash, Frosch-Sprünge,
  // Buchstaben, Algorithmus-/Zeitstrahl-Trails, Kegel/Sektor, tanzende Noten,
  // Regen, Kreuz (Marktgleichgewicht), Ringe (Wellen) oder Waage (Dilemma).
  zeigeVisual(visual) {
    if (!visual) return;
    if (visual.typ === 'splash') this.zeigeSplash(visual.cx, visual.cy, visual.radius);
    else if (visual.typ === 'froesche') this.zeigeFroesche(visual.pfade);
    else if (visual.typ === 'buchstaben') this.zeigeBuchstaben(visual.pfad, visual.buchstaben);
    else if (visual.typ === 'pfad') this.zeigePfad(visual.pfade);
    else if (visual.typ === 'kegel') this.zeigeKegel(visual);
    else if (visual.typ === 'noten') this.zeigeNoten(visual);
    else if (visual.typ === 'regen') this.zeigeRegen(visual);
    else if (visual.typ === 'kreuz') this.zeigeKreuz(visual);
    else if (visual.typ === 'ringe') this.zeigeRinge(visual);
    else if (visual.typ === 'waage') this.zeigeWaage(visual);
    else this.zeigeKurve(visual.punkte);
  }

  // Kleiner Helfer: ein leuchtendes Band (Tube) zwischen zwei Welt-Punkten.
  _balken(a, b, dicke = 0.07, opazitaet = 0.9) {
    const kurve = new THREE.CatmullRomCurve3([a, b]);
    const tube = new THREE.TubeGeometry(kurve, 8, dicke, 6, false);
    const mat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: opazitaet });
    const mesh = new THREE.Mesh(tube, mat); mesh.userData.baseOpacity = opazitaet;
    return mesh;
  }

  // --- Kreuz (zwei sich kreuzende Geraden, „Marktgleichgewicht") ------------
  zeigeKreuz(visual) {
    this._leereKurve();
    const theta = visual.theta || 0, R = Math.max(1, visual.reichweite || 4);
    for (const a of [theta + Math.PI / 4, theta - Math.PI / 4]) {
      const dx = Math.cos(a), dy = Math.sin(a);
      const p1 = this.gridToWorld(R * dx, R * dy, 0.36);
      const p2 = this.gridToWorld(-R * dx, -R * dy, 0.36);
      this.kurveGruppe.add(this._balken(p1, p2, 0.08, 0.9));
    }
    this.kurveLeben = 1.8;
  }

  // --- Konzentrische Ringe (Wellen/„Glockenklang") --------------------------
  zeigeRinge(visual) {
    this._leereKurve();
    const R = Math.max(1, Math.round(visual.reichweite || 3));
    for (let i = 1; i <= R; i++) {
      const r = i * this.S;
      const ringGeo = new THREE.TorusGeometry(r, 0.06, 8, 56);
      const ringMat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.85 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.12; ring.rotation.x = Math.PI / 2; ring.userData.baseOpacity = 0.85;
      this.kurveGruppe.add(ring);
    }
    this.kurveLeben = 1.8;
  }

  // --- Waage (zwei Schalen + Balken, „Dilemma/Abwägung") --------------------
  zeigeWaage(visual) {
    this._leereKurve();
    const theta = visual.theta || 0, abstand = visual.abstand || 3, groesse = visual.groesse || 1;
    const dx = Math.cos(theta), dy = Math.sin(theta);
    // Balken zwischen den beiden Schalen.
    const a = this.gridToWorld(abstand * dx, abstand * dy, 0.5);
    const b = this.gridToWorld(-abstand * dx, -abstand * dy, 0.5);
    this.kurveGruppe.add(this._balken(a, b, 0.05, 0.85));
    // Zwei Schalen als Füllscheiben + Ringe.
    const r = Math.max(0.4, (groesse + 0.4) * this.S);
    for (const z of [{ x: abstand * dx, y: abstand * dy }, { x: -abstand * dx, y: -abstand * dy }]) {
      const mitte = this.gridToWorld(z.x, z.y, 0);
      const discGeo = new THREE.CircleGeometry(r, 30);
      const discMat = new THREE.MeshBasicMaterial({ color: this.look.zielVorschauFarbe, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.copy(mitte); disc.position.y = 0.07; disc.rotation.x = -Math.PI / 2; disc.userData.baseOpacity = 0.45;
      const ringGeo = new THREE.TorusGeometry(r, 0.06, 8, 40);
      const ringMat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.9 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(mitte); ring.position.y = 0.12; ring.rotation.x = Math.PI / 2; ring.userData.baseOpacity = 0.9;
      this.kurveGruppe.add(disc, ring);
    }
    this.kurveLeben = 1.8;
  }

  // --- Tanzende Noten: Sprungbögen (wie Frösche) + Noten-Sprites ------------
  zeigeNoten(visual) {
    this._leereKurve();
    const pfade = visual.pfade, symbol = visual.symbol || '🎵';
    if (!Array.isArray(pfade)) { this.kurveLeben = 1.8; return; }
    for (const pfad of pfade) {
      for (let i = 0; i + 1 < pfad.length; i++) {
        const a = this.gridToWorld(pfad[i].x, pfad[i].y, 0.2);
        const b = this.gridToWorld(pfad[i + 1].x, pfad[i + 1].y, 0.2);
        const mitte = a.clone().add(b).multiplyScalar(0.5); mitte.y += 1.0; // höhere, „tänzelnde" Bögen
        const kurve = new THREE.CatmullRomCurve3([a, mitte, b]);
        const tube = new THREE.TubeGeometry(kurve, 12, 0.04, 5, false);
        const mat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.7 });
        const mesh = new THREE.Mesh(tube, mat); mesh.userData.baseOpacity = 0.7;
        this.kurveGruppe.add(mesh);
      }
      for (let i = 1; i < pfad.length; i++) {
        const sp = this._buchstabenSprite(symbol);
        sp.position.copy(this.gridToWorld(pfad[i].x, pfad[i].y, 0.8));
        this.kurveGruppe.add(sp);
      }
    }
    this.kurveLeben = 1.8;
  }

  // --- Regen: Zonen-Ring (Reichweite) + Tropfen-/Noten-Sprites über den Feldern
  zeigeRegen(visual) {
    this._leereKurve();
    const zellen = visual.zellen || [], symbol = visual.symbol || '💧';
    const r = Math.max(0.4, (visual.radius || 3) * this.S);
    const ringGeo = new THREE.TorusGeometry(r, 0.07, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: this.look.zielVorschauFarbe, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.1; ring.rotation.x = Math.PI / 2; ring.userData.baseOpacity = 0.7;
    this.kurveGruppe.add(ring);
    for (const z of zellen) {
      const sp = this._buchstabenSprite(symbol);
      sp.position.copy(this.gridToWorld(z.gx, z.gy, 0.9));
      this.kurveGruppe.add(sp);
    }
    this.kurveLeben = 1.8;
  }

  // --- Algorithmus-/Zeitstrahl-Pfade als leuchtende Trails + Knoten ---------
  zeigePfad(pfade) {
    this._leereKurve();
    if (!Array.isArray(pfade)) { this.kurveLeben = 1.8; return; }
    const knoten = new Set(); // berührte Gitterfelder (dedupliziert) für Marker
    for (const pfad of pfade) {
      if (!pfad || pfad.length < 1) continue;
      if (pfad.length >= 2) {
        const pts = pfad.map((p) => this.gridToWorld(p.x, p.y, 0.32));
        const kurve = new THREE.CatmullRomCurve3(pts);
        const tube = new THREE.TubeGeometry(kurve, Math.max(8, pts.length * 3), 0.06, 6, false);
        const mat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(tube, mat); mesh.userData.baseOpacity = 0.9;
        this.kurveGruppe.add(mesh);
      }
      for (const p of pfad) {
        const gx = Math.round(p.x), gy = Math.round(p.y);
        if (gx === 0 && gy === 0) continue;
        const key = this.schluessel(gx, gy);
        if (knoten.has(key)) continue;
        knoten.add(key);
        const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
        const mat = new THREE.MeshBasicMaterial({ color: this.look.trefferFarbe, transparent: true, opacity: 0.95 });
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(this.gridToWorld(gx, gy, 0.3)); m.userData.baseOpacity = 0.95;
        this.kurveGruppe.add(m);
      }
    }
    this.kurveLeben = 1.8;
  }

  // --- Kegel/Sektor: leuchtender 3D-Kegel über dem Acker + Boden-Sektor -----
  zeigeKegel(visual) {
    this._leereKurve();
    const theta = visual.theta || 0;
    const rg = Math.max(0.5, visual.reichweite || 4); // Reichweite in Gitter-Feldern
    const R = rg * this.S;
    const oeffnung = visual.oeffnung || Math.PI / 3;

    // Flacher Boden-Sektor (Füllung) — zeigt exakt die getroffene Fläche. KEIN
    // 3D-Kegel in der Luft. CircleGeometry erzeugt einen Sektor in der lokalen
    // XY-Ebene; nach rotation.x = −90° bildet er (x,y)→(x,−z) ab (Gitter→Welt).
    const sektorGeo = new THREE.CircleGeometry(R, 30, theta - oeffnung / 2, oeffnung);
    const sektorMat = new THREE.MeshBasicMaterial({ color: this.look.zielVorschauFarbe, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const sektor = new THREE.Mesh(sektorGeo, sektorMat);
    sektor.rotation.x = -Math.PI / 2; sektor.position.y = 0.06; sektor.userData.baseOpacity = 0.5;
    this.kurveGruppe.add(sektor);

    // Leuchtender Umriss am Boden: Ursprung → Bogen → Ursprung (zwei Schenkel + Bogen).
    const pts = [this.gridToWorld(0, 0, 0.12)];
    const seg = 24;
    for (let i = 0; i <= seg; i++) {
      const a = theta - oeffnung / 2 + (oeffnung * i) / seg;
      pts.push(this.gridToWorld(rg * Math.cos(a), rg * Math.sin(a), 0.12));
    }
    pts.push(this.gridToWorld(0, 0, 0.12));
    const umriss = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.9 }));
    umriss.userData.baseOpacity = 0.9;
    this.kurveGruppe.add(umriss);

    this.kurveLeben = 1.8;
  }

  // Erzeugt ein Sprite mit einem Buchstaben (per Canvas-Textur, leichtgewichtig).
  _buchstabenSprite(zeichen) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = 'bold 46px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff7e8';
    ctx.fillText(zeichen || '?', 32, 35);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.98, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(0.85, 0.85, 0.85);
    sp.userData.baseOpacity = 0.98;
    return sp;
  }

  // --- Springende Buchstaben als Bögen + Buchstaben-Sprites -----------------
  zeigeBuchstaben(pfad, buchstaben = []) {
    this._leereKurve();
    if (!Array.isArray(pfad)) { this.kurveLeben = 1.8; return; }
    // Sprungbögen zwischen den Landepunkten (wie bei den Fröschen).
    for (let i = 0; i + 1 < pfad.length; i++) {
      const a = this.gridToWorld(pfad[i].x, pfad[i].y, 0.2);
      const b = this.gridToWorld(pfad[i + 1].x, pfad[i + 1].y, 0.2);
      const mitte = a.clone().add(b).multiplyScalar(0.5); mitte.y += 0.85;
      const kurve = new THREE.CatmullRomCurve3([a, mitte, b]);
      const tube = new THREE.TubeGeometry(kurve, 12, 0.045, 5, false);
      const mat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.8 });
      const mesh = new THREE.Mesh(tube, mat); mesh.userData.baseOpacity = 0.8;
      this.kurveGruppe.add(mesh);
    }
    // Buchstaben-Sprites auf den Landefeldern (Start im Ursprung auslassen).
    for (let i = 1; i < pfad.length; i++) {
      const sp = this._buchstabenSprite(buchstaben[i - 1]);
      sp.position.copy(this.gridToWorld(pfad[i].x, pfad[i].y, 0.7));
      this.kurveGruppe.add(sp);
    }
    this.kurveLeben = 1.6;
  }

  // --- Frosch-Sprünge als kleine Bögen + Landungs-Marker --------------------
  zeigeFroesche(pfade) {
    this._leereKurve();
    if (!Array.isArray(pfade)) { this.kurveLeben = 1.6; return; }
    for (const pfad of pfade) {
      // Sprungbögen zwischen aufeinanderfolgenden Landepunkten.
      for (let i = 0; i + 1 < pfad.length; i++) {
        const a = this.gridToWorld(pfad[i].x, pfad[i].y, 0.2);
        const b = this.gridToWorld(pfad[i + 1].x, pfad[i + 1].y, 0.2);
        const mitte = a.clone().add(b).multiplyScalar(0.5); mitte.y += 0.9; // Bogenhöhe
        const kurve = new THREE.CatmullRomCurve3([a, mitte, b]);
        const tube = new THREE.TubeGeometry(kurve, 12, 0.05, 5, false);
        const mat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(tube, mat); mesh.userData.baseOpacity = 0.9;
        this.kurveGruppe.add(mesh);
      }
      // Landungs-Marker (ohne den Start im Ursprung).
      for (let i = 1; i < pfad.length; i++) {
        const p = this.gridToWorld(pfad[i].x, pfad[i].y, 0.25);
        const geo = new THREE.SphereGeometry(0.16, 8, 6);
        const mat = new THREE.MeshBasicMaterial({ color: this.look.trefferFarbe, transparent: true, opacity: 0.95 });
        const m = new THREE.Mesh(geo, mat); m.position.copy(p); m.userData.baseOpacity = 0.95;
        this.kurveGruppe.add(m);
      }
    }
    this.kurveLeben = 1.6;
  }

  // --- Funktionsgraph als leuchtendes Band ---------------------------------
  zeigeKurve(kurvenPunkte) {
    this._leereKurve();
    // In zusammenhängende Segmente teilen (null = Definitionslücke).
    let segment = [];
    const segmente = [];
    for (const p of kurvenPunkte) {
      if (p === null) { if (segment.length > 1) segmente.push(segment); segment = []; }
      else segment.push(this.gridToWorld(p.x, p.y, 0.4));
    }
    if (segment.length > 1) segmente.push(segment);

    for (const seg of segmente) {
      const curve = new THREE.CatmullRomCurve3(seg);
      const tube = new THREE.TubeGeometry(curve, Math.max(8, seg.length * 2), 0.09, 6, false);
      const mat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.95 });
      const mesh = new THREE.Mesh(tube, mat);
      mesh.userData.baseOpacity = 0.95;
      this.kurveGruppe.add(mesh);
    }
    this.kurveLeben = 1.6; // Sekunden bis vollständig ausgeblendet
  }

  // --- Splash-/Flächenzauber als leuchtender Ring + Füllscheibe -------------
  zeigeSplash(cxGrid, cyGrid, radius) {
    this._leereKurve();
    const mitte = this.gridToWorld(cxGrid, cyGrid, 0);
    const r = Math.max(0.2, radius * this.S);

    // Leuchtender Umriss-Ring.
    const ringGeo = new THREE.TorusGeometry(r, 0.1, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: this.look.kurveFarbe, transparent: true, opacity: 0.95 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(mitte); ring.position.y = 0.12; ring.rotation.x = Math.PI / 2;
    ring.userData.baseOpacity = 0.95;

    // Halbtransparente Füllscheibe (die getroffene Fläche).
    const discGeo = new THREE.CircleGeometry(r, 40);
    const discMat = new THREE.MeshBasicMaterial({ color: this.look.zielVorschauFarbe, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.copy(mitte); disc.position.y = 0.06; disc.rotation.x = -Math.PI / 2;
    disc.userData.baseOpacity = 0.4;

    this.kurveGruppe.add(disc, ring);
    this.kurveLeben = 1.6;
  }

  _aktualisiereKurve(dt) {
    if (this.kurveGruppe.children.length === 0) return;
    this.kurveLeben -= dt;
    const f = Math.max(0, this.kurveLeben / 1.6); // 1 → 0 über die Lebensdauer
    for (const m of this.kurveGruppe.children) {
      m.material.opacity = (m.userData.baseOpacity ?? 0.95) * f;
    }
    if (this.kurveLeben <= 0) this._leereKurve();
  }

  _leereKurve() {
    for (const m of this.kurveGruppe.children) {
      // Sprites teilen sich eine globale Geometrie → NICHT freigeben.
      if (!m.isSprite && m.geometry) m.geometry.dispose();
      if (m.material) {
        if (m.material.map) m.material.map.dispose(); // Buchstaben-Canvas-Textur
        m.material.dispose();
      }
    }
    this.kurveGruppe.clear();
  }

  // --- Treffer-Partikelburst auf geernteten Feldern ------------------------
  trefferBurst(ziele, now) {
    for (const z of ziele) this.trefferFlash.set(this.schluessel(z.gx, z.gy), now + 350);
    if (!ziele.length) return;
    const anzahl = ziele.length * 6;
    const pos = new Float32Array(anzahl * 3);
    const vel = [];
    let k = 0;
    for (const z of ziele) {
      const basis = this.gridToWorld(z.gx, z.gy, 0.3);
      for (let j = 0; j < 6; j++) {
        pos[k * 3] = basis.x; pos[k * 3 + 1] = basis.y; pos[k * 3 + 2] = basis.z;
        vel.push(new THREE.Vector3((Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2));
        k++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: this.look.trefferFarbe, size: 0.22, transparent: true });
    const punkte = new THREE.Points(geo, mat);
    this.scene.add(punkte);
    this.burstListe.push({ punkte, vel, leben: 0.8 });
  }

  _aktualisiereBursts(dt) {
    for (let i = this.burstListe.length - 1; i >= 0; i--) {
      const b = this.burstListe[i];
      b.leben -= dt;
      const arr = b.punkte.geometry.attributes.position.array;
      for (let j = 0; j < b.vel.length; j++) {
        b.vel[j].y -= 6 * dt; // Schwerkraft
        arr[j * 3] += b.vel[j].x * dt;
        arr[j * 3 + 1] += b.vel[j].y * dt;
        arr[j * 3 + 2] += b.vel[j].z * dt;
      }
      b.punkte.geometry.attributes.position.needsUpdate = true;
      b.punkte.material.opacity = Math.max(0, b.leben / 0.8);
      if (b.leben <= 0) {
        this.scene.remove(b.punkte);
        b.punkte.geometry.dispose(); b.punkte.material.dispose();
        this.burstListe.splice(i, 1);
      }
    }
  }

  // --- Vorschau der zu treffenden Felder (Live beim Zielen) -----------------
  setzeVorschau(ziele) {
    this.vorschauSet.clear();
    for (const z of ziele) this.vorschauSet.add(this.schluessel(z.gx, z.gy));
  }
  loescheVorschau() { this.vorschauSet.clear(); }

  // Biom-Palette für den Boden umstellen.
  setzeBiomePalette(palette) { this._setzeBasisFarben(palette); }

  // Pflanzenfarben-Tabelle setzen (pflanzeId -> Farbwert), von main.js gespeist.
  setzePflanzenFarben(tabelle) { this.pflanzenFarben = tabelle || {}; }
}
