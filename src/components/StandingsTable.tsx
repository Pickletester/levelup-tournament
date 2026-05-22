import { computeStandings, teamLabel } from '../lib/tournament'
import type { Division } from '../lib/types'

export function StandingsTable({
  division,
  medalByTeam = {},
}: {
  division: Division
  medalByTeam?: Record<string, 'gold' | 'silver' | 'bronze'>
}) {
  const rows = computeStandings(division)
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-card p-6 text-center text-sm text-ink/45">
        No teams added yet.
      </p>
    )
  }

  const medalIcon = { gold: '🥇', silver: '🥈', bronze: '🥉' }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-surface/60 text-left text-[11px] uppercase tracking-wide text-ink/45">
            <th className="px-3 py-2 font-bold">#</th>
            <th className="px-3 py-2 font-bold">Team</th>
            <th className="px-2 py-2 text-center font-bold">W</th>
            <th className="px-2 py-2 text-center font-bold">L</th>
            <th className="hidden px-2 py-2 text-center font-bold sm:table-cell">PF</th>
            <th className="hidden px-2 py-2 text-center font-bold sm:table-cell">PA</th>
            <th className="px-2 py-2 text-center font-bold">Diff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const qualifies =
              division.phase !== 'complete' && r.seed <= division.advanceCount
            const medal = medalByTeam[r.team.id]
            return (
              <tr
                key={r.team.id}
                className={`border-b border-line/70 last:border-0 ${
                  qualifies ? 'bg-lu-green/[0.06]' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                      qualifies
                        ? 'bg-lu-green text-white'
                        : 'bg-slate-100 text-ink/50'
                    }`}
                  >
                    {r.seed}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-ink">
                  <span className="flex items-center gap-1.5">
                    {medal && <span>{medalIcon[medal]}</span>}
                    {teamLabel(r.team)}
                  </span>
                </td>
                <td className="px-2 py-2 text-center font-bold tabular-nums text-ink">
                  {r.wins}
                </td>
                <td className="px-2 py-2 text-center tabular-nums text-ink/60">
                  {r.losses}
                </td>
                <td className="hidden px-2 py-2 text-center tabular-nums text-ink/60 sm:table-cell">
                  {r.pointsFor}
                </td>
                <td className="hidden px-2 py-2 text-center tabular-nums text-ink/60 sm:table-cell">
                  {r.pointsAgainst}
                </td>
                <td
                  className={`px-2 py-2 text-center font-semibold tabular-nums ${
                    r.pointDiff > 0
                      ? 'text-lu-green-deep'
                      : r.pointDiff < 0
                        ? 'text-red-500'
                        : 'text-ink/50'
                  }`}
                >
                  {r.pointDiff > 0 ? `+${r.pointDiff}` : r.pointDiff}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {division.phase !== 'complete' && rows.length > division.advanceCount && (
        <div className="border-t border-line bg-surface/50 px-3 py-1.5 text-[11px] text-ink/45">
          <span className="font-semibold text-lu-green-deep">Green</span> = top{' '}
          {division.advanceCount} advancing to playoffs
        </div>
      )}
    </div>
  )
}
