import { useState } from 'react'
import { login, logout, useAdmin } from '../lib/admin'

export function AdminButton() {
  const admin = useAdmin()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  if (admin) {
    return (
      <button
        onClick={logout}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-lu-green hover:text-lu-green-deep"
      >
        Exit admin
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true)
          setError(false)
          setCode('')
        }}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-lu-green hover:text-lu-green-deep"
      >
        Admin
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-ink">Admin access</h3>
            <p className="mt-1 text-sm text-ink/60">
              Enter the scorekeeper passcode to edit scores and manage divisions.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (login(code)) {
                  setOpen(false)
                } else {
                  setError(true)
                }
              }}
            >
              <input
                autoFocus
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(false)
                }}
                placeholder="Passcode"
                className={`mt-4 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lu-green/40 ${
                  error ? 'border-red-400' : 'border-line'
                }`}
              />
              {error && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  Incorrect passcode.
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-line py-2 text-sm font-semibold text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-lu-green py-2 text-sm font-semibold text-white transition hover:bg-lu-green-dark"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
