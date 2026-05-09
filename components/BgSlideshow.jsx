'use client'

/**
 * BgSlideshow — pure-CSS cross-fading background.
 *
 * Strategy: N slides each run the same animation-duration = N × STEP.
 * Each slide is offset by (index × STEP) so only one is fully opaque at a time.
 * Keyframe: 0% invisible → short fade-in → hold → fade-out → rest invisible.
 *
 * 6 images × 6 s per image = 36 s full cycle.
 */

const IMAGES = [
  '/assets/1.jpeg',
  '/assets/2.jpeg',
  '/assets/3.jpeg',
  '/assets/4.jpeg',
  '/assets/5.jpeg',
  '/assets/6.jpeg',
]

const N = IMAGES.length          // 6
const STEP = 6                   // seconds each slide is "on"
const TOTAL = N * STEP           // 36 s full cycle
const FADE = 1.5                 // seconds for cross-fade transition

// Each slide's keyframe: visible for STEP/TOTAL fraction, faded the rest.
// We build the % stops dynamically per slide via inline style + a shared @keyframes.
// Because all slides share the same @keyframes "bg-cycle", the delay does the staggering.

export default function BgSlideshow() {
  return (
    <>
      <div className="bg-slideshow" aria-hidden="true">
        {IMAGES.map((src, i) => (
          <div
            key={src}
            className="bg-slide"
            style={{
              backgroundImage: `url(${src})`,
              animationDelay: `${i * STEP * -1}s`,   // negative = start mid-cycle
            }}
          />
        ))}
        {/* Dark overlay so text stays readable */}
        <div className="bg-overlay" />
      </div>

      <style>{`
        .bg-slideshow {
          position: fixed;
          inset: 0;
          z-index: -2;
          overflow: hidden;
        }

        .bg-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          will-change: opacity;
          /* Slight Ken-Burns zoom for extra life */
          animation:
            bg-cycle ${TOTAL}s ease-in-out infinite,
            bg-zoom  ${TOTAL}s ease-in-out infinite;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          /* Dark vignette: keeps green gradient palette intact */
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%,  rgba(34,197,94,0.15)  0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(45,212,191,0.10) 0%, transparent 55%),
            linear-gradient(160deg, rgba(2,12,6,0.72) 0%, rgba(3,15,8,0.60) 50%, rgba(2,11,5,0.72) 100%);
        }

        /* Single shared keyframe — delay staggers each slide */
        @keyframes bg-cycle {
          /* Show window = ${(STEP / TOTAL) * 100}% of the cycle */
          0%                                    { opacity: 0; }
          ${((FADE / 2) / TOTAL * 100).toFixed(2)}%              { opacity: 1; }
          ${((STEP - FADE / 2) / TOTAL * 100).toFixed(2)}%       { opacity: 1; }
          ${((STEP + FADE / 2) / TOTAL * 100).toFixed(2)}%       { opacity: 0; }
          100%                                  { opacity: 0; }
        }

        @keyframes bg-zoom {
          0%   { transform: scale(1);    }
          50%  { transform: scale(1.06); }
          100% { transform: scale(1);    }
        }

        /* Respect reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          .bg-slide { animation: bg-cycle ${TOTAL}s ease-in-out infinite; }
          @keyframes bg-zoom { 0%, 100% { transform: scale(1); } }
        }
      `}</style>
    </>
  )
}
