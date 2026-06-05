export default function Noise({ opacity = 0.04 }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1]">
      <svg
        className="absolute inset-0 h-full w-full"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
