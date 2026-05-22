import { Link } from 'react-router-dom'
import { BrandLogo } from './Logo'
import { LiveBadge } from './LiveBadge'
import { AdminButton } from './AdminButton'
import { useAdmin } from '../lib/admin'

export function Header() {
  const admin = useAdmin()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="shrink-0">
            <BrandLogo />
          </Link>
          <Link
            to="/courts"
            className="hidden rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink-soft transition hover:text-lu-green-deep sm:block"
          >
            Courts
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          {admin && (
            <span className="hidden rounded-full bg-lu-green-deep px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white sm:inline-block">
              Admin
            </span>
          )}
          <LiveBadge />
          <AdminButton />
        </div>
      </div>
    </header>
  )
}
