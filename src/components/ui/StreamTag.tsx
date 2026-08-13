/**
 * The two material streams the machine sorts: PET and aluminium.
 *
 * PET Flake and Mill Aluminium are 2.08:1 against each other — measurably
 * indistinguishable as adjacent fills. So the streams are differentiated by
 * FILL TREATMENT plus a direct label, with colour only reinforcing:
 *
 *   PET       solid
 *   Aluminium diagonal mill-line hatch
 *
 * This is the palette's two-stream logic, and it satisfies the rule that
 * colour is never the only carrier of meaning. Use this swatch anywhere the
 * streams appear together, including chart legends.
 */

export type Stream = 'pet' | 'alu';

const LABELS: Record<Stream, string> = {
  pet: 'PET',
  alu: 'Aluminium',
};

const SWATCHES: Record<Stream, string> = {
  pet: 'bg-stream-pet',
  alu: 'bg-[repeating-linear-gradient(45deg,var(--color-stream-alu)_0_2px,transparent_2px_5px)] border border-stream-alu',
};

export function StreamSwatch({ stream }: { stream: Stream }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4 shrink-0 rounded-none ${SWATCHES[stream]}`}
    />
  );
}

export function StreamTag({ stream, value }: { stream: Stream; value?: string }) {
  return (
    <span className="inline-flex items-center gap-sm">
      <StreamSwatch stream={stream} />
      <span className="text-label text-ink uppercase">{LABELS[stream]}</span>
      {value ? (
        <span data-readout className="text-data text-ink-muted">
          {value}
        </span>
      ) : null}
    </span>
  );
}
