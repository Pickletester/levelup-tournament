import { useEffect, useState } from 'react'
import { useTournament } from '../lib/store'
import { champion } from '../lib/tournament'
import { BracketView } from '../components/BracketView'
import { BoardGrid } from './CourtsBoard'

const INTERVAL = 30 // seconds between auto switches

type View = 'bracket' | 'courts'

function useBigScreenScale() {
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.fontSize
    const apply = () => {
      root.style.fontSize = `${Math.max(14, Math.min(46, window.innerWidth / 95))}px`
    }
    apply()
    window.addEventListener('resize', apply)
    return () => {
      root.style.fontSize = prev
      window.removeEventListener('resize', apply)
    }
  }, [])
}

export function TvScreen() {
  useBigScreenScale()
  const state = useTournament()
  const [view, setView] = useState<View>('courts')
  const [auto, setAuto] = useState(false)
  const [left, setLeft] = useState(INTERVAL)

  // tick down once per second while auto-rotating
  useEffect(() => {
    if (!auto) {
      setLeft(INTERVAL)
      return
    }
    const id = setInterval(() => setLeft((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [auto])

  // when the countdown runs out, flip the view and reset
  useEffect(() => {
    if (auto && left <= 0) {
      setView((v) => (v === 'bracket' ? 'courts' : 'bracket'))
      setLeft(INTERVAL)
    }
  }, [left, auto])

  if (!state) return null
  const { bracket, courts } = state
  const champ = champion(bracket.matches)

  const title = view === 'bracket' ? bracket.title || 'Tournament Bracket' : 'Court Assignments'
  const nextView: View = view === 'bracket' ? 'courts' : 'bracket'
  const nextLabel = nextView === 'bracket' ? 'Bracket' : 'Courts'

  const tabBtn = (v: View) =>
    `rounded-lg px-[0.7em] py-[0.35em] text-[0.6em] font-bold uppercase tracking-widest transition ${
      view === v && !auto
        ? 'bg-lu-green text-white'
        : 'border border-white/15 text-white/60 hover:text-white'
    }`

  return (
    <div className="relative flex h-screen flex-col bg-gradient-to-br from-[#0b140e] to-[#0f1a14] text-white">
      {/* countdown progress bar */}
      {auto && (
        <div
          className="absolute left-0 top-0 z-10 h-[4px] bg-lu-green transition-[width] duration-1000 ease-linear"
          style={{ width: `${(left / INTERVAL) * 100}%` }}
        />
      )}

      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-[2vw] py-[1.2vh]">
        <div className="leading-none">
          <div className="text-[1.1em] font-extrabold tracking-tight text-white">{title}</div>
          <div className="text-[0.55em] font-semibold uppercase tracking-[0.25em] text-white/45">
            {state.meta.name}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view === 'bracket' && champ && (
            <span className="rounded-full bg-lu-green/15 px-3 py-1 text-[0.65em] font-bold text-lu-green-light">
              🏆 {champ}
            </span>
          )}

          {/* auto countdown pill */}
          {auto && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.6em] font-bold uppercase tracking-widest text-white/80">
              → {nextLabel} in 0:{String(Math.max(0, left)).padStart(2, '0')}
            </span>
          )}

          {/* view controls */}
          <button onClick={() => { setView('bracket'); setAuto(false) }} className={tabBtn('bracket')}>
            Bracket
          </button>
          <button onClick={() => { setView('courts'); setAuto(false) }} className={tabBtn('courts')}>
            Courts
          </button>
          <button
            onClick={() => setAuto((a) => !a)}
            className={`rounded-lg px-[0.7em] py-[0.35em] text-[0.6em] font-bold uppercase tracking-widest transition ${
              auto ? 'bg-lu-green text-white' : 'border border-white/15 text-white/60 hover:text-white'
            }`}
          >
            ⟳ Auto
          </button>

          <span className="inline-flex items-center gap-2 rounded-full bg-lu-green/15 px-2.5 py-0.5 text-[0.55em] font-bold uppercase tracking-widest text-lu-green-light">
            <span className="lu-live-dot h-[0.5em] w-[0.5em] rounded-full bg-lu-green-light" />
            Live
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {view === 'courts' ? (
          <BoardGrid courts={courts} editable={false} />
        ) : bracket.built ? (
          <div className="h-full overflow-auto p-[2vw]">
            <BracketView matches={bracket.matches} variant="tv" />
          </div>
        ) : (
          <div className="grid h-full place-items-center text-[1.2em] text-white/40">
            Bracket coming soon
          </div>
        )}
      </div>
    </div>
  )
}
