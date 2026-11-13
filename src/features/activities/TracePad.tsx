import { useCallback, useEffect, useRef, useState } from "react";
import { Btn } from "../../components/ui";
import { useI18n, textDir } from "../../i18n";
import { audio } from "../audio/audioService";
import { strayInk, traceCoverage } from "./coverage";

const SIZE = 300;
const INK = 20;
const NEEDED = 0.7; // share of the letter that must be inked (a thick brush used to make 50% too easy)

function fontFor(glyph: string) {
  return textDir(glyph) === "rtl" ? `700 220px "Noto Sans Arabic", sans-serif` : `800 250px Nunito, sans-serif`;
}

/**
 * Guided tracing on a canvas: a dotted letter to follow, finger/mouse drawing, and live coverage feedback.
 * `onDone(true)` when enough of the letter is inked; `onDone(false)` if the child skips (accessible alternative).
 */
const YARN = ["#F26B6B", "#F6B93B", "#17908A", "#A57BD0", "#4A8FD6"];

export function TracePad({ glyph, onDone }: { glyph: string; onDone: (traced: boolean) => void }) {
  const { t } = useI18n();
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<ImageData | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [coverage, setCoverage] = useState(0);
  const [finished, setFinished] = useState(false);
  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

  const drawGuide = useCallback(async () => {
    const g = guideRef.current;
    if (!g) return;
    try {
      await document.fonts.load(fontFor(glyph), glyph);
    } catch {
      /* fall back to whatever font is available */
    }
    const ctx = g.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.font = fontFor(glyph);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    // measure to centre vertically
    const m = ctx.measureText(glyph);
    const asc = m.actualBoundingBoxAscent || 150;
    const desc = m.actualBoundingBoxDescent || 40;
    const y = SIZE / 2 + (asc - desc) / 2;
    ctx.fillStyle = "rgba(23,144,138,.14)";
    ctx.fillText(glyph, SIZE / 2, y);
    ctx.setLineDash([2, 12]);
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(23,144,138,.75)";
    ctx.strokeText(glyph, SIZE / 2, y);

    // opaque mask of the glyph for scoring (same transform as the guide)
    const off = document.createElement("canvas");
    off.width = SIZE * dpr;
    off.height = SIZE * dpr;
    const o = off.getContext("2d")!;
    o.setTransform(dpr, 0, 0, dpr, 0, 0);
    o.font = ctx.font;
    o.textAlign = "center";
    o.fillStyle = "#000";
    o.fillText(glyph, SIZE / 2, y);
    maskRef.current = o.getImageData(0, 0, SIZE * dpr, SIZE * dpr);
  }, [glyph, dpr]);

  useEffect(() => {
    setCoverage(0);
    setFinished(false);
    inkRef.current?.getContext("2d")?.clearRect(0, 0, SIZE * dpr, SIZE * dpr);
    void drawGuide();
  }, [drawGuide, dpr]);

  const point = (e: React.PointerEvent) => {
    const r = inkRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  const yarnLen = useRef(0);
  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = inkRef.current!.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = INK;
    // the pen is a strand of yarn whose colour changes every few centimetres
    yarnLen.current += Math.hypot(b.x - a.x, b.y - a.y);
    ctx.strokeStyle = YARN[Math.floor(yarnLen.current / 70) % YARN.length];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.lineWidth = Math.max(2, INK * 0.22);
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.beginPath();
    ctx.moveTo(a.x - 1.5, a.y - 1.5);
    ctx.lineTo(b.x - 1.5, b.y - 1.5);
    ctx.stroke();
  };

  const measure = () => {
    const c = inkRef.current;
    const mask = maskRef.current;
    if (!c || !mask) return;
    const ink = c.getContext("2d")!.getImageData(0, 0, c.width, c.height);
    const cov = traceCoverage(mask.data, ink.data, c.width, c.height, 3);
    const stray = strayInk(mask.data, ink.data, c.width, c.height, 3);
    const score = stray > 0.65 ? cov * 0.5 : cov; // scribbling outside the letter doesn't count
    setCoverage(score);
    if (!finished && score >= NEEDED) {
      setFinished(true);
      void audio.effect("correct");
      window.setTimeout(() => onDone(true), 900);
    }
  };

  const clear = () => {
    inkRef.current?.getContext("2d")?.clearRect(0, 0, SIZE * dpr, SIZE * dpr);
    setCoverage(0);
    setFinished(false);
  };

  return (
    <div className="trace">
      <p className="trace__hint">{finished ? t("traceDone") : coverage > 0.1 ? t("traceKeepGoing") : t("traceNow")}</p>
      <div className="trace__board" style={{ width: SIZE, height: SIZE }}>
        <canvas ref={guideRef} width={SIZE * dpr} height={SIZE * dpr} aria-hidden="true" />
        <canvas
          ref={inkRef}
          width={SIZE * dpr}
          height={SIZE * dpr}
          role="img"
          aria-label={glyph}
          onPointerDown={(e) => {
            if (finished) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            const p = point(e);
            last.current = p;
            stroke(p, p);
          }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const p = point(e);
            stroke(last.current, p);
            last.current = p;
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
            measure();
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
      </div>
      <div className="trace__meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round((coverage / NEEDED) * 100))}>
        <i style={{ width: `${Math.min(100, (coverage / NEEDED) * 100)}%` }} />
      </div>
      <div className="row">
        <Btn variant="ghost" size="sm" onClick={clear}>{t("traceClear")}</Btn>
        <Btn variant="secondary" size="sm" onClick={() => onDone(false)}>{t("skipTrace")}</Btn>
      </div>
    </div>
  );
}
