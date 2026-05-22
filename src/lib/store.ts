import { useSyncExternalStore } from 'react'
import { onValue, ref, set } from 'firebase/database'
import { firebaseEnabled, rtdb } from './firebase'
import { buildSeed } from './seed'
import type { Court, Division, Match, TournamentState } from './types'

/** Fixed grid size — the board always shows this many courts (4 × 4). */
const COURT_COUNT = 16

const TOURNAMENT_ID = 'three-rivers-2026'
const LS_KEY = `lu-tournament:${TOURNAMENT_ID}`
const DB_PATH = `tournaments/${TOURNAMENT_ID}`

let current: TournamentState | null = null
let started = false
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function seedState(): TournamentState {
  return buildSeed()
}

/** Strip `undefined` (Realtime Database rejects it) and produce plain JSON. */
function toJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Realtime Database returns `null` for empty arrays/objects and may omit
 * fields, so coerce everything back into the shape the app expects.
 */
function normalizeMatch(m: Partial<Match>): Match {
  return {
    ...(m as Match),
    games: (m.games ?? []).map((g) => ({ a: g?.a ?? 0, b: g?.b ?? 0 })),
  }
}

function normalizeDivision(d: Partial<Division>): Division {
  return {
    ...(d as Division),
    teams: (d.teams ?? []).map((t) => ({ ...t, players: t.players ?? [] })),
    rrMatches: (d.rrMatches ?? []).map(normalizeMatch),
    bracket: (d.bracket ?? []).map(normalizeMatch),
  }
}

/** Always produce exactly COURT_COUNT courts with stable ids, preserving content by position. */
function normalizeCourts(raw: Court[] | undefined): Court[] {
  const existing = raw ?? []
  return Array.from({ length: COURT_COUNT }, (_, i) => {
    const e = existing[i]
    return {
      id: `court-${i + 1}`,
      name: e?.name || `Court ${i + 1}`,
      teamA: e?.teamA ?? '',
      teamB: e?.teamB ?? '',
      note: e?.note ?? '',
    }
  })
}

function normalize(raw: Partial<TournamentState> | null): TournamentState {
  const seed = seedState()
  const meta = raw?.meta ?? seed.meta
  return {
    meta: { ...meta, events: meta.events ?? [] },
    divisions: (raw?.divisions ?? []).map(normalizeDivision),
    courts: normalizeCourts(raw?.courts ?? seed.courts),
  }
}

function loadLocal(): TournamentState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as TournamentState
  } catch {
    /* ignore */
  }
  const seeded = seedState()
  saveLocal(seeded)
  return seeded
}

function saveLocal(state: TournamentState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function start() {
  if (started) return
  started = true

  if (firebaseEnabled && rtdb) {
    const node = ref(rtdb, DB_PATH)
    onValue(
      node,
      (snap) => {
        const val = snap.val()
        if (val == null) {
          void set(node, toJson(seedState()))
          return
        }
        current = normalize(val)
        emit()
      },
      (err) => console.error('Realtime Database listener error:', err),
    )
  } else {
    current = loadLocal()
    window.addEventListener('storage', (e) => {
      if (e.key === LS_KEY && e.newValue) {
        try {
          current = JSON.parse(e.newValue) as TournamentState
          emit()
        } catch {
          /* ignore */
        }
      }
    })
    emit()
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  start()
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): TournamentState | null {
  return current
}

export function useTournament(): TournamentState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function isLive(): boolean {
  return firebaseEnabled
}

/** Read-modify-write the whole tournament tree. */
export async function mutate(
  fn: (draft: TournamentState) => void,
): Promise<void> {
  start()
  const base = current ?? seedState()
  const draft: TournamentState = structuredClone(base)
  fn(draft)
  current = draft

  if (firebaseEnabled && rtdb) {
    emit()
    try {
      await set(ref(rtdb, DB_PATH), toJson(draft))
    } catch (err) {
      console.error('Realtime Database write error:', err)
    }
  } else {
    saveLocal(draft)
    emit()
  }
}

/** Reset back to the seeded demo data. */
export async function resetToSeed(): Promise<void> {
  await mutate((draft) => {
    const fresh = seedState()
    draft.meta = fresh.meta
    draft.divisions = fresh.divisions
  })
}
