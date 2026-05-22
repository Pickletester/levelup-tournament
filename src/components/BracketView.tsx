import { setWinner } from '../lib/actions'
import { matchesByRound, roundLabel, totalRounds } from '../lib/tournament'
import type { BracketMatch } from '../lib/types'

type Variant = 'light' | 'tv'

function Slot({
  name,
  isWinner,
  decided,
  editable,
  variant,
  onPick,
}: {
  name: string | null
  isWinner: boolean
  decided: boolean
  editable: boolean
  variant: Variant
  onPick: () => void
}) {
  const tv = variant === 'tv'
  const empty = !name
  const base = tv
    ? 'flex items-center justify-between rounded-md px-[0.6em] py-[0.4em] text-[0.95em]'
    : 'flex items-center justify-between rounded-md px-3 py-2 text-sm'

  const tone = empty
    ? tv
      ? 'text-white/25'
      : 'text-ink/30'
    : isWinner
      ? tv
        ? 'bg-lu-green/25 font-bold text-white'
        : 'bg-lu-green/10 font-bold text-lu-green-deep'
      : decided
        ? tv
          ? 'text-white/35 line-through'
          : 'text-ink/35 line-through'
        : tv
          ? 'text-white/90'
          : 'text-ink'

  const clickable = editable && !empty
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onPick}
      className={`${base} ${tone} w-full text-left ${
        clickable ? (tv ? 'hover:bg-white/10' : 'hover:bg-lu-green/10') : 'cursor-default'
      }`}
    >
      <span className="truncate">{name || 'TBD'}</span>
      {isWinner && <span className="ml-2 shrink-0">{tv ? '✓' : '✓'}</span>}
    </button>
  )
}

function MatchBox({
  match,
  editable,
  variant,
}: {
  match: BracketMatch
  editable: boolean
  variant: Variant
}) {
  const tv = variant === 'tv'
  const decided = !!match.winner
  return (
    <div
      className={
        tv
          ? 'rounded-lg border border-white/10 bg-white/[0.03] p-[0.3em]'
          : 'rounded-lg border border-line bg-card p-1.5 shadow-sm'
      }
    >
      <Slot
        name={match.a}
        isWinner={!!match.a && match.winner === match.a}
        decided={decided}
        editable={editable}
        variant={variant}
        onPick={() => match.a && setWinner(match.id, match.a)}
      />
      <div className={tv ? 'my-[0.15em] h-px bg-white/10' : 'my-1 h-px bg-line'} />
      <Slot
        name={match.b}
        isWinner={!!match.b && match.winner === match.b}
        decided={decided}
        editable={editable}
        variant={variant}
        onPick={() => match.b && setWinner(match.id, match.b)}
      />
    </div>
  )
}

export function BracketView({
  matches,
  editable = false,
  variant = 'light',
}: {
  matches: BracketMatch[]
  editable?: boolean
  variant?: Variant
}) {
  const rounds = matchesByRound(matches)
  const total = totalRounds(matches)
  const tv = variant === 'tv'

  return (
    <div className={`flex ${tv ? 'gap-[1.4vw]' : 'gap-4'} overflow-x-auto pb-2`}>
      {rounds.map((roundMatches, r) => (
        <div
          key={r}
          className={`flex min-w-[10em] flex-1 flex-col justify-around ${
            tv ? 'gap-[1vh]' : 'gap-3'
          }`}
        >
          <div
            className={
              tv
                ? 'text-center text-[0.6em] font-bold uppercase tracking-widest text-white/40'
                : 'text-center text-xs font-bold uppercase tracking-widest text-ink/40'
            }
          >
            {roundLabel(r, total)}
          </div>
          {roundMatches.map((m) => (
            <MatchBox key={m.id} match={m} editable={editable} variant={variant} />
          ))}
        </div>
      ))}
    </div>
  )
}
