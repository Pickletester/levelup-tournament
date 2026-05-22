export interface Court {
  id: string
  /** display name, e.g. "Court 1" */
  name: string
  teamA: string
  teamB: string
  /** match time, free text e.g. "2:30 PM" */
  time?: string
  /** optional note, e.g. "Men's Doubles 4.0" */
  note?: string
}

export interface BracketMatch {
  id: string
  /** 0 = first round */
  round: number
  /** position within the round */
  index: number
  /** name in the top slot (null = empty / bye / TBD) */
  a: string | null
  /** name in the bottom slot */
  b: string | null
  /** the winning name — must equal `a` or `b` */
  winner: string | null
}

export interface Bracket {
  title: string
  participants: string[]
  matches: BracketMatch[]
  built: boolean
}

export interface TournamentMeta {
  id: string
  name: string
  subtitle: string
  location: string
}

export interface TournamentState {
  meta: TournamentMeta
  bracket: Bracket
  courts: Court[]
}
