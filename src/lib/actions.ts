import { mutate } from './store'
import {
  buildBracket,
  computeStandings,
  generateRoundRobin,
  propagateBracket,
  uid,
} from './tournament'
import type { Discipline, Division, Match } from './types'

function editDivision(divId: string, fn: (d: Division) => void) {
  return mutate((draft) => {
    const d = draft.divisions.find((x) => x.id === divId)
    if (!d) return
    fn(d)
    d.updatedAt = Date.now()
  })
}

function findMatch(d: Division, matchId: string): Match | undefined {
  return (
    d.rrMatches.find((m) => m.id === matchId) ||
    d.bracket.find((m) => m.id === matchId)
  )
}

/* --------------------------------- teams -------------------------------- */

export function addTeam(divId: string, players: string[]) {
  return editDivision(divId, (d) => {
    d.teams.push({ id: uid('t'), players })
    // schedule is stale once roster changes
    if (d.phase === 'roundRobin' || d.phase === 'setup') {
      d.rrMatches = d.teams.length >= 2 ? generateRoundRobin(d.teams, d.rrTarget) : []
      d.phase = d.teams.length >= 2 ? 'roundRobin' : 'setup'
    }
  })
}

export function updateTeam(divId: string, teamId: string, players: string[]) {
  return editDivision(divId, (d) => {
    const t = d.teams.find((x) => x.id === teamId)
    if (t) t.players = players
  })
}

export function removeTeam(divId: string, teamId: string) {
  return editDivision(divId, (d) => {
    d.teams = d.teams.filter((t) => t.id !== teamId)
    if (d.phase !== 'complete') {
      d.rrMatches = d.teams.length >= 2 ? generateRoundRobin(d.teams, d.rrTarget) : []
      d.bracket = []
      d.phase = d.teams.length >= 2 ? 'roundRobin' : 'setup'
    }
  })
}

/* -------------------------------- scoring ------------------------------- */

export function setScore(
  divId: string,
  matchId: string,
  gameIndex: number,
  slot: 'a' | 'b',
  value: number,
) {
  return editDivision(divId, (d) => {
    const m = findMatch(d, matchId)
    if (!m || !m.games[gameIndex]) return
    m.games[gameIndex][slot] = Math.max(0, Math.round(value) || 0)
    if (d.bracket.some((x) => x.id === matchId)) {
      d.bracket = propagateBracket(d.bracket)
    }
  })
}

export function adjustScore(
  divId: string,
  matchId: string,
  gameIndex: number,
  slot: 'a' | 'b',
  delta: number,
) {
  return editDivision(divId, (d) => {
    const m = findMatch(d, matchId)
    if (!m || !m.games[gameIndex]) return
    m.games[gameIndex][slot] = Math.max(0, m.games[gameIndex][slot] + delta)
    if (d.bracket.some((x) => x.id === matchId)) {
      d.bracket = propagateBracket(d.bracket)
    }
  })
}

export function clearMatch(divId: string, matchId: string) {
  return editDivision(divId, (d) => {
    const m = findMatch(d, matchId)
    if (!m) return
    m.games = m.games.map(() => ({ a: 0, b: 0 }))
    if (d.bracket.some((x) => x.id === matchId)) {
      d.bracket = propagateBracket(d.bracket)
    }
  })
}

/* --------------------------------- phases ------------------------------- */

export function regenerateRoundRobin(divId: string) {
  return editDivision(divId, (d) => {
    d.rrMatches = d.teams.length >= 2 ? generateRoundRobin(d.teams, d.rrTarget) : []
    d.bracket = []
    d.phase = d.teams.length >= 2 ? 'roundRobin' : 'setup'
  })
}

export function startPlayoffs(divId: string) {
  return editDivision(divId, (d) => {
    const standings = computeStandings(d)
    const seeds = standings
      .slice(0, d.advanceCount)
      .map((s) => s.team.id as string | null)
    while (seeds.length < 4) seeds.push(null)
    d.bracket = buildBracket(d, seeds)
    d.phase = 'playoffs'
  })
}

export function backToRoundRobin(divId: string) {
  return editDivision(divId, (d) => {
    d.bracket = []
    d.phase = 'roundRobin'
  })
}

/* ------------------------------- divisions ------------------------------ */

export function addDivision(event: string, name: string, discipline: Discipline) {
  return mutate((draft) => {
    draft.divisions.push({
      id: uid('div'),
      event,
      name,
      discipline,
      teams: [],
      rrMatches: [],
      bracket: [],
      phase: 'setup',
      rrTarget: 15,
      medalTarget: 11,
      medalBestOf: 3,
      advanceCount: 4,
      updatedAt: Date.now(),
    })
  })
}

export function removeDivision(divId: string) {
  return mutate((draft) => {
    draft.divisions = draft.divisions.filter((d) => d.id !== divId)
  })
}

/* -------------------------------- courts -------------------------------- */

export function addCourt() {
  return mutate((draft) => {
    if (!draft.courts) draft.courts = []
    draft.courts.push({
      id: uid('court'),
      name: `Court ${draft.courts.length + 1}`,
      teamA: '',
      teamB: '',
      note: '',
    })
  })
}

export function updateCourt(
  courtId: string,
  fields: Partial<{ name: string; teamA: string; teamB: string; note: string }>,
) {
  return mutate((draft) => {
    const c = draft.courts?.find((x) => x.id === courtId)
    if (c) Object.assign(c, fields)
  })
}

export function clearCourt(courtId: string) {
  return mutate((draft) => {
    const c = draft.courts?.find((x) => x.id === courtId)
    if (c) {
      c.teamA = ''
      c.teamB = ''
      c.note = ''
    }
  })
}

export function removeCourt(courtId: string) {
  return mutate((draft) => {
    draft.courts = (draft.courts ?? []).filter((c) => c.id !== courtId)
  })
}
