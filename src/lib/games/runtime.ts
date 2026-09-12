export type Pointer = { x: number; y: number; down: boolean };

export function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function startLoop(tick: (dt: number) => void): () => void {
  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(dt);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

export function bindCanvas(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  const ptr: Pointer = { x: 0, y: 0, down: false };
  let cssW = 0;
  let cssH = 0;

  const resize = () => {
    const r = parent?.getBoundingClientRect();
    cssW = Math.max(280, Math.floor(r?.width ?? 800));
    cssH = Math.max(280, Math.floor(r?.height ?? 480));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const loc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
  };

  const onDown = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId);
    loc(e);
    ptr.down = true;
  };
  const onMove = (e: PointerEvent) => loc(e);
  const onUp = (e: PointerEvent) => {
    loc(e);
    ptr.down = false;
  };

  resize();
  ptr.x = cssW / 2;
  ptr.y = cssH / 2;
  const ro = new ResizeObserver(resize);
  if (parent) ro.observe(parent);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.style.touchAction = "none";

  return {
    ptr,
    size: () => ({ w: cssW, h: cssH }),
    ctx: () => canvas.getContext("2d"),
    destroy: () => {
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    },
  };
}

export type Hud = {
  level: number;
  total: number;
  score: number;
  shots?: number;
  status: string;
  coach: string;
};

export type GameHandle = {
  destroy: () => void;
  restart: () => void;
};

export type GameHooks = {
  onHud: (h: Hud) => void;
  onClear: (score: number) => void;
};
