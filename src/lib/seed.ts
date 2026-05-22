import {
  buildBracket,
  computeStandings,
  generateRoundRobin,
  propagateBracket,
  uid,
} from './tournament'
import type { Court, Discipline, Division, Match, Team, TournamentState } from './types'

const RR_TARGET = 15
const MEDAL_TARGET = 11
const MEDAL_BEST_OF = 3

function makeTeams(entries: string[][]): Team[] {
  return entries.map((players) => ({ id: uid('t'), players }))
}

function makeDivision(opts: {
  event: string
  name: string
  discipline: Discipline
  teams: Team[]
}): Division {
  const { event, name, discipline, teams } = opts
  return {
    id: uid('div'),
    event,
    name,
    discipline,
    teams,
    rrMatches: teams.length >= 2 ? generateRoundRobin(teams, RR_TARGET) : [],
    bracket: [],
    phase: teams.length >= 2 ? 'roundRobin' : 'setup',
    rrTarget: RR_TARGET,
    medalTarget: MEDAL_TARGET,
    medalBestOf: MEDAL_BEST_OF,
    advanceCount: 4,
    updatedAt: Date.now(),
  }
}

function setGame(m: Match, index: number, a: number, b: number) {
  if (m.games[index]) m.games[index] = { a, b }
}

/** Fill every round-robin match with deterministic but varied results. */
function fillRoundRobin(div: Division) {
  div.rrMatches.forEach((m, i) => {
    const margin = 3 + (i % 4)
    if (i % 2 === 0) setGame(m, 0, RR_TARGET, RR_TARGET - margin)
    else setGame(m, 0, RR_TARGET - margin, RR_TARGET)
  })
}

/** Fill a fraction of the round-robin so some matches are live/final, rest pending. */
function fillPartialRoundRobin(div: Division) {
  div.rrMatches.forEach((m, i) => {
    if (i < Math.ceil(div.rrMatches.length / 2)) {
      if (i % 2 === 0) setGame(m, 0, RR_TARGET, 11)
      else setGame(m, 0, 13, RR_TARGET)
    } else if (i === Math.ceil(div.rrMatches.length / 2)) {
      // one match currently in progress
      setGame(m, 0, 9, 7)
    }
  })
}

/** Run a complete bracket so the division shows medals. */
function runPlayoffs(div: Division) {
  const standings = computeStandings(div)
  const seeds = standings.slice(0, div.advanceCount).map((s) => s.team.id)
  div.bracket = buildBracket(div, seeds)

  // semifinals: higher seed wins
  const sf1 = div.bracket.find((m) => m.label === 'Semifinal 1')!
  const sf2 = div.bracket.find((m) => m.label === 'Semifinal 2')!
  setGame(sf1, 0, RR_TARGET, 12)
  setGame(sf2, 0, RR_TARGET, 10)
  div.bracket = propagateBracket(div.bracket)

  const final = div.bracket.find((m) => m.stage === 'final')!
  const bronze = div.bracket.find((m) => m.stage === 'bronze')!
  setGame(final, 0, MEDAL_TARGET, 8)
  setGame(final, 1, 9, MEDAL_TARGET)
  setGame(final, 2, MEDAL_TARGET, 7)
  setGame(bronze, 0, MEDAL_TARGET, 9)
  setGame(bronze, 1, MEDAL_TARGET, 6)
  div.bracket = propagateBracket(div.bracket)
  div.phase = 'complete'
}

export function buildSeed(): TournamentState {
  // Finished singles division (shows full bracket + medals)
  const mensSingles40 = makeDivision({
    event: "Men's Singles",
    name: '4.0',
    discipline: 'singles',
    teams: makeTeams([
      ['Alex Carter'],
      ['Marcus Rivera'],
      ['Jordan Tanaka'],
      ['Devin Boyd'],
      ['Sam Whitfield'],
    ]),
  })
  fillRoundRobin(mensSingles40)
  runPlayoffs(mensSingles40)

  // Doubles division: round robin fully played, ready to start playoffs
  const mensDoubles40 = makeDivision({
    event: "Men's Doubles",
    name: '4.0',
    discipline: 'doubles',
    teams: makeTeams([
      ['Chris Doyle', 'Pat Nguyen'],
      ['Ryan Foster', 'Eli Brooks'],
      ['Tom Hale', 'Vince Russo'],
      ['Jake Mercer', 'Owen Park'],
      ['Luis Romero', 'Drew Kelly'],
      ['Nate Sloan', 'Hugo Marsh'],
    ]),
  })
  fillRoundRobin(mensDoubles40)

  // Mixed doubles: round robin in progress (live)
  const mixed35 = makeDivision({
    event: 'Mixed Doubles',
    name: '3.5',
    discipline: 'doubles',
    teams: makeTeams([
      ['Mia Lopez', 'Sean Carter'],
      ['Ava Brooks', 'Liam Reed'],
      ['Nora Patel', 'Cole Vance'],
      ['Ella Frost', 'Max Dolan'],
      ['Ruby Shaw', 'Theo Lang'],
    ]),
  })
  fillPartialRoundRobin(mixed35)

  // Women's doubles: empty, awaiting setup
  const womensDoubles35 = makeDivision({
    event: "Women's Doubles",
    name: '3.5',
    discipline: 'doubles',
    teams: [],
  })

  const womensSingles35 = makeDivision({
    event: "Women's Singles",
    name: '3.5',
    discipline: 'singles',
    teams: [],
  })

  const court = (name: string, teamA = '', teamB = '', note = ''): Court => ({
    id: uid('court'),
    name,
    teamA,
    teamB,
    note,
  })

  return {
    meta: {
      id: 'three-rivers-2026',
      name: 'Three Rivers Championship',
      subtitle: '2026',
      location: 'LevelUp Pickleball Club · Canonsburg, PA',
      dates: 'May 22–24, 2026',
      ball: 'Franklin X-40',
      events: [
        "Men's Singles",
        "Women's Singles",
        "Men's Doubles",
        "Women's Doubles",
        'Mixed Doubles',
      ],
    },
    divisions: [
      mensSingles40,
      mensDoubles40,
      mixed35,
      womensDoubles35,
      womensSingles35,
    ],
    courts: [
      court('Court 1', 'Smith / Jones', 'Carter / Boyd', "Men's Doubles 4.0"),
      court('Court 2', 'Lee / Park', 'Rivera / Hale', "Men's Doubles 4.0"),
      court('Court 3'),
      court('Court 4', 'Tanaka / Foster', 'Doyle / Nguyen', 'Mixed 3.5'),
      ...Array.from({ length: 12 }, (_, i) => court(`Court ${i + 5}`)),
    ],
  }
}
