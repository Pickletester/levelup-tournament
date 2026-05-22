import { mutate } from './store'
import { buildMatches, propagate, uid } from './tournament'

/* -------------------------------- bracket ------------------------------- */

export function buildBracket(names: string[]) {
  return mutate((draft) => {
    const participants = names.map((n) => n.trim()).filter(Boolean)
    draft.bracket.participants = participants
    draft.bracket.matches = buildMatches(participants)
    draft.bracket.built = draft.bracket.matches.length > 0
  })
}

export function setWinner(matchId: string, name: string | null) {
  return mutate((draft) => {
    const m = draft.bracket.matches.find((x) => x.id === matchId)
    if (!m) return
    // tapping the current winner again clears it
    m.winner = m.winner === name ? null : name
    draft.bracket.matches = propagate(draft.bracket.matches)
  })
}

export function resetBracket() {
  return mutate((draft) => {
    draft.bracket.participants = []
    draft.bracket.matches = []
    draft.bracket.built = false
  })
}

export function setBracketTitle(title: string) {
  return mutate((draft) => {
    draft.bracket.title = title
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
