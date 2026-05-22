import { adjustScore, clearMatch, setScore } from '../lib/actions'
import { evaluateMatch, teamById, teamLabel } from '../lib/tournament'
import type { Division, Match } from '../lib/types'
import { StatusChip } from './chips'

function formatHint(m: Match): string {
  if (m.bestOf > 1) return `Best of ${m.bestOf} · games to ${m.target}, win by ${m.winBy}`
  return `Single game to ${m.target}, win by ${m.winBy}`
}

function slotName(m: Match, division: Division, slot: 'A' | 'B'): string {
  const id = slot === 'A' ? m.teamAId : m.teamBId
  const team = teamById(division, id)
  if (team) return teamLabel(team)
  const seed = slot === 'A' ? m.seedA : m.seedB
  return seed ? `Seed ${seed}` : 'TBD'
}

function Stepper({
  value,
  onSet,
  onStep,
  disabled,
}: {
  value: number
  onSet: (n: number) => void
  onStep: (delta: number) => void
  disabled?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onStep(-1)}
        className="h-7 w-7 rounded-md border border-line text-ink/60 transition hover:border-lu-green hover:text-lu-green-deep disabled:opacity-30"
      >
        –
      </button>
      <input
        inputMode="numeric"
        disabled={disabled}
        value={value}
        onChange={(e) => onSet(Number(e.target.value.replace(/\D/g, '')) || 0)}
        className="h-7 w-9 rounded-md border border-line text-center text-sm font-semibold tabular-nums outline-none focus:ring-2 focus:ring-lu-green/40 disabled:opacity-40"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onStep(1)}
        className="h-7 w-7 rounded-md border border-line text-ink/60 transition hover:border-lu-green hover:text-lu-green-deep disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}

export function MatchCard({
  division,
  match,
  admin,
}: {
  division: Division
  match: Match
  admin: boolean
}) {
  const res = evaluateMatch(match)
  const nameA = slotName(match, division, 'A')
  const nameB = slotName(match, division, 'B')
  const hasBoth = !!match.teamAId && !!match.teamBId
  const cols = `minmax(0,1fr) repeat(${match.games.length}, ${admin ? 'auto' : '2rem'})`

  const winA = res.winnerSlot === 'A'
  const winB = res.winnerSlot === 'B'

  const rowBase =
    'grid items-center gap-x-3 px-3 py-2 rounded-lg transition'

  return (
    <div className="rounded-xl border border-line bg-card p-3 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold uppercase tracking-wide text-ink/45">
          {match.label || 'Match'}
        </span>
        <StatusChip status={res.status} />
      </div>

      <div className="space-y-1 overflow-x-auto">
        {/* Team A */}
        <div
          className={`${rowBase} ${winA ? 'bg-lu-green/10' : ''}`}
          style={{ gridTemplateColumns: cols }}
        >
          <span
            className={`flex items-center gap-1.5 truncate text-sm ${
              winA ? 'font-bold text-lu-green-deep' : 'font-medium text-ink'
            }`}
          >
            {winA && <span aria-hidden>🏆</span>}
            <span className="truncate">{nameA}</span>
          </span>
          {match.games.map((g, i) =>
            admin ? (
              <Stepper
                key={i}
                value={g.a}
                disabled={!hasBoth}
                onSet={(n) => setScore(division.id, match.id, i, 'a', n)}
                onStep={(d) => adjustScore(division.id, match.id, i, 'a', d)}
              />
            ) : (
              <span
                key={i}
                className={`text-center text-sm tabular-nums ${
                  winA ? 'font-extrabold text-lu-green-deep' : 'text-ink/70'
                }`}
              >
                {g.a}
              </span>
            ),
          )}
        </div>

        {/* Team B */}
        <div
          className={`${rowBase} ${winB ? 'bg-lu-green/10' : ''}`}
          style={{ gridTemplateColumns: cols }}
        >
          <span
            className={`flex items-center gap-1.5 truncate text-sm ${
              winB ? 'font-bold text-lu-green-deep' : 'font-medium text-ink'
            }`}
          >
            {winB && <span aria-hidden>🏆</span>}
            <span className="truncate">{nameB}</span>
          </span>
          {match.games.map((g, i) =>
            admin ? (
              <Stepper
                key={i}
                value={g.b}
                disabled={!hasBoth}
                onSet={(n) => setScore(division.id, match.id, i, 'b', n)}
                onStep={(d) => adjustScore(division.id, match.id, i, 'b', d)}
              />
            ) : (
              <span
                key={i}
                className={`text-center text-sm tabular-nums ${
                  winB ? 'font-extrabold text-lu-green-deep' : 'text-ink/70'
                }`}
              >
                {g.b}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-ink/40">{formatHint(match)}</span>
        {admin && (
          <button
            onClick={() => clearMatch(division.id, match.id)}
            className="text-[11px] font-semibold text-ink/40 hover:text-red-500"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
