import { useSyncExternalStore } from 'react'

const KEY = 'lu-admin'
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'levelup'

let isAdmin = false
try {
  isAdmin = localStorage.getItem(KEY) === '1'
} catch {
  /* ignore */
}

const subs = new Set<() => void>()
function emit() {
  for (const s of subs) s()
}

export function login(code: string): boolean {
  if (code.trim() === PASSCODE) {
    isAdmin = true
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    emit()
    return true
  }
  return false
}

export function logout() {
  isAdmin = false
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  emit()
}

function subscribe(cb: () => void): () => void {
  subs.add(cb)
  return () => {
    subs.delete(cb)
  }
}

export function useAdmin(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isAdmin,
    () => isAdmin,
  )
}
