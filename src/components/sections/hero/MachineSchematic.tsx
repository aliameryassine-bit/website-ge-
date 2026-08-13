/**
 * The machine, as a technical elevation.
 *
 * WHY A DRAWING AND NOT A RENDER: no photograph or engineering drawing of the
 * machine has been supplied. A realistic render would be inventing the
 * product's appearance, which is the same offence as inventing a statistic —
 * so this is unambiguously a schematic, labelled as one, and it depicts the
 * MECHANISM (intake, identification, compaction, two-stream storage,
 * collection) rather than claiming to show the finished cabinet.
 *
 * Inline SVG: 0 KB of JavaScript, scales to any width, and inherits the theme
 * tokens through currentColor and var(), so it cannot drift from the palette.
 *
 * The material streams follow the two-stream discipline: PET solid, aluminium
 * hatched, both directly labelled — never distinguished by hue alone, because
 * PET Flake and Mill Aluminium measure 2.08:1 against each other.
 */

export function MachineSchematic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 460"
      className={className}
      role="img"
      aria-labelledby="machine-title machine-desc"
      fill="none"
    >
      <title id="machine-title">Reverse vending machine — technical elevation</title>
      <desc id="machine-desc">
        Schematic front elevation of a Green Exchange reverse vending machine. From the top: a
        container intake aperture with a near-infrared identification window, an operator readout
        panel, a compaction chamber, two separate storage bins for PET and aluminium, and a
        collection door at the base. Not to scale.
      </desc>

      <defs>
        {/* Mill-line hatch: the aluminium stream's fill treatment. */}
        <pattern
          id="alu-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-stream-alu)" strokeWidth="1.6" />
        </pattern>
      </defs>

      {/* Cairo noon: one hard cast shadow, zero blur, fixed angle. Drawn as
          geometry rather than a filter so it stays crisp at any scale. */}
      <path d="M232 74 L262 96 L262 430 L232 408 Z" fill="rgb(46 42 36 / 0.55)" />
      <path d="M62 408 L232 408 L262 430 L92 430 Z" fill="rgb(46 42 36 / 0.35)" />

      {/* Cabinet */}
      <rect
        x="62"
        y="52"
        width="170"
        height="356"
        stroke="var(--color-ink-muted)"
        strokeWidth="1.5"
      />
      {/* Top cap */}
      <line x1="62" y1="74" x2="232" y2="74" stroke="var(--color-ink-muted)" strokeWidth="1" />

      {/* ---- Intake aperture + NIR identification window ---- */}
      <rect
        x="84"
        y="96"
        width="126"
        height="30"
        fill="var(--color-well)"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
      />
      <line
        x1="96"
        y1="111"
        x2="198"
        y2="111"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      {/* NIR window — the only place the optic colour appears. The label sits
          inside the cabinet: outside, it collided with the right edge. */}
      <rect x="84" y="134" width="90" height="8" fill="var(--color-optic)" opacity="0.85" />
      <text
        x="180"
        y="142"
        fill="var(--color-optic-ink)"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="0.08em"
      >
        NIR
      </text>

      {/* ---- Readout panel ---- */}
      <rect
        x="84"
        y="156"
        width="72"
        height="34"
        fill="var(--color-well)"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
      />
      {[164, 172, 180].map((y, index) => (
        <line
          key={y}
          x1="92"
          y1={y}
          x2={index === 1 ? 128 : 148}
          y2={y}
          stroke="var(--color-ink-muted)"
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}

      {/* Deposit button: the one interactive affordance, in the action colour. */}
      <rect x="168" y="156" width="42" height="34" fill="var(--color-action)" />

      {/* ---- Compaction chamber ---- */}
      <rect
        x="84"
        y="206"
        width="126"
        height="62"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      {/* Opposing platens */}
      <line x1="96" y1="222" x2="198" y2="222" stroke="var(--color-ink-muted)" strokeWidth="2.5" />
      <line x1="96" y1="252" x2="198" y2="252" stroke="var(--color-ink-muted)" strokeWidth="2.5" />
      <path
        d="M147 230 L147 240 M143 236 L147 241 L151 236"
        stroke="var(--color-ink-muted)"
        strokeWidth="1.2"
      />

      {/* ---- Two-stream storage ---- */}
      {/* PET: solid */}
      <rect x="84" y="284" width="58" height="84" fill="var(--color-stream-pet)" opacity="0.9" />
      <text
        x="88"
        y="382"
        fill="var(--color-ink)"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="0.08em"
      >
        PET
      </text>
      {/* Aluminium: hatched */}
      <rect
        x="152"
        y="284"
        width="58"
        height="84"
        fill="url(#alu-hatch)"
        stroke="var(--color-stream-alu)"
        strokeWidth="1"
      />
      <text
        x="156"
        y="382"
        fill="var(--color-ink)"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="0.08em"
      >
        ALU
      </text>

      {/* ---- Collection door ---- */}
      <rect
        x="84"
        y="390"
        width="126"
        height="12"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
      />

      {/* ---- Floor line ---- */}
      <line
        x1="30"
        y1="408"
        x2="310"
        y2="408"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* ---- Dimension witness lines. Deliberately UNLABELLED: the figures
              live in the callouts beside this drawing, where they carry their
              status and source. A number inked onto the drawing could not. ---- */}
      <g stroke="var(--color-ink-muted)" strokeWidth="1" opacity="0.55">
        {/* Height */}
        <line x1="46" y1="52" x2="46" y2="408" />
        <line x1="41" y1="52" x2="51" y2="52" />
        <line x1="41" y1="408" x2="51" y2="408" />
        {/* Width */}
        <line x1="62" y1="424" x2="232" y2="424" />
        <line x1="62" y1="419" x2="62" y2="429" />
        <line x1="232" y1="419" x2="232" y2="429" />
      </g>

      <text
        x="30"
        y="446"
        fill="var(--color-ink-muted)"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="0.1em"
      >
        SCHEMATIC · NOT TO SCALE
      </text>
    </svg>
  );
}

export default MachineSchematic;
