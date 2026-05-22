import { Link } from 'react-router-dom'
import { computeStandings, medalists, teamById, teamLabel } from '../lib/tournament'
import type { Division } from '../lib/types'
import { PhaseChip } from './chips'

export function DivisionCard({ division }: { division: Division }) {
  const standings = computeStandings(division)
  const leader = standings[0]
  const medals = medalists(division.bracket)
  const champion = medals.gold ? teamById(division, medals.gold) : undefined

  return (
    <Link
      to={`/d/${division.id}`}
      className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-lu-green hover:shadow-md"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-ink">{division.name}</span>
          <PhaseChip phase={division.phase} />
        </div>
        <p className="mt-0.5 truncate text-sm text-ink/55">
          {division.teams.length} {division.discipline === 'doubles' ? 'teams' : 'players'}
          {champion && (
            <span className="font-medium text-lu-green-deep">
              {' '}· 🥇 {teamLabel(champion)}
            </span>
          )}
          {!champion && leader && division.phase === 'roundRobin' && (
            <span> · leading: {teamLabel(leader.team)}</span>
          )}
        </p>
      </div>
      <span className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-lu-green">
        →
      </span>
    </Link>
  )
}
