import type { Phase } from '../lib/types'
import type { MatchResult } from '../lib/tournament'

const phaseStyles: Record<Phase, { label: string; cls: string }> = {
  setup: { label: 'Setup', cls: 'bg-slate-100 text-slate-500' },
  roundRobin: { label: 'Round Robin', cls: 'bg-lu-green/10 text-lu-green-deep' },
  playoffs: { label: 'Playoffs', cls: 'bg-amber-100 text-amber-700' },
  complete: { label: 'Complete', cls: 'bg-lu-green text-white' },
}

export function PhaseChip({ phase }: { phase: Phase }) {
  const s = phaseStyles[phase]
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.cls}`}
    >
      {s.label}
    </span>
  )
}

export function StatusChip({ status }: { status: MatchResult['status'] }) {
  if (status === 'final')
    return (
      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/55">
        Final
      </span>
    )
  if (status === 'live')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-lu-green/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lu-green-deep">
        <span className="lu-live-dot h-1.5 w-1.5 rounded-full bg-lu-green" />
        Live
      </span>
    )
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
      Upcoming
    </span>
  )
}
