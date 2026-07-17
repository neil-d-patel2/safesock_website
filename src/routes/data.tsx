import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/data")({
  component: DataPage,
});

// Brand accent + the signature hairline used by the /approach figures.
const ACCENT = "#1E52F3";
const HAIRLINE = {
  background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
};

/* Shared micro-typography for card headers (mirrors the /approach figure grammar) */
const CARD_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";

// ── Sensor model ──────────────────────────────────────────────────────────────
// Each sensor has a normalized position (nx, ny) in [0,1] over the foot's
// bounding box, a relative pressure `value` in [0,1], and an anatomical zone.
type Zone = "toe" | "ball" | "arch" | "heel";
type Sensor = {
  id: string;
  name: string;
  nx: number;
  ny: number;
  value: number;
  z: Zone;
};

const SENSORS: Sensor[] = [
  { id: "T1", name: "Big toe", nx: 0.3, ny: 0.105, value: 0.55, z: "toe" },
  { id: "T23", name: "Toes 2-3", nx: 0.46, ny: 0.085, value: 0.35, z: "toe" },
  { id: "T45", name: "Toes 4-5", nx: 0.675, ny: 0.12, value: 0.2, z: "toe" },
  {
    id: "M1",
    name: "1st met. head",
    nx: 0.225,
    ny: 0.3,
    value: 0.75,
    z: "ball",
  },
  {
    id: "M3",
    name: "3rd met. head",
    nx: 0.47,
    ny: 0.27,
    value: 0.65,
    z: "ball",
  },
  {
    id: "M5",
    name: "5th met. head",
    nx: 0.715,
    ny: 0.305,
    value: 0.45,
    z: "ball",
  },
  { id: "MA", name: "Med. arch", nx: 0.345, ny: 0.49, value: 0.08, z: "arch" },
  {
    id: "LA",
    name: "Lat. midfoot",
    nx: 0.63,
    ny: 0.49,
    value: 0.22,
    z: "arch",
  },
  { id: "MH", name: "Med. heel", nx: 0.39, ny: 0.75, value: 0.8, z: "heel" },
  { id: "LH", name: "Lat. heel", nx: 0.56, ny: 0.75, value: 0.72, z: "heel" },
  {
    id: "HC",
    name: "Heel center",
    nx: 0.47,
    ny: 0.875,
    value: 0.92,
    z: "heel",
  },
];

// ── Hard-coded weekly history ─────────────────────────────────────────────────
// The current week is 8. Each row is the per-sensor pressure field for that week
// (same order as SENSORS), capturing recovery from guarded, heel-only loading at
// week 0 to a fuller, more even distribution at the current week. WEEK_LOADS is
// the overall weight-bearing load (% of body weight) for the same weeks.
const CURRENT_WEEK = 8;
const WEEK_LOADS = [10, 16, 23, 31, 43, 54, 63, 71, 78]; // % body weight, week 0..8
const WEEK_SENSORS: number[][] = [
  [0.02, 0.01, 0.01, 0.05, 0.04, 0.03, 0.01, 0.02, 0.17, 0.15, 0.2], // week 0
  [0.04, 0.02, 0.01, 0.1, 0.08, 0.06, 0.01, 0.03, 0.24, 0.22, 0.28], // week 1
  [0.07, 0.04, 0.03, 0.15, 0.13, 0.09, 0.02, 0.05, 0.32, 0.29, 0.37], // week 2
  [0.11, 0.07, 0.04, 0.23, 0.2, 0.14, 0.03, 0.07, 0.4, 0.36, 0.46], // week 3
  [0.2, 0.13, 0.07, 0.35, 0.3, 0.21, 0.04, 0.1, 0.51, 0.46, 0.59], // week 4
  [0.29, 0.19, 0.11, 0.46, 0.4, 0.28, 0.05, 0.14, 0.61, 0.55, 0.7], // week 5
  [0.38, 0.24, 0.14, 0.57, 0.49, 0.34, 0.06, 0.17, 0.68, 0.61, 0.78], // week 6
  [0.47, 0.3, 0.17, 0.66, 0.58, 0.4, 0.07, 0.2, 0.75, 0.67, 0.86], // week 7
  [0.55, 0.35, 0.2, 0.75, 0.65, 0.45, 0.08, 0.22, 0.8, 0.72, 0.92], // week 8 · current
];

// Toe pads: [centerX, centerY, radiusX, radiusY, rotation] (normalized).
const TOES: [number, number, number, number, number][] = [
  [0.3, 0.105, 0.085, 0.078, -0.18],
  [0.46, 0.085, 0.058, 0.072, 0.0],
  [0.575, 0.095, 0.054, 0.067, 0.05],
  [0.675, 0.12, 0.048, 0.058, 0.15],
  [0.75, 0.14, 0.043, 0.049, 0.32],
];

// ── Canvas geometry ───────────────────────────────────────────────────────────
const CW = 210;
const CH = 384;
const PAD = 16;
const BX = PAD;
const BY = PAD;
const BW = CW - 2 * PAD;
const BH = CH - 2 * PAD;
const X = (nx: number) => BX + nx * BW; // normalized -> canvas pixels
const Y = (ny: number) => BY + ny * BH;

// ── Colormap ──────────────────────────────────────────────────────────────────
// pressure -> color via an HSL hue sweep: 240 (blue, low) -> 0 (red, high).
function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [(f(0) * 255) | 0, (f(8) * 255) | 0, (f(4) * 255) | 0];
}
function v2rgb(v: number): [number, number, number] {
  return hsl2rgb((1 - Math.max(0, Math.min(1, v))) * 240, 88, 52);
}
function v2css(v: number): string {
  const [r, g, b] = v2rgb(v);
  return `rgb(${r},${g},${b})`;
}

// Vertical legend gradient sampled from the same colormap (high at top).
const LEGEND_GRADIENT = `linear-gradient(to top, ${Array.from(
  { length: 11 },
  (_, i) => `${v2css(i / 10)} ${i * 10}%`,
).join(", ")})`;

// ── Foot outline as a compound clip region ────────────────────────────────────
// The sole is one bezier subpath; each toe is its own ellipse subpath.
// Path2D.addPath() unions them, so a single ctx.clip(region) masks the heatmap
// to the whole foot at once. The asymmetry is what makes it read as a foot: the
// medial (big-toe) edge bulges at the ball, then pinches in at the arch; the
// lateral edge stays smoothly convex.
function buildRegion(): Path2D {
  const sole = new Path2D();
  sole.moveTo(X(0.2), Y(0.21));
  sole.bezierCurveTo(X(0.155), Y(0.245), X(0.115), Y(0.27), X(0.125), Y(0.305)); // medial ball
  sole.bezierCurveTo(X(0.135), Y(0.36), X(0.225), Y(0.4), X(0.275), Y(0.495)); // arch cut-in
  sole.bezierCurveTo(X(0.3), Y(0.57), X(0.275), Y(0.64), X(0.285), Y(0.715)); // medial heel
  sole.bezierCurveTo(X(0.29), Y(0.8), X(0.3), Y(0.875), X(0.345), Y(0.915));
  sole.bezierCurveTo(X(0.385), Y(0.955), X(0.43), Y(0.97), X(0.475), Y(0.965)); // heel round
  sole.bezierCurveTo(X(0.555), Y(0.96), X(0.63), Y(0.875), X(0.66), Y(0.715));
  sole.bezierCurveTo(X(0.675), Y(0.64), X(0.705), Y(0.57), X(0.71), Y(0.495)); // lateral midfoot
  sole.bezierCurveTo(X(0.715), Y(0.41), X(0.8), Y(0.37), X(0.835), Y(0.305)); // lateral ball
  sole.bezierCurveTo(X(0.855), Y(0.26), X(0.83), Y(0.225), X(0.79), Y(0.205)); // lateral forefoot
  sole.bezierCurveTo(X(0.73), Y(0.182), X(0.66), Y(0.175), X(0.58), Y(0.175)); // forefoot top (gap below toes)
  sole.bezierCurveTo(X(0.5), Y(0.175), X(0.42), Y(0.182), X(0.35), Y(0.195));
  sole.bezierCurveTo(X(0.3), Y(0.2), X(0.24), Y(0.205), X(0.2), Y(0.21));
  sole.closePath();

  const region = new Path2D();
  region.addPath(sole);
  for (const [cxn, cyn, rxn, ryn, rot] of TOES) {
    const tp = new Path2D();
    tp.ellipse(X(cxn), Y(cyn), rxn * BW, ryn * BH, rot, 0, Math.PI * 2);
    region.addPath(tp);
  }
  return region;
}

function FootHeatmap({ values }: { values: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    ctx.scale(dpr, dpr);

    const region = buildRegion();

    // Compute the pressure field at low resolution, then let drawImage()
    // upscale it with bilinear smoothing — same smooth look, a fraction of the
    // per-pixel work.
    const low = document.createElement("canvas");
    low.width = 64;
    low.height = 120;
    const lowctx = low.getContext("2d")!;
    const img = lowctx.createImageData(low.width, low.height);
    const sigma = 0.2; // kernel width: how far each sensor's influence spreads

    for (let r = 0; r < low.height; r++) {
      for (let c = 0; c < low.width; c++) {
        const nx = c / low.width;
        const ny = r / low.height;
        let wsum = 0;
        let vsum = 0;
        // Radial basis (Gaussian) interpolation of the scattered sensors.
        SENSORS.forEach((s, k) => {
          const dx = nx - s.nx;
          const dy = ny - s.ny;
          const w = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
          wsum += w;
          vsum += w * values[k];
        });
        const v = wsum ? vsum / wsum : 0;
        const [rr, gg, bb] = v2rgb(v);
        const i = (r * low.width + c) * 4;
        img.data[i] = rr;
        img.data[i + 1] = gg;
        img.data[i + 2] = bb;
        img.data[i + 3] = 255;
      }
    }
    lowctx.putImageData(img, 0, 0);

    ctx.clearRect(0, 0, CW, CH);

    // Clip to the foot, then upscale the field into it.
    ctx.save();
    ctx.clip(region);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(low, BX, BY, BW, BH);
    ctx.restore();

    // Outline every subpath (sole + all toe pads).
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(23,31,84,.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke(region);

    // Zone labels, double-drawn for legibility on any underlying color.
    const zones: [string, number, number][] = [
      ["TOES", 0.5, 0.1],
      ["BALL", 0.49, 0.29],
      ["ARCH", 0.5, 0.5],
      ["HEEL", 0.47, 0.8],
    ];
    ctx.font = 'bold 9px "Readex Pro", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [t, nx, ny] of zones) {
      ctx.fillStyle = "rgba(0,0,0,.42)";
      ctx.fillText(t, X(nx) + 0.5, Y(ny) + 0.5);
      ctx.fillStyle = "rgba(255,255,255,.34)";
      ctx.fillText(t, X(nx), Y(ny));
    }

    // Static sensor markers.
    for (const s of SENSORS) {
      const sx = X(s.nx);
      const sy = Y(s.ny);
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,.4)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.fill();
    }
  }, [values]);

  return (
    <canvas
      ref={canvasRef}
      style={{ aspectRatio: `${CW} / ${CH}` }}
      className="h-auto w-full"
      aria-label="Plantar pressure heatmap of the right foot"
    />
  );
}

function PressureLegend() {
  return (
    <div className="flex items-stretch gap-3 self-stretch">
      <div
        className="w-4 self-stretch rounded-full shadow-inner ring-1 ring-black/5"
        style={{ background: LEGEND_GRADIENT }}
      />
      <div className="flex flex-col justify-between py-0.5 text-xs text-black">
        <span className="leading-none">High</span>
        <span className="leading-none [writing-mode:vertical-rl] rotate-180 self-center text-[10px] uppercase tracking-wider text-neutral-500">
          relative pressure
        </span>
        <span className="leading-none">Low</span>
      </div>
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────
function TrendUpIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 1.5 8.5 6H1.5L5 1.5Z" fill="currentColor" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  unit,
  sub,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  trend?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className="font-['Readex_Pro'] text-4xl font-medium tabular-nums md:text-5xl"
          style={{ color: accent ? ACCENT : "#000" }}
        >
          {value}
        </span>
        {unit && <span className="text-base text-neutral-400">{unit}</span>}
      </div>
      {sub && (
        <div className="mt-1 font-['Source_Serif_4'] text-xs text-neutral-500">
          {sub}
        </div>
      )}
      {trend && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <TrendUpIcon />
          {trend}
        </div>
      )}
    </div>
  );
}

// ── Weight-bearing progression chart (actual + projected) ─────────────────────
// Hand-built SVG line+area with a forecast confidence band. Actual load is a
// solid line; the projection is dashed with a shaded uncertainty band, so the
// two are distinguishable by line style — not color alone.
const CW2 = 480;
const CH2 = 240;
const PL = 38;
const PR = 14;
const PT = 16;
const PB = 30;
const IW = CW2 - PL - PR;
const IH = CH2 - PT - PB;
const MAXW = 12; // weeks shown
const cx2 = (w: number) => PL + (w / MAXW) * IW;
const cy2 = (v: number) => PT + (1 - v / 100) * IH;
const BASE_Y = cy2(0);

// Weekly load as % of body weight. band = [upper, lower] uncertainty for the
// projected portion.
type Pt = { w: number; v: number; band?: [number, number] };
const SERIES: Pt[] = [
  { w: 0, v: 10 },
  { w: 1, v: 16 },
  { w: 2, v: 23 },
  { w: 3, v: 31 },
  { w: 4, v: 43 },
  { w: 5, v: 54 },
  { w: 6, v: 63 },
  { w: 7, v: 71 },
  { w: 8, v: 78 }, // current week
  { w: 9, v: 84, band: [88, 80] },
  { w: 10, v: 89, band: [95, 82] },
  { w: 11, v: 93, band: [100, 84] },
  { w: 12, v: 96, band: [100, 85] },
];
const CURRENT = 8;
const Y_TICKS = [0, 25, 50, 75, 100];
const X_TICKS = [0, 2, 4, 6, 8, 10, 12];

function ProgressionChart({ markWeek }: { markWeek: number }) {
  const [hoverW, setHoverW] = useState<number | null>(null);

  const actual = SERIES.filter((p) => p.w <= CURRENT);
  const proj = SERIES.filter((p) => p.w >= CURRENT);

  const line = (pts: Pt[]) =>
    pts.map((p, i) => `${i ? "L" : "M"} ${cx2(p.w)} ${cy2(p.v)}`).join(" ");

  const areaPath =
    `M ${cx2(0)} ${BASE_Y} ` +
    actual.map((p) => `L ${cx2(p.w)} ${cy2(p.v)}`).join(" ") +
    ` L ${cx2(CURRENT)} ${BASE_Y} Z`;

  const bandPath =
    proj
      .map(
        (p, i) =>
          `${i ? "L" : "M"} ${cx2(p.w)} ${cy2(p.band ? p.band[0] : p.v)}`,
      )
      .join(" ") +
    " " +
    [...proj]
      .reverse()
      .map((p) => `L ${cx2(p.w)} ${cy2(p.band ? p.band[1] : p.v)}`)
      .join(" ") +
    " Z";

  const hovered = hoverW != null ? SERIES[hoverW] : null;
  const hoveredProj = hoverW != null && hoverW > CURRENT;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CW2;
    const w = Math.max(0, Math.min(MAXW, Math.round(((x - PL) / IW) * MAXW)));
    setHoverW(w);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CW2} ${CH2}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label="Weight-bearing load as a percentage of body weight, rising from 10% at week 0 to 78% at the current week 8, with a projection reaching about 96% by week 12."
        onPointerMove={onMove}
        onPointerLeave={() => setHoverW(null)}
      >
        <defs>
          <linearGradient id="loadArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E52F3" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1E52F3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines + y labels */}
        {Y_TICKS.map((v) => (
          <g key={v}>
            <line
              x1={PL}
              x2={CW2 - PR}
              y1={cy2(v)}
              y2={cy2(v)}
              stroke="#e7e5e0"
              strokeWidth={1}
            />
            <text
              x={PL - 8}
              y={cy2(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#737373"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Goal line: full weight-bearing */}
        <line
          x1={PL}
          x2={CW2 - PR}
          y1={cy2(100)}
          y2={cy2(100)}
          stroke="#cfcabf"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        <text
          x={CW2 - PR}
          y={cy2(100) - 5}
          textAnchor="end"
          fontSize="9"
          fill="#737373"
        >
          Goal · full weight-bearing
        </text>

        {/* x labels */}
        {X_TICKS.map((w) => (
          <text
            key={w}
            x={cx2(w)}
            y={CH2 - 14}
            textAnchor="middle"
            fontSize="10"
            fill="#737373"
          >
            {w}
          </text>
        ))}
        <text
          x={PL + IW / 2}
          y={CH2 - 2}
          textAnchor="middle"
          fontSize="9.5"
          fill="#737373"
        >
          weeks since surgery
        </text>

        {/* Forecast confidence band */}
        <path d={bandPath} fill="#1E52F3" fillOpacity="0.1" />

        {/* Actual area + line */}
        <path d={areaPath} fill="url(#loadArea)" />
        <path
          d={line(actual)}
          fill="none"
          stroke="#1E52F3"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Projected dashed line */}
        <path
          d={line(proj)}
          fill="none"
          stroke="#9AB1FA"
          strokeWidth={2.5}
          strokeDasharray="5 5"
          strokeLinecap="round"
        />

        {/* "Now" marker at the current week */}
        <line
          x1={cx2(CURRENT)}
          x2={cx2(CURRENT)}
          y1={cy2(SERIES[CURRENT].v)}
          y2={BASE_Y}
          stroke="#1E52F3"
          strokeWidth={1}
          strokeDasharray="3 3"
          strokeOpacity="0.4"
        />

        {/* Hover crosshair */}
        {hovered && (
          <line
            x1={cx2(hovered.w)}
            x2={cx2(hovered.w)}
            y1={PT}
            y2={BASE_Y}
            stroke="#1E52F3"
            strokeWidth={1}
            strokeOpacity="0.25"
          />
        )}

        {/* Selected-week marker (when viewing a prior week) */}
        {markWeek < CURRENT && (
          <>
            <line
              x1={cx2(markWeek)}
              x2={cx2(markWeek)}
              y1={cy2(SERIES[markWeek].v)}
              y2={BASE_Y}
              stroke="#1E52F3"
              strokeWidth={1}
              strokeOpacity="0.3"
            />
            <circle
              cx={cx2(markWeek)}
              cy={cy2(SERIES[markWeek].v)}
              r={6}
              fill="none"
              stroke="#1E52F3"
              strokeWidth={2}
            />
            <circle
              cx={cx2(markWeek)}
              cy={cy2(SERIES[markWeek].v)}
              r={3}
              fill="#1E52F3"
            />
          </>
        )}

        {/* Current point */}
        <circle
          cx={cx2(CURRENT)}
          cy={cy2(SERIES[CURRENT].v)}
          r={5}
          fill="#1E52F3"
          stroke="#fff"
          strokeWidth={2}
        />
        <text
          x={cx2(CURRENT)}
          y={cy2(SERIES[CURRENT].v) - 11}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fill="#1E52F3"
          letterSpacing="0.08em"
        >
          NOW
        </text>

        {/* Hovered point */}
        {hovered && hovered.w !== CURRENT && (
          <circle
            cx={cx2(hovered.w)}
            cy={cy2(hovered.v)}
            r={4}
            fill={hoveredProj ? "#9AB1FA" : "#1E52F3"}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-neutral-900 px-2.5 py-1.5 text-center shadow-lg"
          style={{
            left: `${(cx2(hovered.w) / CW2) * 100}%`,
            top: `${(cy2(hovered.v) / CH2) * 100}%`,
            marginTop: "-8px",
          }}
        >
          <div className="font-['Readex_Pro'] text-sm font-medium tabular-nums text-white">
            {hovered.v}% <span className="text-white/60">BW</span>
          </div>
          <div className="text-[10px] text-white/60">
            Week {hovered.w}
            {hoveredProj ? " · projected" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

function WeekSelect({
  week,
  onChange,
}: {
  week: number;
  onChange: (w: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-500">
      <span className="hidden sm:inline">Viewing</span>
      <span className="relative">
        <select
          value={week}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Select week to view"
          className="cursor-pointer appearance-none rounded-full border border-neutral-300 bg-white py-2 pl-4 pr-9 font-['Readex_Pro'] text-sm font-medium text-black shadow-sm transition hover:border-neutral-400 focus:border-[#1E52F3] focus:outline-none focus:ring-2 focus:ring-[#1E52F3]/30"
        >
          {WEEK_LOADS.map((_, w) => (
            <option key={w} value={w}>
              Week {w}
              {w === 0 ? " · surgery" : w === CURRENT_WEEK ? " · current" : ""}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}

// ── Surgeon notes (hard-coded, one per week) ──────────────────────────────────
const NOTE_STATUS = {
  milestone: {
    label: "Milestone",
    cls: "bg-[#1E52F3]/10 text-[#1E52F3]",
    accent: "#1E52F3",
  },
  good: {
    label: "On track",
    cls: "bg-emerald-50 text-emerald-700",
    accent: "#10b981",
  },
  caution: {
    label: "Watch",
    cls: "bg-amber-50 text-amber-700",
    accent: "#f59e0b",
  },
  routine: {
    label: "Routine",
    cls: "bg-neutral-100 text-neutral-600",
    accent: "#a3a29c",
  },
} as const;
type NoteStatus = keyof typeof NOTE_STATUS;
type Note = {
  week: number;
  date: string;
  author: string;
  role: string;
  status: NoteStatus;
  text: string;
};

const NOTES: Note[] = [
  {
    week: 0,
    date: "May 2",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "milestone",
    text: "ORIF of the right lateral malleolus completed without complication; syndesmotic screw placed. Patient is strictly non-weight-bearing in a posterior splint. Elevate and ice aggressively for the first 72 hours. Follow-up at two weeks for wound check and transition to a CAM boot.",
  },
  {
    week: 1,
    date: "May 9",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "routine",
    text: "Reviewed via telehealth. Pain well controlled, weaning from opioids to NSAIDs. Toes warm and well-perfused with minimal swelling. Continue strict non-weight-bearing and keep the splint dry.",
  },
  {
    week: 2,
    date: "May 16",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "milestone",
    text: "Incisions healing well — sutures removed, no signs of infection. Transitioned to a CAM walker boot. Begin protected heel-touch weight-bearing (~10% body weight) with crutches and gentle ankle range-of-motion out of the boot three times daily.",
  },
  {
    week: 3,
    date: "May 23",
    author: "Marcus Lee, PT",
    role: "Physical therapist",
    status: "good",
    text: "Heel-touch loading tolerated without pain and swelling continues to settle. Sensor data confirms the patient is staying within the prescribed load range. Advancing toward 25–30% body weight as comfort allows, with seated calf isometrics added.",
  },
  {
    week: 4,
    date: "May 30",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "caution",
    text: "Progressing, but a transient spike in lateral forefoot pressure was noted mid-week, likely from over-offloading the heel. Counseled the patient on even loading through the boot. No new pain. Maintain current progression and recheck distribution next week; continue edema control.",
  },
  {
    week: 5,
    date: "Jun 6",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "good",
    text: "Loading distribution is more symmetric and the patient comfortably bears roughly half body weight. Syndesmotic screw removal planned for week 7. Stationary cycling started for conditioning; physical therapy twice weekly.",
  },
  {
    week: 6,
    date: "Jun 13",
    author: "Marcus Lee, PT",
    role: "Physical therapist",
    status: "routine",
    text: "Steady progress. Radiographs show maintained reduction and early bridging callus. Weaning crutches as balance allows and beginning short out-of-boot periods on level ground at home only. Strengthening program advanced.",
  },
  {
    week: 7,
    date: "Jun 20",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "milestone",
    text: "Syndesmotic screw removed in clinic today — straightforward procedure. Patient is bearing ~70% body weight with good control and minimal swelling. Begin transitioning from the boot to a supportive shoe over the coming week, with proprioception and balance work added. Anticipate near-full weight-bearing within one to two weeks.",
  },
  {
    week: 8,
    date: "Jun 27",
    author: "Dr. Elena Alvarez",
    role: "Orthopedic surgeon",
    status: "good",
    text: "Excellent trajectory. Bearing ~78% body weight with distribution approaching normal and restored forefoot loading. Cleared to transition fully out of the boot into a stiff-soled shoe. Continue progressive strengthening and gait retraining while avoiding impact activities. Projected to reach full weight-bearing by week 11–12. Next review in two weeks.",
  },
];

function SurgeonNotes({ week }: { week: number }) {
  const refs = useRef<Record<number, HTMLLIElement | null>>({});
  // Additional weeks the user has pinned on; the active `week` is always shown.
  const [extra, setExtra] = useState<Set<number>>(new Set());

  const isVisible = (w: number) => w === week || extra.has(w);
  const toggle = (w: number) =>
    setExtra((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });

  // Scroll the active week's note into view when it changes.
  useEffect(() => {
    refs.current[week]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [week]);

  const visible = [...NOTES].filter((n) => isVisible(n.week)).reverse();

  return (
    <section className="relative flex flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 xl:w-[340px] xl:shrink-0">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={HAIRLINE}
      />
      <div className="mb-2 flex items-center justify-between">
        <h2 className={CARD_LABEL}>Surgeon Notes</h2>
        <span className="text-[11px] tabular-nums text-neutral-500">
          {visible.length} shown
        </span>
      </div>

      {/* Week toggles — active week is locked on; pin others to compare. */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {WEEK_LOADS.map((_, w) => {
          const active = isVisible(w);
          const locked = w === week;
          return (
            <button
              key={w}
              type="button"
              onClick={() => !locked && toggle(w)}
              aria-pressed={active}
              aria-label={`${active ? "Hide" : "Show"} week ${w} note`}
              className={`h-7 w-7 rounded-full text-xs font-medium tabular-nums transition ${
                locked
                  ? "cursor-default bg-[#1E52F3] text-white ring-2 ring-[#1E52F3]/30 ring-offset-1"
                  : active
                    ? "bg-[#1E52F3]/10 text-black hover:bg-[#1E52F3]/15"
                    : "border border-neutral-200 text-black hover:border-neutral-300 hover:text-black"
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>

      <ol className="-mr-3 min-h-0 max-h-[32rem] flex-1 space-y-3 overflow-y-auto pr-3 [scrollbar-width:thin] xl:max-h-[30rem]">
        {visible.map((n) => {
          const status = NOTE_STATUS[n.status];
          const selected = n.week === week;
          return (
            <li
              key={n.week}
              ref={(el) => {
                refs.current[n.week] = el;
              }}
              style={{ borderLeftColor: status.accent }}
              className={`scroll-mt-2 rounded-2xl border border-l-4 p-4 transition ${
                selected
                  ? "border-neutral-200 bg-[#1E52F3]/[0.04] ring-1 ring-[#1E52F3]/25"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-0.5 font-['Readex_Pro'] text-[11px] font-medium text-white">
                  Week {n.week}
                  {n.week === CURRENT_WEEK && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${status.cls}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-black">
                    {n.author}
                  </div>
                  <div className="truncate text-[11px] text-neutral-500">
                    {n.role}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-neutral-500">
                  {n.date}
                </span>
              </div>

              <p className="mt-2.5 font-['Source_Serif_4'] text-[13px] leading-relaxed text-black">
                {n.text}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DataPage() {
  const [week, setWeek] = useState(CURRENT_WEEK);

  const isCurrent = week === CURRENT_WEEK;
  const currentLoad = WEEK_LOADS[week];
  const prevDelta = week > 0 ? currentLoad - WEEK_LOADS[week - 1] : null;
  const sinceStart = currentLoad - WEEK_LOADS[0];

  // Trailing average over the selected week and up to three weeks before it.
  const winStart = Math.max(0, week - 3);
  const winLen = week - winStart + 1;
  const avgLoad = Math.round(
    WEEK_LOADS.slice(winStart, week + 1).reduce((a, b) => a + b, 0) / winLen,
  );

  // Derived readouts for the selected week's pressure field.
  const field = WEEK_SENSORS[week];
  const fieldTotal = field.reduce((a, b) => a + b, 0);
  const zoneShare = (zones: Zone[]) =>
    Math.round(
      (SENSORS.reduce(
        (a, s, i) => (zones.includes(s.z) ? a + field[i] : a),
        0,
      ) /
        fieldTotal) *
        100,
    );
  const foreShare = zoneShare(["toe", "ball"]);
  const heelShare = zoneShare(["heel"]);
  const peakIdx = field.reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);

  return (
    <div className="relative min-h-screen w-full bg-[#fafaf8]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-32 md:pt-36">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: ACCENT }}
            >
              Patient Dashboard
            </p>
            <h1 className="mt-2 font-['Readex_Pro'] text-3xl font-medium tracking-tight text-black md:text-4xl">
              Recovery Overview
            </h1>
            <p className="mt-2 max-w-lg font-['Source_Serif_4'] text-sm text-neutral-500">
              Plantar pressure and weight-bearing progression for the right
              foot, measured continuously by SafeSock's in-sole sensor array.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {[
                "Right ankle · ORIF",
                `Post-op week ${CURRENT_WEEK}`,
                "Dr. Elena Alvarez · Orthopedics",
              ].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium text-neutral-600"
                >
                  {chip}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium text-neutral-600">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                Live monitoring
              </span>
            </div>
          </div>
          <WeekSelect week={week} onChange={setWeek} />
        </header>

        {/* signature accent hairline, carried over from the /approach figures */}
        <div aria-hidden className="mb-8 h-px w-full" style={HAIRLINE} />

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr] xl:min-w-0 xl:flex-1">
            {/* Plantar pressure heatmap */}
            <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px"
                style={HAIRLINE}
              />
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className={CARD_LABEL}>Plantar Pressure</h2>
                <span className="flex items-center gap-1.5 text-[11px] font-medium tabular-nums text-neutral-500">
                  {isCurrent && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                  Week {week}
                  {isCurrent ? " · live" : ""}
                </span>
              </div>
              <div className="flex items-stretch justify-center gap-5">
                <div className="w-[180px] max-w-[52vw]">
                  <FootHeatmap values={WEEK_SENSORS[week]} />
                </div>
                <PressureLegend />
              </div>

              {/* Derived readout for the selected week */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Forefoot
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium tabular-nums text-black">
                    {foreShare}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Peak
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-black">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: v2css(field[peakIdx]) }}
                    />
                    {SENSORS[peakIdx].name}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Heel
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium tabular-nums text-black">
                    {heelShare}%
                  </div>
                </div>
              </div>
            </section>

            {/* Load stats + progression chart */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                  label="Average load"
                  value={`${avgLoad}`}
                  unit="%"
                  sub={`${winLen}-week average · body weight`}
                />
                <StatCard
                  label="Current load"
                  value={`${currentLoad}`}
                  unit="%"
                  accent
                  sub={
                    isCurrent
                      ? "live · body weight"
                      : `week ${week} · body weight`
                  }
                  trend={
                    prevDelta != null && prevDelta > 0
                      ? `+${prevDelta} pts vs week ${week - 1}`
                      : undefined
                  }
                />
                <StatCard
                  label="Since surgery"
                  value={`+${sinceStart}`}
                  unit="pts"
                  sub="weight-bearing gained"
                />
              </div>

              <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={HAIRLINE}
                />
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className={CARD_LABEL}>Weight-Bearing Progression</h2>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded bg-[#1E52F3]" />
                      Actual
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-[#9AB1FA]" />
                      Projected
                    </span>
                  </div>
                </div>
                <ProgressionChart markWeek={week} />
              </section>
            </div>
          </div>

          <SurgeonNotes week={week} />
        </div>

        <p className="mt-8 font-['Source_Serif_4'] text-xs text-neutral-500">
          Load shown as percent of body weight. Select a week to compare past
          snapshots; the projection beyond week {CURRENT_WEEK} is a model
          estimate with a shaded confidence band. Pressure field built with
          radial-basis interpolation across 11 in-sole sensors.
        </p>
      </main>
    </div>
  );
}
