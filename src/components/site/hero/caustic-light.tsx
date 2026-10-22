'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/*
 * Warm "caustic light" behind the homepage hero (ADR-35, after the dewlab template's water caustics).
 * Raw WebGL (no three.js): one full-screen triangle and a small fragment shader that draws amber and
 * steel-blue light ripples over obsidian. Renders at reduced resolution (the light is soft), only while
 * the canvas is on screen and the tab is visible, and never under prefers-reduced-motion. A CSS
 * radial-gradient fallback sits underneath, so the stage is never flat black if WebGL is missing.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_intensity;

const float TAU = 6.28318530718;

// Iterated-trig caustic pattern: thin bright filaments where the "waves" focus light.
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * TAU, TAU) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 uv = vec2(frag.x * aspect, frag.y);

  float t = u_time * 0.32;
  // Two layers at different scales and speeds, slightly warped, so the pattern never repeats visibly.
  vec2 warp = vec2(sin(uv.y * 2.1 + t * 0.7), cos(uv.x * 1.7 - t * 0.5)) * 0.05;
  float a = caustic(uv * 0.55 + warp + vec2(0.0, t * 0.02), t);
  float b = caustic(uv * 0.85 - warp + vec2(t * 0.015, 0.0), t * 0.8 + 3.0);

  vec3 obsidian = vec3(0.071, 0.075, 0.082);
  vec3 amber = vec3(0.93, 0.66, 0.39);
  vec3 steel = vec3(0.60, 0.69, 0.78);

  // Amber pools top-right (like a lamp), steel-blue settles bottom-left.
  float warmMask = smoothstep(1.25, 0.0, distance(frag, vec2(0.78, 0.82)));
  float coolMask = smoothstep(1.1, 0.0, distance(frag, vec2(0.12, 0.12)));

  vec3 col = obsidian;
  col += amber * warmMask * 0.22;                     // soft warm glow
  col += steel * coolMask * 0.10;                     // soft cool glow
  col += amber * a * warmMask * 0.55 * u_intensity;   // warm ripples
  col += steel * b * coolMask * 0.38 * u_intensity;   // cool ripples
  col += vec3(1.0, 0.93, 0.84) * a * b * 0.25 * u_intensity;

  // Vignette keeps the edges deep.
  float v = smoothstep(1.15, 0.35, distance(frag, vec2(0.5)));
  col *= mix(0.62, 1.0, v);

  gl_FragColor = vec4(col, 1.0);
}
`;

/** CSS fallback: the same warm/cool light, still. Also shown while the shader warms up. */
export const CAUSTIC_FALLBACK =
  'radial-gradient(ellipse 60% 55% at 80% 18%, rgba(237,168,100,0.30), transparent 70%), radial-gradient(ellipse 55% 50% at 10% 90%, rgba(153,176,199,0.20), transparent 70%), radial-gradient(ellipse 90% 80% at 50% 50%, #1c1e21, #121315)';

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function CausticLight({
  className,
  intensity = 1,
  /** Fraction of CSS pixels rendered (the light is soft, so half resolution looks the same). */
  resolution = 0.5,
}: {
  className?: string;
  intensity?: number;
  resolution?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let raf = 0;
    let visible = false;
    let started = 0;
    let elapsed = 0;
    let last = 0;

    // Create the context lazily, the first time the canvas is actually on screen.
    const init = (): boolean => {
      if (gl) return true;
      const ctx = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (!ctx) return false;
      const vs = compile(ctx, ctx.VERTEX_SHADER, VERT);
      const fs = compile(ctx, ctx.FRAGMENT_SHADER, FRAG);
      const prog = ctx.createProgram();
      if (!vs || !fs || !prog) return false;
      ctx.attachShader(prog, vs);
      ctx.attachShader(prog, fs);
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return false;
      ctx.useProgram(prog);
      const buf = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
      // One triangle that covers the whole viewport.
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
      const loc = ctx.getAttribLocation(prog, 'a_pos');
      ctx.enableVertexAttribArray(loc);
      ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
      uRes = ctx.getUniformLocation(prog, 'u_res');
      uTime = ctx.getUniformLocation(prog, 'u_time');
      ctx.uniform1f(ctx.getUniformLocation(prog, 'u_intensity'), intensity);
      gl = ctx;
      program = prog;
      resize();
      return true;
    };

    const resize = () => {
      if (!gl) return;
      const w = Math.max(1, Math.round(canvas.clientWidth * resolution));
      const h = Math.max(1, Math.round(canvas.clientHeight * resolution));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const frame = (now: number) => {
      if (!gl || !visible) return;
      if (!last) last = now;
      elapsed += Math.min(64, now - last) / 1000; // no jump after a pause
      last = now;
      gl.uniform1f(uTime, elapsed + 12);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!started) {
        started = now;
        canvas.style.opacity = '1';
      }
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (raf || !visible || document.hidden) return;
      if (!init()) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) play();
        else pause();
      },
      { rootMargin: '100px' },
    );
    io.observe(canvas);
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (gl && program) gl.deleteProgram(program);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [intensity, resolution]);

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0" style={{ background: CAUSTIC_FALLBACK }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-1000"
      />
    </div>
  );
}
