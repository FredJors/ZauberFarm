// =============================================================================
// tutorial.js — Spotlight-Tour (Onboarding), wie in der Spielebranche üblich
// -----------------------------------------------------------------------------
// Hebt EIN UI-Element nach dem anderen hervor: der Rest wird abgedunkelt und
// verschwommen (vier „Rahmen"-Flächen mit backdrop-filter rund um das Ziel-Loch),
// um das Ziel liegt ein leuchtender Ring, dazu ein Text-Popup mit Weiter/Zurück.
// Die Tour ist datengetrieben: ui.js übergibt Schritte { sel, titel, text }.
//   sel : CSS-Selektor des Ziel-Elements (oder null/fehlend → zentriert, ohne Loch)
// =============================================================================

function el(cls, tag = 'div') { const e = document.createElement(tag); e.className = cls; return e; }
function knopf(text, cls, fn) { const b = el(cls, 'button'); b.textContent = text; b.addEventListener('click', fn); return b; }

export class Tutorial {
  constructor() {
    this.aktiv = false;
    this.schritte = [];
    this.i = 0;
    this._baue();
    window.addEventListener('resize', () => { if (this.aktiv) this._positioniere(); });
    window.addEventListener('keydown', (e) => { if (this.aktiv && e.key === 'Escape') this.beenden(); });
  }

  _baue() {
    this.wurzel = el('tut-wurzel');
    this.wurzel.style.display = 'none';
    this.catcher = el('tut-catcher');                 // schluckt alle Klicks auf die Seite
    this.frames = [el('tut-frame'), el('tut-frame'), el('tut-frame'), el('tut-frame')];
    this.ring = el('tut-ring');
    this.tip = el('tut-tip');
    this.wurzel.append(this.catcher, ...this.frames, this.ring, this.tip);
    document.body.append(this.wurzel);
  }

  starte(schritte, onEnde) {
    this.schritte = (schritte || []).filter(Boolean);
    if (!this.schritte.length) return;
    this.onEnde = onEnde;
    this.i = 0;
    this.aktiv = true;
    this.wurzel.style.display = 'block';
    this._zeige();
  }

  beenden() {
    if (!this.aktiv) return;
    this.aktiv = false;
    this.wurzel.style.display = 'none';
    const f = this.onEnde; this.onEnde = null;
    if (f) f();
  }

  weiter() { if (this.i < this.schritte.length - 1) { this.i++; this._zeige(); } else this.beenden(); }
  zurueck() { if (this.i > 0) { this.i--; this._zeige(); } }

  _zielRect() {
    const s = this.schritte[this.i];
    if (!s || !s.sel) return null;
    const ziel = document.querySelector(s.sel);
    if (!ziel) return null;
    const r = ziel.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) return null;
    return r;
  }

  _zeige() {
    const s = this.schritte[this.i];
    this.tip.innerHTML = '';
    const kopf = el('tut-tip-kopf'); kopf.textContent = s.titel || '';
    const text = el('tut-tip-text'); text.textContent = s.text || '';
    const nav = el('tut-tip-nav');
    const zaehler = el('tut-tip-zaehler', 'span'); zaehler.textContent = `${this.i + 1} / ${this.schritte.length}`;
    const ueberspringen = knopf('Überspringen', 'tut-btn-sek', () => this.beenden());
    const zurueck = knopf('Zurück', 'tut-btn-sek', () => this.zurueck()); zurueck.disabled = this.i === 0;
    const weiter = knopf(this.i === this.schritte.length - 1 ? 'Fertig ✓' : 'Weiter ▸', 'tut-btn-haupt', () => this.weiter());
    nav.append(zaehler, ueberspringen, zurueck, weiter);
    this.tip.append(kopf, text, nav);
    this._positioniere();
  }

  _positioniere() {
    const r = this._zielRect();
    const pad = 8;
    this._setzeFrames(r, pad);
    if (r) {
      this.ring.style.display = 'block';
      Object.assign(this.ring.style, {
        left: `${r.left - pad}px`, top: `${r.top - pad}px`,
        width: `${r.width + 2 * pad}px`, height: `${r.height + 2 * pad}px`,
      });
      this._tipBei(r);
    } else {
      this.ring.style.display = 'none';
      Object.assign(this.tip.style, { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' });
    }
  }

  // Vier abdunkelnde/verschwimmende Rahmen rund um das Ziel-Loch (oder ein
  // einzelner Vollbild-Rahmen, wenn es kein Ziel gibt).
  _setzeFrames(r, pad) {
    const W = window.innerWidth, H = window.innerHeight;
    const [oben, unten, links, rechts] = this.frames;
    if (!r) {
      Object.assign(oben.style, { left: '0', top: '0', width: `${W}px`, height: `${H}px` });
      for (const f of [unten, links, rechts]) Object.assign(f.style, { width: '0px', height: '0px' });
      return;
    }
    const x0 = Math.max(0, r.left - pad), y0 = Math.max(0, r.top - pad);
    const x1 = Math.min(W, r.right + pad), y1 = Math.min(H, r.bottom + pad);
    Object.assign(oben.style, { left: '0', top: '0', width: `${W}px`, height: `${y0}px` });
    Object.assign(unten.style, { left: '0', top: `${y1}px`, width: `${W}px`, height: `${H - y1}px` });
    Object.assign(links.style, { left: '0', top: `${y0}px`, width: `${x0}px`, height: `${y1 - y0}px` });
    Object.assign(rechts.style, { left: `${x1}px`, top: `${y0}px`, width: `${W - x1}px`, height: `${y1 - y0}px` });
  }

  _tipBei(r) {
    const tw = this.tip.offsetWidth || 320, th = this.tip.offsetHeight || 150;
    const W = window.innerWidth, H = window.innerHeight, m = 14;
    let top;
    if (r.bottom + th + m < H) top = r.bottom + m;          // unter dem Ziel
    else if (r.top - th - m > 0) top = r.top - th - m;       // über dem Ziel
    else top = Math.max(m, (H - th) / 2);                    // notfalls mittig
    let left = r.left + r.width / 2 - tw / 2;                 // horizontal am Ziel zentriert
    left = Math.max(m, Math.min(W - tw - m, left));
    Object.assign(this.tip.style, { left: `${left}px`, top: `${top}px`, transform: 'none' });
  }
}
