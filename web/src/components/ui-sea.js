import { LitElement, html, css } from "lit";

/**
 * Animated sea/sky background — port of BackgroundScene.vue to Lit.
 * Canvas-based animation with day/night cycle, waves, ship, and stars.
 *
 * @element ui-sea
 */
class UISea extends LitElement {
  static properties = {
    _blurAmount: { type: Number, state: true },
  };

  constructor() {
    super();
    this._blurAmount = 16;
    this._animId = null;
    this._time = 0;
    this._shipX = -120;
    this._speedIndex = 0;
    this._speeds = [0.4, 0.8, 1.6, 3.2, 6.0];
    this._waves = [];
    this._stars = Array.from({ length: 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5,
      blink: Math.random(),
    }));
  }

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._initWaves();
    this.updateComplete.then(() => {
      this._animId = requestAnimationFrame(() => this._animate());
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._animId) cancelAnimationFrame(this._animId);
  }

  _initWaves() {
    const numWaves = 6;
    this._waves = [];
    for (let i = 0; i < numWaves; i++) {
      this._waves.push({
        amplitude: 12 / (i + 1),
        frequency: 0.005 + i * 0.002,
        speed: 0.004 + i * 0.004,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  _getSkyColors() {
    // Night mode only (dark theme default)
    return { top: "#02050a", mid: "#050a14", horizon: "#0a1a35" };
  }

  _animate() {
    const canvas = this.renderRoot?.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    this._draw(ctx, w, h);
    this._animId = requestAnimationFrame(() => this._animate());
  }

  _draw(ctx, w, h) {
    this._time += 1;
    const horizonY = h * 0.42;
    const sky = this._getSkyColors();

    // ─── SKY ───
    ctx.fillStyle = sky.top;
    ctx.fillRect(0, 0, w, h);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, sky.top);
    skyGrad.addColorStop(0.6, sky.mid);
    skyGrad.addColorStop(1, sky.horizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // ─── Stars ───
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    this._stars.forEach((star) => {
      ctx.globalAlpha = Math.max(
        0,
        0.3 + Math.sin(this._time * 0.04 + star.blink * 10) * 0.5,
      );
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * horizonY * 0.9, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ─── Moon ───
    const angle = (0.5 - 0.25) * Math.PI * 2;
    const cx = w / 2 + Math.cos(angle) * (w * 0.45);
    const cy = horizonY - Math.sin(angle) * (horizonY * 0.85);

    if (cy < horizonY + 80) {
      const bodyR = 30;
      ctx.save();
      const moonGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR * 2);
      moonGlow.addColorStop(0, "rgba(200, 220, 255, 0.3)");
      moonGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e0e0e0";
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = sky.top;
      ctx.beginPath();
      ctx.arc(cx + bodyR * 0.5, cy - bodyR * 0.2, bodyR * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ─── SEA ───
    const seaBase = "#000206";
    const seaDark = "#000000";
    const seaGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    seaGrad.addColorStop(0, seaBase);
    seaGrad.addColorStop(1, seaDark);
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // ─── Waves ───
    const numWaves = this._waves.length;
    this._waves.forEach((wave, idx) => {
      wave.phase += wave.speed;
      const power = (idx + 1) / numWaves;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= w; x += 15) {
        const y =
          horizonY +
          idx * 25 +
          Math.sin(x * wave.frequency + wave.phase) * wave.amplitude * power;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const alpha = (0.02 + power * 0.08) * 0.25;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });

    // ─── Ship ───
    const currentSpeed = this._speeds[this._speedIndex];
    this._shipX += currentSpeed;
    if (this._shipX > w + 200) this._shipX = -150;

    const speedFactor = 1 - this._speedIndex / (this._speeds.length - 1);
    const shipRock = Math.sin(this._time * 0.04) * (1 + speedFactor * 12);
    const shipY = horizonY + 30 + Math.sin(this._time * 0.05) * 3;
    const shipAlpha = 0.3;

    ctx.save();
    ctx.translate(this._shipX + 30, shipY + 30);
    ctx.rotate((shipRock * Math.PI) / 180);
    ctx.translate(-30, -30);

    ctx.fillStyle = `rgba(255, 255, 255, ${shipAlpha})`;
    ctx.beginPath();
    ctx.moveTo(5, 40);
    ctx.lineTo(55, 40);
    ctx.lineTo(45, 55);
    ctx.lineTo(15, 55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${shipAlpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(30, 5);
    ctx.lineTo(30, 40);
    ctx.lineTo(10, 35);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(32, 8);
    ctx.lineTo(32, 40);
    ctx.lineTo(50, 35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  render() {
    return html`<canvas
      style="filter: blur(${this
        ._blurAmount}px); transition: filter 0.5s ease-out"
    ></canvas>`;
  }
}

customElements.define("ui-sea", UISea);
export default UISea;
