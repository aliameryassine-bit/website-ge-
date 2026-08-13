import { ImageResponse } from 'next/og';

/**
 * Open Graph card, one design for every route.
 *
 * Built from the same palette as the site: housing grey ground, flake for text,
 * aluminium for the secondary line, safety yellow reserved for the one accent.
 * The machine outline is the same object the hero draws, reduced to the silhouette
 * that survives at 1200×630 in a chat preview.
 *
 * NO ARRAY. Satori — the renderer behind next/og — cannot read WOFF2, and Array
 * ships as WOFF2 only, so the display face is unavailable here. Rather than fake
 * it with a lookalike, the card leans on the palette, the rule structure and the
 * machine silhouette to be recognisably this site. Swap in Array when a TTF or
 * OTF of it exists.
 *
 * No numbers appear on these cards. Every figure is a PLACEHOLDER and a share
 * card is the last place a dash should be doing the talking.
 */

const GROUND = '#383f43';
const BELT = '#16181a';
const FLAKE = '#c6d9df';
const ALU = '#a8afb3';
const YELLOW = '#f0c23c';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function ogImage({
  title,
  eyebrow,
  locale,
}: {
  title: string;
  eyebrow: string;
  locale: string;
}) {
  const rtl = locale === 'ar';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: rtl ? 'row-reverse' : 'row',
        background: GROUND,
        // Mirrors with the site. A card is as directional as a page.
        direction: rtl ? 'rtl' : 'ltr',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: rtl ? 0 : 4,
              textTransform: 'uppercase',
              color: ALU,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 46 ? 60 : 74,
              lineHeight: 1.08,
              fontWeight: 700,
              color: FLAKE,
              maxWidth: 700,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* The hairline the site uses to separate a section from its source. */}
          <div style={{ display: 'flex', width: 620, height: 1, background: ALU, opacity: 0.5 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', width: 14, height: 14, background: YELLOW }} />
            <div style={{ display: 'flex', fontSize: 26, color: FLAKE }}>Green Exchange</div>
            <div style={{ display: 'flex', fontSize: 26, color: ALU }}>PET · Aluminium · Egypt</div>
          </div>
        </div>
      </div>

      {/* Machine silhouette — the hero object, reduced to what reads at card size. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 380,
          background: BELT,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 190,
            height: 400,
            border: `2px solid ${ALU}`,
            padding: 18,
            gap: 14,
          }}
        >
          {/* Display strip */}
          <div style={{ display: 'flex', height: 34, background: GROUND }} />
          {/* Optical sensor bar — the one purple element in the palette */}
          <div style={{ display: 'flex', height: 6, background: '#7a5af0' }} />
          {/* Intake */}
          <div style={{ display: 'flex', height: 56, border: `2px dashed ${ALU}` }} />
          {/* Two material bins */}
          <div style={{ display: 'flex', flex: 1, gap: 10 }}>
            <div style={{ display: 'flex', flex: 1, background: FLAKE, opacity: 0.85 }} />
            <div style={{ display: 'flex', flex: 1, background: ALU, opacity: 0.55 }} />
          </div>
          {/* Return slot */}
          <div style={{ display: 'flex', height: 16, background: YELLOW }} />
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
}
