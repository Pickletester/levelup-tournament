import { medalists, teamById, teamLabel } from '../lib/tournament'
import type { Division } from '../lib/types'
import { MatchCard } from './MatchCard'

function MedalPodium({ division }: { division: Division }) {
  const m = medalists(division.bracket)
  if (!m.gold && !m.silver && !m.bronze) return null
  const rows: { icon: string; label: string; id?: string }[] = [
    { icon: '🥇', label: 'Gold', id: m.gold },
    { icon: '🥈', label: 'Silver', id: m.silver },
    { icon: '🥉', label: 'Bronze', id: m.bronze },
  ]
  return (
    <div className="rounded-xl border border-lu-green/30 bg-lu-green/[0.06] p-4">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-lu-green-deep">
        Medalists
      </h4>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="text-xl">{r.icon}</span>
            <span className="w-14 text-xs font-semibold uppercase tracking-wide text-ink/45">
              {r.label}
            </span>
            <span className="font-semibold text-ink">
              {r.id ? teamLabel(teamById(division, r.id)) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Bracket({
  division,
  admin,
}: {
  division: Division
  admin: boolean
}) {
  const sf = division.bracket.filter((m) => m.stage === 'sf')
  const final = division.bracket.find((m) => m.stage === 'final')
  const bronze = division.bracket.find((m) => m.stage === 'bronze')

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink/45">
          Semifinals
        </h4>
        {sf.map((m) => (
          <MatchCard key={m.id} division={division} match={m} admin={admin} />
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink/45">
          Medal Matches
        </h4>
        {final && (
          <MatchCard division={division} match={final} admin={admin} />
        )}
        {bronze && (
          <MatchCard division={division} match={bronze} admin={admin} />
        )}
      </div>

      <div className="space-y-3">
        <MedalPodium division={division} />
      </div>
    </div>
  )
}
