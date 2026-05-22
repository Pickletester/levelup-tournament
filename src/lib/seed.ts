import type { Court, TournamentState } from './types'

/** A clean, empty starting state — no demo data. */
export function buildSeed(): TournamentState {
  const courts: Court[] = Array.from({ length: 16 }, (_, i) => ({
    id: `court-${i + 1}`,
    name: `Court ${i + 1}`,
    teamA: '',
    teamB: '',
    time: '',
    note: '',
  }))

  return {
    meta: {
      id: 'three-rivers-2026',
      name: 'Three Rivers Championship',
      subtitle: '2026',
      location: 'LevelUp Pickleball Club · Canonsburg, PA',
    },
    bracket: {
      title: '',
      participants: [],
      matches: [],
      built: false,
    },
    courts,
  }
}
