import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTournament } from '../lib/store'
import { champion } from '../lib/tournament'
import { BracketView } from '../components/BracketView'

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

export function TvDisplay() {
  useBigScreenScale()
  const state = useTournament()
  if (!state) return null
  const { bracket } = state
  const champ = champion(bracket.matches)

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-[#0b140e] to-[#0f1a14] text-white">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-[2vw] py-[1.2vh]">
        <div className="leading-none">
          <div className="text-[1.1em] font-extrabold tracking-tight text-white">
            {bracket.title || 'Tournament Bracket'}
          </div>
          <div className="text-[0.55em] font-semibold uppercase tracking-[0.25em] text-white/45">
            {state.meta.name}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {champ && (
            <span className="rounded-full bg-lu-green/15 px-3 py-1 text-[0.7em] font-bold text-lu-green-light">
              🏆 {champ}
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-lu-green/15 px-2.5 py-0.5 text-[0.55em] font-bold uppercase tracking-widest text-lu-green-light">
            <span className="lu-live-dot h-[0.5em] w-[0.5em] rounded-full bg-lu-green-light" />
            Live
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-[2vw]">
        {bracket.built ? (
          <BracketView matches={bracket.matches} variant="tv" />
        ) : (
          <div className="grid h-full place-items-center text-[1.2em] text-white/40">
            Bracket coming soon
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 px-[2vw] py-[0.8vh] text-center text-[0.55em] uppercase tracking-widest text-white/30">
        <Link to="/courts" className="hover:text-white/60">
          Court assignments →
        </Link>
      </footer>
    </div>
  )
}
