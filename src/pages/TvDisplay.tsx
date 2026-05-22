import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTournament } from '../lib/store'
import {
  computeStandings,
  evaluateMatch,
  medalists,
  teamById,
  teamLabel,
} from '../lib/tournament'
import type { Division, Match } from '../lib/types'
import { ArrowMark } from '../components/Logo'

/** Scale the whole page up on big screens so it reads from across a room. */
function useBigScreenScale() {
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.fontSize
    const apply = () => {
      root.style.fontSize = `${Math.max(15, Math.min(48, window.innerWidth / 90))}px`
    }
    apply()
    window.addEventListener('resize', apply)
    return () => {
      root.style.fontSize = prev
      window.removeEventListener('resize', apply)
    }
  }, [])
}

function TvHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-white/10 px-[2vw] py-[1.4vh]">
      <div className="flex items-center gap-4">
        <span className="grid h-[2.6em] w-[2.6em] place-items-center rounded-2xl bg-lu-green text-white">
          <ArrowMark className="h-[1.5em] w-[1.5em]" />
        </span>
        <div className="leading-none">
          <div className="text-[1.05em] font-extrabold tracking-tight text-white">
            Three Rivers Championship
          </div>
          <div className="text-[0.6em] font-semibold uppercase tracking-[0.25em] text-white/45">
            LevelUp Pickleball Club
          </div>
        </div>
      </div>
      <div className="text-right">
        {subtitle && (
          <div className="text-[1.6em] font-extrabold leading-none text-white">
            {subtitle}
          </div>
        )}
        <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-lu-green/15 px-3 py-1 text-[0.6em] font-bold uppercase tracking-widest text-lu-green-light">
          <span className="lu-live-dot h-[0.5em] w-[0.5em] rounded-full bg-lu-green-light" />
          Live
        </div>
      </div>
    </header>
  )
}

function BigStandings({ division }: { division: Division }) {
  const rows = computeStandings(division)
  const medals = medalists(division.bracket)
  const medalOf = (id: string) =>
    medals.gold === id ? '🥇' : medals.silver === id ? '🥈' : medals.bronze === id ? '🥉' : ''

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <table className="w-full text-[1.05em]">
        <thead>
          <tr className="bg-white/[0.04] text-left text-[0.55em] uppercase tracking-widest text-white/40">
            <th className="px-[1.2em] py-[0.7em] font-bold">#</th>
            <th className="px-[1.2em] py-[0.7em] font-bold">Team</th>
            <th className="px-[0.8em] py-[0.7em] text-center font-bold">W</th>
            <th className="px-[0.8em] py-[0.7em] text-center font-bold">L</th>
            <th className="px-[0.8em] py-[0.7em] text-center font-bold">Diff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const qualifies = division.phase !== 'complete' && r.seed <= division.advanceCount
            return (
              <tr
                key={r.team.id}
                className={`border-t border-white/5 ${qualifies ? 'bg-lu-green/15' : ''}`}
              >
                <td className="px-[1.2em] py-[0.6em]">
                  <span
                    className={`grid h-[1.7em] w-[1.7em] place-items-center rounded-full text-[0.6em] font-extrabold ${
                      qualifies ? 'bg-lu-green text-white' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {r.seed}
                  </span>
                </td>
                <td className="px-[1.2em] py-[0.6em] font-bold text-white">
                  {medalOf(r.team.id) && <span className="mr-2">{medalOf(r.team.id)}</span>}
                  {teamLabel(r.team)}
                </td>
                <td className="px-[0.8em] py-[0.6em] text-center font-extrabold tabular-nums text-white">
                  {r.wins}
                </td>
                <td className="px-[0.8em] py-[0.6em] text-center tabular-nums text-white/55">
                  {r.losses}
                </td>
                <td
                  className={`px-[0.8em] py-[0.6em] text-center font-bold tabular-nums ${
                    r.pointDiff > 0 ? 'text-lu-green-light' : r.pointDiff < 0 ? 'text-red-400' : 'text-white/50'
                  }`}
                >
                  {r.pointDiff > 0 ? `+${r.pointDiff}` : r.pointDiff}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TvMatch({ division, match }: { division: Division; match: Match }) {
  const res = evaluateMatch(match)
  const rowFor = (slot: 'A' | 'B') => {
    const id = slot === 'A' ? match.teamAId : match.teamBId
    const team = teamById(division, id)
    const seed = slot === 'A' ? match.seedA : match.seedB
    const name = team ? teamLabel(team) : seed ? `Seed ${seed}` : 'TBD'
    const win = res.winnerSlot === slot
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-lg px-[0.8em] py-[0.45em] ${
          win ? 'bg-lu-green/20' : ''
        }`}
      >
        <span className={`truncate ${win ? 'font-extrabold text-lu-green-light' : 'text-white/85'}`}>
          {win && '🏆 '}
          {name}
        </span>
        <span className="flex gap-2 tabular-nums">
          {match.games.map((g, i) => (
            <span
              key={i}
              className={`min-w-[1.1em] text-center ${win ? 'font-extrabold text-white' : 'text-white/55'}`}
            >
              {slot === 'A' ? g.a : g.b}
            </span>
          ))}
        </span>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-[0.7em]">
      <div className="mb-[0.4em] text-[0.55em] font-bold uppercase tracking-widest text-white/40">
        {match.label || 'Match'}
      </div>
      {rowFor('A')}
      {rowFor('B')}
    </div>
  )
}

function BigBracket({ division }: { division: Division }) {
  const sf = division.bracket.filter((m) => m.stage === 'sf')
  const final = division.bracket.find((m) => m.stage === 'final')
  const bronze = division.bracket.find((m) => m.stage === 'bronze')
  const medals = medalists(division.bracket)
  const podium = [
    { icon: '🥇', id: medals.gold },
    { icon: '🥈', id: medals.silver },
    { icon: '🥉', id: medals.bronze },
  ]
  const anyMedal = medals.gold || medals.silver || medals.bronze

  return (
    <div className="grid grid-cols-3 gap-[1.5vw] text-[1.05em]">
      <div className="space-y-[1vh]">
        <h3 className="text-[0.6em] font-bold uppercase tracking-widest text-white/40">Semifinals</h3>
        {sf.map((m) => (
          <TvMatch key={m.id} division={division} match={m} />
        ))}
      </div>
      <div className="space-y-[1vh]">
        <h3 className="text-[0.6em] font-bold uppercase tracking-widest text-white/40">Medal Matches</h3>
        {final && <TvMatch division={division} match={final} />}
        {bronze && <TvMatch division={division} match={bronze} />}
      </div>
      <div>
        <h3 className="mb-[1vh] text-[0.6em] font-bold uppercase tracking-widest text-white/40">
          Medalists
        </h3>
        {anyMedal ? (
          <div className="space-y-[0.8em] rounded-2xl border border-lu-green/30 bg-lu-green/10 p-[1em]">
            {podium.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[1.6em]">{p.icon}</span>
                <span className="font-bold text-white">
                  {p.id ? teamLabel(teamById(division, p.id)) : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[0.7em] text-white/40">Medal matches in progress…</p>
        )}
      </div>
    </div>
  )
}

function TvPicker() {
  const state = useTournament()
  if (!state) return null
  return (
    <div className="px-[3vw] py-[3vh]">
      <h2 className="mb-[2vh] text-[1.4em] font-extrabold text-white">Choose a display</h2>
      <div className="grid grid-cols-2 gap-[1.5vw] lg:grid-cols-3">
        {state.divisions.map((d) => (
          <Link
            key={d.id}
            to={`/tv/${d.id}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-[1.4em] transition hover:border-lu-green hover:bg-lu-green/10"
          >
            <div className="text-[0.6em] font-semibold uppercase tracking-widest text-white/40">
              {d.event}
            </div>
            <div className="text-[1.3em] font-extrabold text-white">{d.name}</div>
            <div className="mt-1 text-[0.7em] text-white/50">
              {d.teams.length} {d.discipline === 'doubles' ? 'teams' : 'players'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function TvDisplay() {
  useBigScreenScale()
  const { divisionId } = useParams()
  const state = useTournament()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b140e] to-[#0f1a14] text-white">
      <TvHeader
        subtitle={
          divisionId && state
            ? (() => {
                const d = state.divisions.find((x) => x.id === divisionId)
                return d ? `${d.event} ${d.name}` : undefined
              })()
            : undefined
        }
      />

      {!divisionId ? (
        <TvPicker />
      ) : !state ? (
        <div className="grid place-items-center py-[20vh] text-white/40">Loading…</div>
      ) : (
        (() => {
          const division = state.divisions.find((d) => d.id === divisionId)
          if (!division)
            return (
              <div className="grid place-items-center py-[20vh] text-white/50">
                Division not found.{' '}
                <Link to="/tv" className="ml-2 text-lu-green-light underline">
                  Pick another
                </Link>
              </div>
            )
          const showBracket = division.phase === 'playoffs' || division.phase === 'complete'
          if (division.teams.length === 0)
            return (
              <div className="grid place-items-center py-[20vh] text-[1.2em] text-white/40">
                Bracket coming soon
              </div>
            )
          return (
            <div className="px-[2vw] py-[2vh]">
              {showBracket ? (
                <div className="space-y-[2.5vh]">
                  <BigBracket division={division} />
                  <div>
                    <h3 className="mb-[1vh] text-[0.6em] font-bold uppercase tracking-widest text-white/40">
                      Round Robin Standings
                    </h3>
                    <BigStandings division={division} />
                  </div>
                </div>
              ) : (
                <BigStandings division={division} />
              )}
            </div>
          )
        })()
      )}
    </div>
  )
}
