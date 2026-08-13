/**
 * The pinned stage: a cutaway section of the machine showing the path a
 * container actually takes.
 *
 * Inline SVG, no JavaScript of its own. Every stage group carries
 * data-stage="<step id>"; the CSS in globals.css raises the active one by
 * opacity alone, and the travelling token is moved by a transform driven from
 * --tech-progress. Opacity and transform only — nothing here can trigger
 * layout.
 *
 * Marked as a schematic for the same reason as the hero elevation: no
 * engineering drawing has been supplied, so this draws the mechanism rather
 * than claiming to depict the cabinet.
 */

export function TechStage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 520"
      className={className}
      role="img"
      aria-labelledby="stage-title stage-desc"
      fill="none"
    >
      <title id="stage-title">Container path through the machine — cutaway section</title>
      <desc id="stage-desc">
        Schematic cutaway showing the route a container takes: intake at the top, then the
        identification sensors, the validation gate with its return path, the depositor credit
        panel, the diverter that splits PET from aluminium, a compactor and storage bin on each
        stream, the collection door at the base, and a finished bale leaving for a reprocessor.
      </desc>

      <defs>
        <pattern
          id="stage-alu-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-stream-alu)" strokeWidth="1.6" />
        </pattern>
      </defs>

      {/* Cabinet cutaway. Dashed = section cut. */}
      <rect
        x="40"
        y="24"
        width="180"
        height="430"
        stroke="var(--color-ink-muted)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        opacity="0.5"
      />

      {/* ---- 0 · Deposit ---- */}
      <g data-stage="deposit">
        <rect
          x="86"
          y="34"
          width="88"
          height="22"
          fill="var(--color-well)"
          stroke="var(--color-ink-muted)"
          strokeWidth="1.5"
        />
        <path
          d="M130 12 L130 30 M125 25 L130 31 L135 25"
          stroke="var(--color-action)"
          strokeWidth="1.5"
        />
      </g>

      {/* ---- 1 · Identify: barcode reader + NIR bar ---- */}
      <g data-stage="identify">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            x1={92 + i * 7}
            y1="70"
            x2={92 + i * 7}
            y2="84"
            stroke="var(--color-ink)"
            strokeWidth={i % 3 === 0 ? 2.5 : 1.2}
          />
        ))}
        <rect x="146" y="70" width="30" height="14" fill="var(--color-optic)" opacity="0.85" />
        <text
          x="182"
          y="81"
          fill="var(--color-optic-ink)"
          fontSize="8"
          fontFamily="var(--font-mono)"
          letterSpacing="0.08em"
        >
          NIR
        </text>
      </g>

      {/* ---- 2 · Validate: gate, with the reject path back out ---- */}
      <g data-stage="validate">
        <line
          x1="86"
          y1="104"
          x2="174"
          y2="104"
          stroke="var(--color-ink-muted)"
          strokeWidth="2.5"
        />
        <path
          d="M86 104 L60 104 L60 46"
          stroke="var(--color-ink-muted)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <path d="M55 52 L60 44 L65 52" stroke="var(--color-ink-muted)" strokeWidth="1.2" />
      </g>

      {/* ---- 3 · Return value: credit panel ---- */}
      <g data-stage="return-value">
        <rect x="196" y="96" width="52" height="34" fill="var(--color-action)" />
        <line
          x1="204"
          y1="107"
          x2="240"
          y2="107"
          stroke="var(--color-on-action)"
          strokeWidth="1.6"
        />
        <line
          x1="204"
          y1="115"
          x2="228"
          y2="115"
          stroke="var(--color-on-action)"
          strokeWidth="1.6"
        />
      </g>

      {/* ---- 4 · Sort: diverter splits the streams ---- */}
      <g data-stage="sort">
        <path
          d="M130 128 L96 168 M130 128 L164 168"
          stroke="var(--color-ink-muted)"
          strokeWidth="1.5"
        />
        <path d="M118 140 L130 126 L142 140" stroke="var(--color-action)" strokeWidth="1.8" />
      </g>

      {/* ---- 5 · Compact: one press per stream ---- */}
      <g data-stage="compact">
        {[
          { x: 62, label: 'pet' },
          { x: 152, label: 'alu' },
        ].map(({ x, label }) => (
          <g key={label}>
            <rect
              x={x}
              y="182"
              width="66"
              height="46"
              stroke="var(--color-ink-muted)"
              strokeWidth="1"
              strokeDasharray="5 4"
            />
            <line
              x1={x + 8}
              y1="194"
              x2={x + 58}
              y2="194"
              stroke="var(--color-ink)"
              strokeWidth="2.5"
            />
            <line
              x1={x + 8}
              y1="216"
              x2={x + 58}
              y2="216"
              stroke="var(--color-ink)"
              strokeWidth="2.5"
            />
          </g>
        ))}
      </g>

      {/* ---- 6 · Store: a bin per stream, never one mixed hopper ---- */}
      <g data-stage="store">
        <rect x="62" y="248" width="66" height="120" fill="var(--color-stream-pet)" opacity="0.9" />
        <rect
          x="152"
          y="248"
          width="66"
          height="120"
          fill="url(#stage-alu-hatch)"
          stroke="var(--color-stream-alu)"
          strokeWidth="1"
        />
        <text
          x="66"
          y="384"
          fill="var(--color-ink)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.08em"
        >
          PET
        </text>
        <text
          x="156"
          y="384"
          fill="var(--color-ink)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.08em"
        >
          ALU
        </text>
      </g>

      {/* ---- 7 · Collect: door at the base ---- */}
      <g data-stage="collect">
        <rect
          x="62"
          y="404"
          width="156"
          height="26"
          stroke="var(--color-ink-muted)"
          strokeWidth="1.5"
        />
        <path
          d="M140 414 L176 414 M170 409 L177 414 L170 419"
          stroke="var(--color-action)"
          strokeWidth="1.5"
        />
      </g>

      {/* ---- 8 · Bale and offtake: leaves the building ---- */}
      <g data-stage="offtake">
        <rect x="196" y="452" width="60" height="48" stroke="var(--color-ink)" strokeWidth="1.5" />
        <line x1="196" y1="468" x2="256" y2="468" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1="196" y1="484" x2="256" y2="484" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1="216" y1="452" x2="216" y2="500" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1="236" y1="452" x2="236" y2="500" stroke="var(--color-ink)" strokeWidth="1" />
        <path
          d="M150 476 L188 476 M182 471 L189 476 L182 481"
          stroke="var(--color-action)"
          strokeWidth="1.5"
        />
      </g>

      {/* Floor line */}
      <line
        x1="24"
        y1="454"
        x2="190"
        y2="454"
        stroke="var(--color-ink-muted)"
        strokeWidth="1"
        opacity="0.5"
      />

      {/*
        The travelling container. Moved by transform from --tech-progress, so it
        tracks the scroll continuously rather than jumping between steps.
      */}
      <g data-tech-token>
        <rect x="122" y="38" width="16" height="16" fill="var(--color-action)" />
      </g>

      <text
        x="24"
        y="514"
        fill="var(--color-ink-muted)"
        fontSize="8"
        fontFamily="var(--font-mono)"
        letterSpacing="0.1em"
      >
        SCHEMATIC · SECTION
      </text>
    </svg>
  );
}

export default TechStage;
