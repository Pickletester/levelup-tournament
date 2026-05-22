export type Discipline = 'singles' | 'doubles'

export type Phase = 'setup' | 'roundRobin' | 'playoffs' | 'complete'

export type MatchStage = 'rr' | 'sf' | 'final' | 'bronze'

export type Slot = 'A' | 'B'

export interface Team {
  id: string
  /** 1 name for singles, 2 for doubles */
  players: string[]
  /** optional DUPR / display rating */
  rating?: string
}

export interface GameScore {
  a: number
  b: number
}

export interface BracketFeed {
  matchId: string
  slot: Slot
}

export interface Match {
  id: string
  stage: MatchStage
  /** display label, e.g. "Semifinal 1", "Gold Medal Match" */
  label?: string
  teamAId: string | null
  teamBId: string | null
  /** seed numbers shown for TBD playoff slots, e.g. "Seed 1" */
  seedA?: number
  seedB?: number
  games: GameScore[]
  /** points needed to take a game */
  target: number
  /** must win by this margin */
  winBy: number
  /** 1 = single game, 3 = best of 3 */
  bestOf: number
  /** where the winner of this match advances */
  winnerTo?: BracketFeed
  /** where the loser of this match goes (bronze match) */
  loserTo?: BracketFeed
}

export interface Division {
  id: string
  /** event grouping, e.g. "Men's Doubles" */
  event: string
  /** division label within the event, e.g. "4.0" or "50+ 3.5" */
  name: string
  discipline: Discipline
  teams: Team[]
  rrMatches: Match[]
  bracket: Match[]
  phase: Phase
  /** round-robin & pre-medal target score */
  rrTarget: number
  /** medal match target score */
  medalTarget: number
  /** medal match games (best of N) */
  medalBestOf: number
  /** how many teams advance to playoffs */
  advanceCount: number
  updatedAt: number
}

export interface Court {
  id: string
  /** display name, e.g. "Court 1" */
  name: string
  /** free-text: team/player on side A */
  teamA: string
  /** free-text: team/player on side B */
  teamB: string
  /** optional note, e.g. "Men's Doubles 4.0" or "Round 2" */
  note?: string
}

export interface TournamentMeta {
  id: string
  name: string
  subtitle: string
  location: string
  dates: string
  ball: string
  /** ordered event names for navigation */
  events: string[]
}

export interface TournamentState {
  meta: TournamentMeta
  divisions: Division[]
  courts: Court[]
}
