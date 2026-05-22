import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buildBracket, resetBracket, setBracketTitle } from '../lib/actions'
import { useAdmin } from '../lib/admin'
import { useTournament } from '../lib/store'
import { champion } from '../lib/tournament'
import { BracketView } from '../components/BracketView'

function PlayersPanel({
  participants,
  built,
}: {
  participants: string[]
  built: boolean
}) {
  const [open, setOpen] = useState(!built)
  const [text, setText] = useState(participants.join('\n'))
  const count = text.split('\n').map((s) => s.trim()).filter(Boolean).length

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-bold uppercase tracking-wide text-amber-700"
      >
        <span>Players / teams {built && `(${participants.length})`}</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-ink/55">
            One player or team per line. They’ll be paired top-to-bottom in the order you list them.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder={'Smith / Jones\nLee / Park\nCarter / Boyd\nRivera / Hale'}
            className="w-full rounded-lg border border-line p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-lu-green/40"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (built && !confirm('Rebuild the bracket? This clears any results so far.')) return
                buildBracket(text.split('\n'))
                setOpen(false)
              }}
              disabled={count < 2}
              className="rounded-lg bg-lu-green px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-lu-green-dark disabled:opacity-40"
            >
              {built ? 'Rebuild bracket' : 'Build bracket'} ({count})
            </button>
            {built && (
              <button
                onClick={() => {
                  if (confirm('Clear the whole bracket?')) {
                    resetBracket()
                    setText('')
                  }
                }}
                className="rounded-lg border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink-soft hover:border-red-300 hover:text-red-500"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export function Home() {
  const state = useTournament()
  const admin = useAdmin()
  if (!state) return null

  const { bracket } = state
  const champ = champion(bracket.matches)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {admin ? (
            <input
              value={bracket.title}
              onChange={(e) => setBracketTitle(e.target.value)}
              placeholder="Bracket name (e.g. Men's Doubles 4.0)"
              className="rounded-lg border border-transparent bg-transparent text-2xl font-extrabold text-ink outline-none hover:border-line focus:border-line focus:ring-2 focus:ring-lu-green/30 sm:text-3xl"
            />
          ) : (
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {bracket.title || 'Tournament Bracket'}
            </h1>
          )}
          <p className="text-sm text-ink/45">{state.meta.name}</p>
        </div>
        <Link
          to="/tv"
          target="_blank"
          className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
        >
          📺 TV view
        </Link>
      </div>

      {champ && (
        <div className="rounded-2xl border border-lu-green/30 bg-lu-green/[0.08] px-5 py-4 text-lg font-bold text-lu-green-deep">
          🏆 Champion: {champ}
        </div>
      )}

      {admin && <PlayersPanel participants={bracket.participants} built={bracket.built} />}

      {bracket.built ? (
        <BracketView matches={bracket.matches} editable={admin} variant="light" />
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-card p-10 text-center text-ink/45">
          {admin
            ? 'Add players above and tap “Build bracket”.'
            : 'Bracket not set up yet — check back soon.'}
        </p>
      )}
    </div>
  )
}
