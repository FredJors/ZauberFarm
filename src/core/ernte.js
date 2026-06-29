// =============================================================================
// ernte.js — Kern der Erntemechanik (reine Funktionen, ohne Three.js / DOM)
// -----------------------------------------------------------------------------
// Hier lebt die zentrale Idee von ZauberAcker: Ein Zauber ist eine Funktion f
// mit Definitionsbereich [a, b] und Drehwinkel θ. Punktweise Ernte:
//   1. für jedes ganzzahlige x in [a, b]: lokaler Punkt P = (x, f(x))
//   2. P um den Ursprung um θ drehen → P'
//   3. P' auf das nächste Gitterfeld runden → Zielfeld
// Integral-Zauber ernten zusätzlich die Fläche zwischen Kurve und x-Achse.
// Die Funktionen sind bewusst rein und testbar; sie kennen nur Koordinaten.
// =============================================================================

// Dreht den Punkt (x, y) um den Ursprung um den Winkel theta (Bogenmaß).
export function rotiere(x, y, theta) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return { x: x * c - y * s, y: x * s + y * c };
}

const schluessel = (gx, gy) => `${gx},${gy}`;

// Fügt das gerundete, gedrehte Zielfeld der Map hinzu (dedupliziert Mehrfachtreffer).
function addZiel(map, x, y, theta) {
  const p = rotiere(x, y, theta);
  const gx = Math.round(p.x);
  const gy = Math.round(p.y);
  map.set(schluessel(gx, gy), { gx, gy });
}

// Berechnet die diskreten Zielfelder eines Zaubers.
//   f          : (x) => y  — die Funktion
//   a, b       : Definitionsbereich (inklusive Grenzen)
//   theta      : Drehwinkel in Bogenmaß
//   istIntegral: true → Flächenernte zwischen Kurve und x-Achse
// Gibt ein Array eindeutiger Felder { gx, gy } zurück.
export function berechneZielFelder({ f, a, b, theta = 0, istIntegral = false }) {
  const ziele = new Map();
  const start = Math.ceil(a);
  const ende = Math.floor(b);
  for (let x = start; x <= ende; x++) {
    const fy = f(x);
    if (!Number.isFinite(fy)) continue; // z.B. log(negativ) überspringen
    if (istIntegral) {
      // Lokal alle ganzzahligen y zwischen 0 und f(x) (in beide Richtungen).
      const lo = Math.min(0, fy);
      const hi = Math.max(0, fy);
      for (let y = Math.ceil(lo); y <= Math.floor(hi); y++) {
        addZiel(ziele, x, y, theta);
      }
    } else {
      addZiel(ziele, x, fy, theta);
    }
  }
  return [...ziele.values()];
}

// Berechnet die kontinuierliche, gedrehte Kurve für die Darstellung als
// leuchtendes Band. Liefert viele feine Stützpunkte in GITTER-Koordinaten.
export function berechneKurvenPunkte({ f, a, b, theta = 0, schritte = 160 }) {
  const punkte = [];
  for (let i = 0; i <= schritte; i++) {
    const x = a + ((b - a) * i) / schritte;
    const y = f(x);
    if (!Number.isFinite(y)) {
      punkte.push(null); // Lücke (z.B. Definitionslücke) → Band unterbrechen
      continue;
    }
    punkte.push(rotiere(x, y, theta));
  }
  return punkte;
}

// --- SPLASH-/FLÄCHENERNTE (z. B. Chemie) ------------------------------------
// Statt einer Kurve trifft ein "Splash" eine ganze Kreisfläche um einen Mittel-
// punkt (cx, cy). Erntet alle ganzzahligen Felder innerhalb des Radius.
export function berechneSplashFelder({ cx, cy, radius }) {
  const ziele = new Map();
  const r2 = radius * radius;
  const minX = Math.ceil(cx - radius), maxX = Math.floor(cx + radius);
  const minY = Math.ceil(cy - radius), maxY = Math.floor(cy + radius);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r2) ziele.set(schluessel(x, y), { gx: x, gy: y });
    }
  }
  return [...ziele.values()];
}

// Ringpunkte (GITTER-Koordinaten) für die Darstellung des Splash-Umrisses.
export function berechneSplashRing({ cx, cy, radius, schritte = 44 }) {
  const punkte = [];
  for (let i = 0; i <= schritte; i++) {
    const a = (i / schritte) * Math.PI * 2;
    punkte.push({ x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius });
  }
  return punkte;
}

// --- FROSCH-ERNTE (z. B. Biologie) ------------------------------------------
// Mehrere Frösche starten im Ursprung und machen je `spruenge` ZUFÄLLIGE Sprünge
// (grob in Richtung θ, mit weiter Streuung), bis zu `weite` Felder weit. Jedes
// gelandete Feld wird geerntet; danach verpuffen die Frösche. Innerhalb des
// Acker-Radius gehalten. Gibt geerntete Felder + die Sprungpfade (zum Zeichnen).
export function berechneFroschFelder({ anzahl = 1, spruenge = 3, weite = 2, theta = 0, radius = 8, rng = Math.random }) {
  const ziele = new Map();
  const pfade = [];
  const grenze = Math.max(1, radius);
  for (let f = 0; f < anzahl; f++) {
    let x = 0, y = 0;
    const pfad = [{ x, y }];
    for (let s = 0; s < spruenge; s++) {
      const winkel = theta + (rng() - 0.5) * (Math.PI * 0.9); // ±~80° um die Zielrichtung
      const dist = 1 + rng() * Math.max(0, weite - 1);
      x = Math.max(-grenze, Math.min(grenze, x + Math.cos(winkel) * dist));
      y = Math.max(-grenze, Math.min(grenze, y + Math.sin(winkel) * dist));
      pfad.push({ x, y });
      const gx = Math.round(x), gy = Math.round(y);
      if (!(gx === 0 && gy === 0)) ziele.set(schluessel(gx, gy), { gx, gy });
    }
    pfade.push(pfad);
  }
  return { ziele: [...ziele.values()], pfade };
}

// --- REGEN-ERNTE (z. B. Musik: Notenregen, Erdkunde: Monsun) ----------------
// Es regnet auf `anzahl` ZUFÄLLIGE Felder im Umkreis `radius` um den Ursprung
// (ohne das Ursprungsfeld). Anzahl der Tropfen UND der Radius sind aufwertbar.
// Liefert die getroffenen Felder { gx, gy }.
export function berechneRegenFelder({ anzahl = 3, radius = 3, rng = Math.random }) {
  const kandidaten = [];
  const R = Math.max(1, radius);
  const g = Math.ceil(R);
  for (let gx = -g; gx <= g; gx++) {
    for (let gy = -g; gy <= g; gy++) {
      if (gx === 0 && gy === 0) continue;
      if (Math.hypot(gx, gy) <= R) kandidaten.push({ gx, gy });
    }
  }
  // Teilweises Fisher-Yates: die ersten n Plätze zufällig befüllen.
  const n = Math.min(Math.max(0, Math.round(anzahl)), kandidaten.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (kandidaten.length - i));
    [kandidaten[i], kandidaten[j]] = [kandidaten[j], kandidaten[i]];
  }
  return kandidaten.slice(0, n);
}

// --- BUCHSTABEN-ERNTE (z. B. Deutsch/Englisch) ------------------------------
// `anzahl` Buchstaben hüpfen vom Ursprung in Richtung θ über den Acker, mit einer
// sanften seitlichen Welle (amplitude). Jedes Landefeld wird geerntet. Liefert
// die Zielfelder, den Pfad (für die Sprungbögen) und die anzuzeigenden Zeichen
// (aus dem Wort `wort`, das bei Bedarf wiederholt wird).
export function berechneBuchstabenFelder({ anzahl = 3, schrittweite = 1, amplitude = 0.6, theta = 0, wort = '' }) {
  const ziele = new Map();
  const pfad = [{ x: 0, y: 0 }];
  const buchstaben = [];
  const dx = Math.cos(theta), dy = Math.sin(theta);
  const px = -dy, py = dx; // Senkrechte zur Zielrichtung
  for (let i = 1; i <= anzahl; i++) {
    const d = i * schrittweite;
    const perp = amplitude * Math.sin(i * 0.95); // sanftes Hin-und-Her
    const x = d * dx + perp * px;
    const y = d * dy + perp * py;
    pfad.push({ x, y });
    const gx = Math.round(x), gy = Math.round(y);
    if (!(gx === 0 && gy === 0)) ziele.set(schluessel(gx, gy), { gx, gy });
    buchstaben.push(wort ? wort[(i - 1) % wort.length] : '');
  }
  return { ziele: [...ziele.values()], pfad, buchstaben };
}

// --- ALGORITHMUS-/PFAD-ERNTE (z. B. Informatik, Geschichte) -----------------
// Ein Zauber liefert über zauber.pfad(params) EINEN oder MEHRERE Pfade (Polylinien
// aus lokalen {x,y}-Punkten — z. B. eine Spirale, ein gefülltes Raster, ein
// rekursiver Baum oder ein gerader Zeitstrahl). Hier werden die Pfade um θ gedreht,
// auf den Acker begrenzt und die berührten Gitterfelder geerntet. Liefert die
// Zielfelder UND die gedrehten Pfade (zum Zeichnen der leuchtenden Trails).
export function berechnePfadFelder({ pfade, theta = 0, radius = 8 }) {
  const ziele = new Map();
  const grenze = Math.max(1, radius);
  const ausgabe = [];
  for (const pfad of pfade) {
    const gedreht = [];
    for (const pt of pfad) {
      const r = rotiere(pt.x, pt.y, theta);
      const cx = Math.max(-grenze, Math.min(grenze, r.x));
      const cy = Math.max(-grenze, Math.min(grenze, r.y));
      gedreht.push({ x: cx, y: cy });
      const gx = Math.round(cx), gy = Math.round(cy);
      if (!(gx === 0 && gy === 0)) ziele.set(schluessel(gx, gy), { gx, gy });
    }
    ausgabe.push(gedreht);
  }
  return { ziele: [...ziele.values()], pfade: ausgabe };
}

// --- KEGEL-/SEKTOR-ERNTE (z. B. Physik: Lichtkegel) -------------------------
// Legt einen Kegel (in der Bodenebene: ein Kreissektor) vom Ursprung über den
// Acker: erntet alle Felder bis zur Reichweite, deren Richtung höchstens
// oeffnung/2 von der Zielrichtung θ abweicht.
export function berechneKegelFelder({ theta = 0, reichweite = 4, oeffnung = Math.PI / 3 }) {
  const ziele = new Map();
  const R = Math.max(1, reichweite);
  const halb = oeffnung / 2;
  const g = Math.ceil(R);
  for (let gx = -g; gx <= g; gx++) {
    for (let gy = -g; gy <= g; gy++) {
      if (gx === 0 && gy === 0) continue;
      if (Math.hypot(gx, gy) > R) continue;
      // Winkeldifferenz robust auf [-π, π] normalisieren.
      const d = Math.atan2(gy, gx) - theta;
      const diff = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(diff) <= halb) ziele.set(schluessel(gx, gy), { gx, gy });
    }
  }
  return [...ziele.values()];
}

// --- KREUZ-ERNTE (z. B. Politik-Wirtschaft: Marktgleichgewicht) -------------
// Zwei sich kreuzende Geraden (Angebot ↗ und Nachfrage ↘) durch den Ursprung,
// jeweils unter θ±45°, bis zur Reichweite. Erntet beide Linien (ein „X").
export function berechneKreuzFelder({ theta = 0, reichweite = 4 }) {
  const ziele = new Map();
  const R = Math.max(1, reichweite);
  for (const a of [theta + Math.PI / 4, theta - Math.PI / 4]) {
    const dx = Math.cos(a), dy = Math.sin(a);
    for (let r = 0.5; r <= R + 1e-9; r += 0.5) {
      for (const s of [1, -1]) {
        const gx = Math.round(s * r * dx), gy = Math.round(s * r * dy);
        if (gx === 0 && gy === 0) continue;
        ziele.set(schluessel(gx, gy), { gx, gy });
      }
    }
  }
  return [...ziele.values()];
}

// --- RINGE-ERNTE (z. B. Religion: Glockenklang/Segenswelle) -----------------
// Konzentrische Ringe um den Ursprung: erntet alle Felder, die nahe an einem
// ganzzahligen Radius (1 … reichweite) liegen — ein Wellen-/Ripple-Muster.
export function berechneRingeFelder({ reichweite = 3 }) {
  const ziele = new Map();
  const R = Math.max(1, Math.round(reichweite));
  for (let gx = -R; gx <= R; gx++) {
    for (let gy = -R; gy <= R; gy++) {
      if (gx === 0 && gy === 0) continue;
      const d = Math.hypot(gx, gy);
      const naechster = Math.round(d);
      if (naechster >= 1 && naechster <= R && Math.abs(d - naechster) <= 0.45) {
        ziele.set(schluessel(gx, gy), { gx, gy });
      }
    }
  }
  return [...ziele.values()];
}

// --- WAAGE-ERNTE (z. B. Werte/Normen: Dilemma/Abwägung) ---------------------
// Zwei „Waagschalen" — kreisförmige Felder-Gruppen — liegen symmetrisch im
// Abstand `abstand` zum Ursprung (entlang θ), jede mit Halbgröße `groesse`.
export function berechneWaageFelder({ theta = 0, abstand = 3, groesse = 1 }) {
  const dx = Math.cos(theta), dy = Math.sin(theta);
  const zentren = [
    { cx: abstand * dx, cy: abstand * dy },
    { cx: -abstand * dx, cy: -abstand * dy },
  ];
  const ziele = new Map();
  for (const z of zentren) {
    for (const f of berechneSplashFelder({ cx: z.cx, cy: z.cy, radius: groesse + 0.4 })) {
      if (f.gx === 0 && f.gy === 0) continue;
      ziele.set(schluessel(f.gx, f.gy), f);
    }
  }
  return [...ziele.values()];
}

// --- VEREINHEITLICHTE FORM-BERECHNUNG ---------------------------------------
// Liefert für JEDEN Zauber die Zielfelder + eine Visual-Beschreibung, abhängig
// von zauber.form ('kurve' = Funktionsgraph, 'splash' = Kreisfläche,
// 'buchstaben' = Sprungbögen, 'pfad' = Algorithmus-Trail, 'kegel' = Sektor).
// So teilen sich alle Fächer dieselbe Ernte-/Render-Pipeline.
//   Rückgabe: { ziele:[{gx,gy}], visual:{ typ, ... , richtung:{x,y} } }
//   richtung = Gitterrichtung, in die der Ziel-Pfeil zeigen soll.
export function berechneErnteForm(zauber, params) {
  const theta = params.theta || 0;
  // Acker-Halbradius (Felder). Zauber dürfen NICHT über den Ackerrand hinaus-
  // reichen: Wird ein aufgewerteter Zauber weiter als der Acker, begrenzen wir
  // ihn auf den Rand. Erst ein größerer Acker macht mehr Reichweite nutzbar.
  const R = Number.isFinite(params.ackerRadius) ? params.ackerRadius : Infinity;
  const klemme = (v) => Math.max(-R, Math.min(R, v));
  const imAcker = (z) => Math.abs(z.gx) <= R && Math.abs(z.gy) <= R;

  if (zauber.form === 'splash') {
    const radius = Math.min(params.radius, R);
    const reichweite = Math.min(params.reichweite, Math.max(0, R - radius));
    const cx = reichweite * Math.cos(theta);
    const cy = reichweite * Math.sin(theta);
    const ziele = berechneSplashFelder({ cx, cy, radius });
    return {
      ziele,
      visual: {
        typ: 'splash', cx, cy, radius,
        richtung: { x: Math.cos(theta), y: Math.sin(theta) },
      },
    };
  }

  if (zauber.form === 'buchstaben') {
    const r = berechneBuchstabenFelder({
      anzahl: params.anzahl, schrittweite: params.schrittweite,
      amplitude: params.amplitude ?? 0.6, theta, wort: params.wort || '',
    });
    return {
      ziele: r.ziele.filter(imAcker),
      visual: {
        typ: 'buchstaben',
        pfad: r.pfad.map((pt) => ({ x: klemme(pt.x), y: klemme(pt.y) })),
        buchstaben: r.buchstaben,
        richtung: { x: Math.cos(theta), y: Math.sin(theta) },
      },
    };
  }

  if (zauber.form === 'pfad') {
    const roh = zauber.pfad(params) || [];
    // Einzel-Pfad (Array von {x,y}) ODER mehrere Pfade (Array von Pfaden).
    const pfadeLokal = Array.isArray(roh[0]) ? roh : [roh];
    const { ziele, pfade } = berechnePfadFelder({
      pfade: pfadeLokal, theta, radius: params.ackerRadius ?? 8,
    });
    return {
      ziele,
      visual: { typ: 'pfad', pfade, richtung: { x: Math.cos(theta), y: Math.sin(theta) } },
    };
  }

  if (zauber.form === 'kegel') {
    const reichweite = Math.min(params.reichweite, R);
    const oeffnung = params.oeffnung ?? Math.PI / 3;
    const ziele = berechneKegelFelder({ theta, reichweite, oeffnung });
    return {
      ziele,
      visual: {
        typ: 'kegel', theta, reichweite, oeffnung,
        richtung: { x: Math.cos(theta), y: Math.sin(theta) },
      },
    };
  }

  if (zauber.form === 'kreuz') {
    const reichweite = Math.min(params.reichweite, R);
    const ziele = berechneKreuzFelder({ theta, reichweite });
    return {
      ziele,
      visual: { typ: 'kreuz', theta, reichweite, richtung: { x: Math.cos(theta), y: Math.sin(theta) } },
    };
  }

  if (zauber.form === 'ringe') {
    const reichweite = Math.min(params.reichweite, R);
    const ziele = berechneRingeFelder({ reichweite });
    return {
      ziele,
      visual: { typ: 'ringe', reichweite, richtung: { x: Math.cos(theta), y: Math.sin(theta) } },
    };
  }

  if (zauber.form === 'waage') {
    const groesse = Math.min(params.groesse, R);
    const abstand = Math.min(params.abstand, Math.max(0, R - groesse - 0.4));
    const ziele = berechneWaageFelder({ theta, abstand, groesse });
    return {
      ziele,
      visual: {
        typ: 'waage', theta, abstand, groesse,
        richtung: { x: Math.cos(theta), y: Math.sin(theta) },
      },
    };
  }

  // Standard: Funktionsgraph (inkl. Integral-Flächenernte über istIntegral).
  const fn = zauber.f(params);
  const ziele = berechneZielFelder({
    f: fn, a: params.bereichMin, b: params.bereichMax,
    theta, istIntegral: zauber.istIntegral,
  }).filter(imAcker);
  // Kurvenpunkte am Ackerrand abschneiden (null = Lücke), statt über den Acker
  // hinaus zu zeichnen — die leuchtende Kurve endet sauber am Rand.
  const punkte = berechneKurvenPunkte({
    f: fn, a: params.bereichMin, b: params.bereichMax, theta,
  }).map((pt) => (pt && Math.abs(pt.x) <= R && Math.abs(pt.y) <= R ? pt : null));
  // Pfeil zum fernen Kurvenende ausrichten (= dorthin, wo der Graph verläuft).
  const yEnde = fn(params.bereichMax);
  let richtung = Number.isFinite(yEnde) ? rotiere(params.bereichMax, yEnde, theta) : null;
  if (!richtung || Math.hypot(richtung.x, richtung.y) < 1e-3) {
    richtung = { x: Math.cos(theta), y: Math.sin(theta) };
  }
  return { ziele, visual: { typ: 'kurve', punkte, richtung } };
}
