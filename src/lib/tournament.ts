import type { BracketMatch } from './types'

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`
}

/** Build a single-elimination bracket from a list of names. */
export function buildMatches(names: string[]): BracketMatch[] {
  const clean = names.map((n) => n.trim()).filter(Boolean)
  if (clean.length < 2) return []

  let size = 1
  while (size < clean.length) size *= 2
  const rounds = Math.log2(size)

  const padded = [...clean]
  while (padded.length < size) padded.push('') // '' = bye

  const matches: BracketMatch[] = []
  for (let i = 0; i < size / 2; i++) {
    matches.push({
      id: uid('m'),
      round: 0,
      index: i,
      a: padded[2 * i] || null,
      b: padded[2 * i + 1] || null,
      winner: null,
    })
  }
  for (let r = 1; r < rounds; r++) {
    const count = size / 2 ** (r + 1)
    for (let i = 0; i < count; i++) {
      matches.push({ id: uid('m'), round: r, index: i, a: null, b: null, winner: null })
    }
  }
  return propagate(matches)
}

/** Recompute every match's participants from upstream winners (and auto-advance byes). */
export function propagate(matches: BracketMatch[]): BracketMatch[] {
  const ms = matches.map((m) => ({ ...m }))
  if (ms.length === 0) return ms
  const maxRound = Math.max(...ms.map((m) => m.round))
  const at = (r: number, i: number) => ms.find((m) => m.round === r && m.index === i)

  // round 0: a real name vs an empty slot auto-advances
  for (const m of ms.filter((x) => x.round === 0)) {
    if (m.a && !m.b) m.winner = m.a
    else if (m.b && !m.a) m.winner = m.b
    else if (m.winner && m.winner !== m.a && m.winner !== m.b) m.winner = null
  }

  for (let r = 1; r <= maxRound; r++) {
    for (const m of ms.filter((x) => x.round === r)) {
      const fa = at(r - 1, m.index * 2)
      const fb = at(r - 1, m.index * 2 + 1)
      m.a = fa?.winner ?? null
      m.b = fb?.winner ?? null
      if (m.winner && m.winner !== m.a && m.winner !== m.b) m.winner = null
    }
  }
  return ms
}

export function totalRounds(matches: BracketMatch[]): number {
  if (!matches.length) return 0
  return Math.max(...matches.map((m) => m.round)) + 1
}

export function roundLabel(round: number, rounds: number): string {
  const fromEnd = rounds - 1 - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semifinals'
  if (fromEnd === 2) return 'Quarterfinals'
  return `Round ${round + 1}`
}

export function champion(matches: BracketMatch[]): string | null {
  if (!matches.length) return null
  const maxRound = Math.max(...matches.map((m) => m.round))
  const final = matches.find((m) => m.round === maxRound && m.index === 0)
  return final?.winner ?? null
}

export function matchesByRound(matches: BracketMatch[]): BracketMatch[][] {
  const rounds = totalRounds(matches)
  const out: BracketMatch[][] = []
  for (let r = 0; r < rounds; r++) {
    out.push(matches.filter((m) => m.round === r).sort((a, b) => a.index - b.index))
  }
  return out
}
