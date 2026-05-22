import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { TvDisplay } from './pages/TvDisplay'
import { CourtsPage, TvCourts } from './pages/CourtsBoard'

function MainApp() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <footer className="border-t border-line py-5 text-center text-xs text-ink/40">
        LevelUp Pickleball Club
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/courts" element={<CourtsPage />} />
      <Route path="/tv/courts" element={<TvCourts />} />
      <Route path="/tv" element={<TvDisplay />} />
      <Route path="/*" element={<MainApp />} />
    </Routes>
  )
}
