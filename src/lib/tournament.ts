import type {
  Division,
  GameScore,
  Match,
  MatchStage,
  Team,
} from './types'

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`
}

export function teamLabel(team: Team | undefined): string {
  if (!team) return 'TBD'
  const names = team.players.map((p) => p.trim()).filter(Boolean)
  if (names.length === 0) return 'Unnamed'
  return names.join(' / ')
}

export function teamById(
  division: Division,
  id: string | null,
): Team | undefined {
  if (!id) return undefined
  return division.teams.find((t) => t.id === id)
}

/* ----------------------------- match scoring ---------------------------- */

export function isGameComplete(g: GameScore, target: number, winBy: number): boolean {
  return Math.max(g.a, g.b) >= target && Math.abs(g.a - g.b) >= winBy
}

export function gameWinnerSlot(
  g: GameScore,
  target: number,
  winBy: number,
): 'A' | 'B' | null {
  if (!isGameComplete(g, target, winBy)) return null
  return g.a > g.b ? 'A' : 'B'
}

export interface MatchResult {
  status: 'pending' | 'live' | 'final'
  gamesA: number
  gamesB: number
  winnerSlot: 'A' | 'B' | null
  winnerId: string | null
  loserId: string | null
}

export function evaluateMatch(m: Match): MatchResult {
  let gamesA = 0
  let gamesB = 0
  let anyScore = false
  for (const g of m.games) {
    if (g.a > 0 || g.b > 0) anyScore = true
    const w = gameWinnerSlot(g, m.target, m.winBy)
    if (w === 'A') gamesA++
    else if (w === 'B') gamesB++
  }
  const needed = Math.floor(m.bestOf / 2) + 1
  let winnerSlot: 'A' | 'B' | null = null
  if (gamesA >= needed) winnerSlot = 'A'
  else if (gamesB >= needed) winnerSlot = 'B'

  const hasBothTeams = !!m.teamAId && !!m.teamBId
  let status: MatchResult['status'] = 'pending'
  if (winnerSlot) status = 'final'
  else if (anyScore && hasBothTeams) status = 'live'

  const winnerId =
    winnerSlot === 'A' ? m.teamAId : winnerSlot === 'B' ? m.teamBId : null
  const loserId =
    winnerSlot === 'A' ? m.teamBId : winnerSlot === 'B' ? m.teamAId : null

  return { status, gamesA, gamesB, winnerSlot, winnerId, loserId }
}

/** Total points scored by each slot across all games. */
export function matchPoints(m: Match): { a: number; b: number } {
  return m.games.reduce(
    (acc, g) => ({ a: acc.a + g.a, b: acc.b + g.b }),
    { a: 0, b: 0 },
  )
}

/* --------------------------- round robin build -------------------------- */

const BYE = '__BYE__'

function makeMatch(
  stage: MatchStage,
  teamAId: string | null,
  teamBId: string | null,
  target: number,
  bestOf: number,
  extra: Partial<Match> = {},
): Match {
  const games: GameScore[] = Array.from({ length: bestOf }, () => ({ a: 0, b: 0 }))
  return {
    id: uid('m'),
    stage,
    teamAId,
    teamBId,
    games,
    target,
    winBy: 2,
    bestOf,
    ...extra,
  }
}

/** Circle-method round robin: every team plays every other team once. */
export function generateRoundRobin(teams: Team[], target: number): Match[] {
  const ids = teams.map((t) => t.id)
  if (ids.length < 2) return []
  if (ids.length % 2 === 1) ids.push(BYE)
  const n = ids.length
  const arr = [...ids]
  const matches: Match[] = []
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i]
      const b = arr[n - 1 - i]
      if (a !== BYE && b !== BYE) {
        matches.push(makeMatch('rr', a, b, target, 1))
      }
    }
    // rotate everything except the first element
    const rest = arr.slice(1)
    rest.unshift(rest.pop() as string)
    arr.splice(1, arr.length - 1, ...rest)
  }
  return matches
}

/* ------------------------------ standings ------------------------------- */

export interface StandingRow {
  team: Team
  played: number
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  seed: number
}

export function computeStandings(division: Division): StandingRow[] {
  const base = new Map<
    string,
    Omit<StandingRow, 'seed'>
  >()
  for (const t of division.teams) {
    base.set(t.id, {
      team: t,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
    })
  }

  for (const m of division.rrMatches) {
    const res = evaluateMatch(m)
    if (res.status !== 'final') continue
    const a = base.get(m.teamAId as string)
    const b = base.get(m.teamBId as string)
    if (!a || !b) continue
    const pts = matchPoints(m)
    a.played++
    b.played++
    a.pointsFor += pts.a
    a.pointsAgainst += pts.b
    b.pointsFor += pts.b
    b.pointsAgainst += pts.a
    if (res.winnerId === a.team.id) {
      a.wins++
      b.losses++
    } else {
      b.wins++
      a.losses++
    }
  }

  for (const row of base.values()) {
    row.pointDiff = row.pointsFor - row.pointsAgainst
  }

  // head-to-head lookup for two-way ties
  const headToHead = (x: string, y: string): number => {
    for (const m of division.rrMatches) {
      const res = evaluateMatch(m)
      if (res.status !== 'final') continue
      const ids = [m.teamAId, m.teamBId]
      if (ids.includes(x) && ids.includes(y)) {
        if (res.winnerId === x) return -1 // x ranks ahead
        if (res.winnerId === y) return 1
      }
    }
    return 0
  }

  const rows = [...base.values()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    const h2h = headToHead(a.team.id, b.team.id)
    if (h2h !== 0) return h2h
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
    return b.pointsFor - a.pointsFor
  })

  return rows.map((r, i) => ({ ...r, seed: i + 1 }))
}

/* ------------------------------- bracket -------------------------------- */

/** Build a 4-team single-elim playoff (SF1/SF2 -> Gold + Bronze). */
export function buildBracket(division: Division, seededTeamIds: (string | null)[]): Match[] {
  const [s1 = null, s2 = null, s3 = null, s4 = null] = seededTeamIds

  const finalId = uid('m')
  const bronzeId = uid('m')

  const sf1 = makeMatch('sf', s1, s4, division.rrTarget, 1, {
    label: 'Semifinal 1',
    seedA: 1,
    seedB: 4,
    winnerTo: { matchId: finalId, slot: 'A' },
    loserTo: { matchId: bronzeId, slot: 'A' },
  })
  const sf2 = makeMatch('sf', s2, s3, division.rrTarget, 1, {
    label: 'Semifinal 2',
    seedA: 2,
    seedB: 3,
    winnerTo: { matchId: finalId, slot: 'B' },
    loserTo: { matchId: bronzeId, slot: 'B' },
  })
  const final: Match = {
    ...makeMatch('final', null, null, division.medalTarget, division.medalBestOf),
    id: finalId,
    label: 'Gold Medal Match',
  }
  const bronze: Match = {
    ...makeMatch('bronze', null, null, division.medalTarget, division.medalBestOf),
    id: bronzeId,
    label: 'Bronze Medal Match',
  }

  return [sf1, sf2, final, bronze]
}

/** Recompute Gold/Bronze participants from semifinal results. */
export function propagateBracket(bracket: Match[]): Match[] {
  const byId = new Map(bracket.map((m) => [m.id, { ...m }]))

  // reset downstream slots that are fed by other matches
  for (const m of byId.values()) {
    if (m.stage === 'final' || m.stage === 'bronze') {
      m.teamAId = null
      m.teamBId = null
    }
  }

  for (const m of bracket) {
    const res = evaluateMatch(m)
    if (m.winnerTo && res.winnerId) {
      const target = byId.get(m.winnerTo.matchId)
      if (target)
        target[m.winnerTo.slot === 'A' ? 'teamAId' : 'teamBId'] = res.winnerId
    }
    if (m.loserTo && res.loserId) {
      const target = byId.get(m.loserTo.matchId)
      if (target)
        target[m.loserTo.slot === 'A' ? 'teamAId' : 'teamBId'] = res.loserId
    }
  }

  return bracket.map((m) => byId.get(m.id) as Match)
}

export interface Medalists {
  gold?: string
  silver?: string
  bronze?: string
}

export function medalists(bracket: Match[]): Medalists {
  const result: Medalists = {}
  const final = bracket.find((m) => m.stage === 'final')
  const bronze = bracket.find((m) => m.stage === 'bronze')
  if (final) {
    const r = evaluateMatch(final)
    if (r.status === 'final') {
      result.gold = r.winnerId ?? undefined
      result.silver = r.loserId ?? undefined
    }
  }
  if (bronze) {
    const r = evaluateMatch(bronze)
    if (r.status === 'final') result.bronze = r.winnerId ?? undefined
  }
  return result
}
