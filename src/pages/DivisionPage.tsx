import { Link, useNavigate, useParams } from 'react-router-dom'
import { removeDivision } from '../lib/actions'
import { useAdmin } from '../lib/admin'
import { useTournament } from '../lib/store'
import { medalists } from '../lib/tournament'
import { AdminControls } from '../components/AdminControls'
import { Bracket } from '../components/Bracket'
import { MatchCard } from '../components/MatchCard'
import { PhaseChip } from '../components/chips'
import { StandingsTable } from '../components/StandingsTable'

export function DivisionPage() {
  const { divisionId } = useParams()
  const state = useTournament()
  const admin = useAdmin()
  const navigate = useNavigate()

  if (!state) return null
  const division = state.divisions.find((d) => d.id === divisionId)

  if (!division) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink/50">Division not found.</p>
        <Link to="/" className="mt-3 inline-block font-semibold text-lu-green-deep">
          ← Back to tournament
        </Link>
      </div>
    )
  }

  const showBracket =
    division.phase === 'playoffs' || division.phase === 'complete'
  const medals = medalists(division.bracket)
  const medalByTeam: Record<string, 'gold' | 'silver' | 'bronze'> = {}
  if (medals.gold) medalByTeam[medals.gold] = 'gold'
  if (medals.silver) medalByTeam[medals.silver] = 'silver'
  if (medals.bronze) medalByTeam[medals.bronze] = 'bronze'

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="text-sm font-semibold text-ink/50 hover:text-lu-green-deep"
        >
          ← {state.meta.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
            {division.event}{' '}
            <span className="text-lu-green-deep">{division.name}</span>
          </h1>
          <PhaseChip phase={division.phase} />
          <span className="text-sm text-ink/45">
            {division.discipline === 'doubles' ? 'Doubles' : 'Singles'}
          </span>
          <Link
            to={`/tv/${division.id}`}
            target="_blank"
            className="ml-auto rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
          >
            📺 TV view
          </Link>
        </div>
      </div>

      {admin && (
        <div className="space-y-3">
          <AdminControls division={division} />
          <button
            onClick={() => {
              if (confirm(`Delete "${division.event} ${division.name}"? This cannot be undone.`)) {
                removeDivision(division.id)
                navigate('/')
              }
            }}
            className="text-xs font-semibold text-red-400 hover:text-red-600"
          >
            Delete this division
          </button>
        </div>
      )}

      {division.teams.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-card p-10 text-center text-ink/45">
          No teams yet.{' '}
          {admin
            ? 'Add teams above to generate the round-robin schedule.'
            : 'Check back soon — the bracket will appear once teams are entered.'}
        </p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">Standings</h2>
            <StandingsTable division={division} medalByTeam={medalByTeam} />
          </section>

          {showBracket && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-ink">Playoffs</h2>
              <Bracket division={division} admin={admin} />
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold text-ink">
              Round Robin
              <span className="ml-2 text-sm font-normal text-ink/40">
                {division.rrMatches.length} matches
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {division.rrMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  division={division}
                  match={m}
                  admin={admin && !showBracket}
                />
              ))}
            </div>
            {showBracket && (
              <p className="mt-2 text-xs text-ink/40">
                Round-robin scores are locked during playoffs. Use “Back to round
                robin” to edit.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
