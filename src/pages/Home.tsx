import { useState } from 'react'
import { addDivision } from '../lib/actions'
import { useAdmin } from '../lib/admin'
import { useTournament } from '../lib/store'
import type { Discipline, TournamentState } from '../lib/types'
import { DivisionCard } from '../components/DivisionCard'

function Hero({ meta }: { meta: TournamentState['meta'] }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lu-green-deep via-lu-green-dark to-lu-green px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12">
      <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
          {meta.subtitle}
        </span>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
          {meta.name}
        </h1>
        <p className="mt-2 text-white/80">{meta.location}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="rounded-lg bg-white/15 px-3 py-1.5 font-semibold">
            📅 {meta.dates}
          </span>
          <span className="rounded-lg bg-white/15 px-3 py-1.5 font-semibold">
            🏓 {meta.ball}
          </span>
          <span className="rounded-lg bg-white/15 px-3 py-1.5 font-semibold">
            Round robin → top 4 single-elim
          </span>
        </div>
      </div>
    </section>
  )
}

function AddDivision({ events }: { events: string[] }) {
  const [event, setEvent] = useState(events[0])
  const [name, setName] = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('doubles')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        addDivision(event, name.trim(), discipline)
        setName('')
      }}
      className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
        Add division
      </span>
      <select
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
      >
        {events.map((ev) => (
          <option key={ev}>{ev}</option>
        ))}
      </select>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. 4.0 or 50+ 3.5"
        className="w-40 rounded-lg border border-line px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-lu-green/40"
      />
      <select
        value={discipline}
        onChange={(e) => setDiscipline(e.target.value as Discipline)}
        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
      >
        <option value="doubles">Doubles</option>
        <option value="singles">Singles</option>
      </select>
      <button className="rounded-lg bg-lu-green px-4 py-1.5 text-sm font-semibold text-white hover:bg-lu-green-dark">
        Add
      </button>
    </form>
  )
}

export function Home() {
  const state = useTournament()
  const admin = useAdmin()
  if (!state) return <Loading />

  const { meta, divisions } = state

  return (
    <div className="space-y-8">
      <Hero meta={meta} />

      {admin && <AddDivision events={meta.events} />}

      {meta.events.map((event) => {
        const divs = divisions.filter((d) => d.event === event)
        if (divs.length === 0 && !admin) return null
        return (
          <section key={event}>
            <h2 className="mb-3 text-lg font-bold text-ink">{event}</h2>
            {divs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-4 text-sm text-ink/40">
                No divisions yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {divs.map((d) => (
                  <DivisionCard key={d.id} division={d} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      <FormatNote />
    </div>
  )
}

function FormatNote() {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 text-sm text-ink/70 shadow-sm">
      <h3 className="mb-2 font-bold text-ink">Format</h3>
      <ul className="space-y-1.5">
        <li>
          <span className="font-semibold text-ink">Round robin → top 4</span> advance
          to single-elimination playoffs.
        </li>
        <li>
          Round robin &amp; semifinals:{' '}
          <span className="font-semibold text-ink">first to 15, win by 2</span>.
        </li>
        <li>
          Medal matches (Gold &amp; Bronze):{' '}
          <span className="font-semibold text-ink">best of 3 to 11, win by 2</span>.
        </li>
        <li>Top 3 teams in each division receive medals 🥇🥈🥉.</li>
      </ul>
    </section>
  )
}

function Loading() {
  return (
    <div className="grid place-items-center py-20 text-ink/40">
      <div className="animate-pulse">Loading tournament…</div>
    </div>
  )
}
