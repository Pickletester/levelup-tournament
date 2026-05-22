import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearCourt, updateCourt } from '../lib/actions'
import { useAdmin } from '../lib/admin'
import { useTournament } from '../lib/store'
import type { Court } from '../lib/types'
import { AdminButton } from '../components/AdminButton'

/** Scale the whole page so the board reads from across a room. */
function useBigScreenScale() {
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.fontSize
    const apply = () => {
      root.style.fontSize = `${Math.max(13, Math.min(46, window.innerWidth / 105))}px`
    }
    apply()
    window.addEventListener('resize', apply)
    return () => {
      root.style.fontSize = prev
      window.removeEventListener('resize', apply)
    }
  }, [])
}

function CourtTile({ court, editable }: { court: Court; editable: boolean }) {
  const [teamA, setTeamA] = useState(court.teamA)
  const [teamB, setTeamB] = useState(court.teamB)
  const [time, setTime] = useState(court.time ?? '')
  const [note, setNote] = useState(court.note ?? '')
  const empty = !court.teamA && !court.teamB

  const teamInput =
    'w-full rounded-md bg-white/5 px-2 py-[0.15em] text-center text-[1.05em] font-bold text-white placeholder-white/25 outline-none focus:bg-white/12'

  return (
    <div className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-[0.9em]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[1.35em] font-extrabold leading-none text-white">{court.name}</span>
        {editable ? (
          <input
            value={time}
            placeholder="time"
            onChange={(e) => {
              setTime(e.target.value)
              updateCourt(court.id, { time: e.target.value })
            }}
            className="w-[5.5em] rounded-md bg-lu-green/15 px-2 py-[0.1em] text-right text-[0.7em] font-bold text-lu-green-light placeholder-lu-green-light/40 outline-none focus:bg-lu-green/25"
          />
        ) : (
          court.time && (
            <span className="rounded-md bg-lu-green/15 px-2 py-[0.1em] text-[0.7em] font-bold text-lu-green-light">
              {court.time}
            </span>
          )
        )}
      </div>

      {/* note line */}
      {editable ? (
        <input
          value={note}
          placeholder="note (e.g. Men's Doubles 4.0)"
          onChange={(e) => {
            setNote(e.target.value)
            updateCourt(court.id, { note: e.target.value })
          }}
          className="mt-[0.2em] w-full bg-transparent text-[0.58em] font-semibold uppercase tracking-widest text-white/55 placeholder-white/20 outline-none"
        />
      ) : (
        court.note && (
          <div className="truncate text-[0.58em] font-semibold uppercase tracking-widest text-white/40">
            {court.note}
          </div>
        )
      )}

      {editable ? (
        <div className="mt-[0.45em] flex flex-1 flex-col justify-center gap-[0.25em]">
          <input
            value={teamA}
            placeholder="Team / player"
            onChange={(e) => {
              setTeamA(e.target.value)
              updateCourt(court.id, { teamA: e.target.value })
            }}
            className={teamInput}
          />
          <div className="text-center text-[0.55em] font-bold uppercase tracking-widest text-lu-green-light">
            vs
          </div>
          <input
            value={teamB}
            placeholder="Team / player"
            onChange={(e) => {
              setTeamB(e.target.value)
              updateCourt(court.id, { teamB: e.target.value })
            }}
            className={teamInput}
          />
        </div>
      ) : empty ? (
        <div className="grid flex-1 place-items-center text-[0.8em] font-bold uppercase tracking-[0.3em] text-white/20">
          Open
        </div>
      ) : (
        <div className="mt-[0.45em] flex flex-1 flex-col justify-center gap-[0.15em] text-center">
          <div className="text-[1.15em] font-bold leading-tight text-white">{court.teamA || '—'}</div>
          <div className="text-[0.58em] font-bold uppercase tracking-widest text-lu-green-light">vs</div>
          <div className="text-[1.15em] font-bold leading-tight text-white">{court.teamB || '—'}</div>
        </div>
      )}

      {editable && (court.teamA || court.teamB || court.time || court.note) && (
        <button
          onClick={() => {
            clearCourt(court.id)
            setTeamA('')
            setTeamB('')
            setTime('')
            setNote('')
          }}
          className="absolute bottom-[0.5em] right-[0.7em] text-[0.5em] font-bold uppercase tracking-widest text-white/30 hover:text-red-400"
        >
          clear
        </button>
      )}
    </div>
  )
}

export function BoardGrid({ courts, editable }: { courts: Court[]; editable: boolean }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-[0.9vw] overflow-y-auto p-[1.2vw] sm:grid-cols-3 md:grid-cols-4 md:grid-rows-4 md:overflow-hidden">
      {courts.map((c) => (
        <CourtTile key={c.id} court={c} editable={editable} />
      ))}
    </div>
  )
}

function BoardHeader({
  title,
  right,
}: {
  title: string
  right?: React.ReactNode
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 px-[2vw] py-[1.2vh]">
      <div className="leading-none">
        <div className="text-[1em] font-extrabold tracking-tight text-white">
          Three Rivers Championship
        </div>
        <div className="text-[0.55em] font-semibold uppercase tracking-[0.25em] text-white/45">
          LevelUp Pickleball Club
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[1.25em] font-extrabold leading-none text-white">{title}</div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-lu-green/15 px-2.5 py-0.5 text-[0.55em] font-bold uppercase tracking-widest text-lu-green-light">
            <span className="lu-live-dot h-[0.5em] w-[0.5em] rounded-full bg-lu-green-light" />
            Live
          </div>
        </div>
        {right}
      </div>
    </header>
  )
}

/** TV display — read only, fills the screen. */
export function TvCourts() {
  useBigScreenScale()
  const state = useTournament()
  const courts = state?.courts ?? []
  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-[#0b140e] to-[#0f1a14] text-white">
      <BoardHeader title="Court Assignments" />
      <BoardGrid courts={courts} editable={false} />
    </div>
  )
}

/** Editor — same dark board, but tap a tile to type who's on each court. */
export function CourtsPage() {
  useBigScreenScale()
  const state = useTournament()
  const admin = useAdmin()
  const courts = state?.courts ?? []

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-[#0b140e] to-[#0f1a14] text-white">
      <BoardHeader
        title="Court Assignments"
        right={
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[0.6em] font-semibold text-white/70 hover:border-white/40 hover:text-white"
            >
              ← Bracket
            </Link>
            <Link
              to="/tv/courts"
              target="_blank"
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[0.6em] font-semibold text-white/70 hover:border-white/40 hover:text-white"
            >
              📺 TV
            </Link>
            <AdminButton />
          </div>
        }
      />
      {!admin && (
        <div className="bg-white/[0.04] px-[2vw] py-[0.8vh] text-center text-[0.7em] text-white/55">
          Tap <span className="font-bold text-white">Admin</span> (passcode) to edit who's on each court.
        </div>
      )}
      <BoardGrid courts={courts} editable={admin} />
    </div>
  )
}
