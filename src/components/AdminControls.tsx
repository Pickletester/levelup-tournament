import { useState, type FormEvent } from 'react'
import {
  addTeam,
  backToRoundRobin,
  regenerateRoundRobin,
  removeTeam,
  startPlayoffs,
} from '../lib/actions'
import { teamLabel } from '../lib/tournament'
import type { Division } from '../lib/types'

function AddTeamForm({ division }: { division: Division }) {
  const isDoubles = division.discipline === 'doubles'
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const players = [p1, p2].map((s) => s.trim()).filter(Boolean)
    if (isDoubles && players.length < 2) return
    if (!isDoubles && players.length < 1) return
    addTeam(division.id, isDoubles ? players.slice(0, 2) : [players[0]])
    setP1('')
    setP2('')
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        value={p1}
        onChange={(e) => setP1(e.target.value)}
        placeholder={isDoubles ? 'Player 1' : 'Player name'}
        className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-lu-green/40"
      />
      {isDoubles && (
        <input
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          placeholder="Player 2"
          className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-lu-green/40"
        />
      )}
      <button
        type="submit"
        className="rounded-lg bg-lu-green px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-lu-green-dark"
      >
        Add {isDoubles ? 'team' : 'player'}
      </button>
    </form>
  )
}

export function AdminControls({ division }: { division: Division }) {
  const inPlayoffs = division.phase === 'playoffs' || division.phase === 'complete'

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700">
        Admin · {division.event} {division.name}
      </h3>

      {!inPlayoffs && (
        <>
          <AddTeamForm division={division} />
          {division.teams.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {division.teams.map((t) => (
                <li
                  key={t.id}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm"
                >
                  {teamLabel(t)}
                  <button
                    onClick={() => removeTeam(division.id, t.id)}
                    className="text-ink/30 hover:text-red-500"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!inPlayoffs ? (
          <>
            <button
              onClick={() => {
                if (
                  division.teams.length < division.advanceCount &&
                  !confirm(
                    `Only ${division.teams.length} team(s) — fewer than the ${division.advanceCount} playoff spots. Start anyway?`,
                  )
                )
                  return
                startPlayoffs(division.id)
              }}
              disabled={division.teams.length < 2}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-40"
            >
              Lock standings · Start playoffs
            </button>
            <button
              onClick={() => regenerateRoundRobin(division.id)}
              disabled={division.teams.length < 2}
              className="rounded-lg border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-lu-green disabled:opacity-40"
            >
              Regenerate schedule
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              if (confirm('Return to round robin? This clears the current bracket.'))
                backToRoundRobin(division.id)
            }}
            className="rounded-lg border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-lu-green"
          >
            ← Back to round robin
          </button>
        )}
      </div>
    </section>
  )
}
