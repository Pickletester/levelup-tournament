import { isLive } from '../lib/store'

export function LiveBadge() {
  const live = isLive()
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-lu-green/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-lu-green-deep"
      title={
        live
          ? 'Connected to Firebase — updates sync across all devices in real time'
          : 'Local demo mode — updates sync across browser tabs. Add Firebase config to go live across devices.'
      }
    >
      <span className="lu-live-dot inline-block h-1.5 w-1.5 rounded-full bg-lu-green" />
      {live ? 'Live' : 'Live (demo)'}
    </span>
  )
}
