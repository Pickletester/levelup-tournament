/**
 * SVG recreation of the LevelUp "UP" arrow mark. The defining element of the
 * brand is the upward arrow rising out of the "U". To use the real asset,
 * drop a PNG/SVG in /public and replace <ArrowMark/> with an <img>.
 */
export function ArrowMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="LevelUp"
      fill="currentColor"
    >
      {/* upward arrow */}
      <path d="M32 3 L55 30 H42.5 V40 H21.5 V30 H9 Z" />
      {/* the U cradle */}
      <path d="M21.5 40 h21 v6.5 a10.5 10.5 0 0 1 -21 0 Z" />
    </svg>
  )
}

export function BrandLogo({
  light = false,
  className = '',
}: {
  light?: boolean
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid place-items-center rounded-xl bg-lu-green text-white shadow-sm h-9 w-9 shrink-0">
        <ArrowMark className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-extrabold tracking-tight">
          <span className={light ? 'text-white' : 'text-ink'}>Level</span>
          <span className="text-lu-green">Up</span>
        </span>
        <span
          className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${
            light ? 'text-white/60' : 'text-ink/45'
          }`}
        >
          Pickleball Club
        </span>
      </span>
    </span>
  )
}
