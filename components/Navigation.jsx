'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

export default function Navigation() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="navbar">
      <div className="page-shell">
        <Link href="/" className="navbar-brand">
          AI Crop Stress Whisperer
        </Link>
        <div className="navbar-nav">
          <Link
            href="/"
            className={`navbar-link ${pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/app"
            className={`navbar-link ${pathname === '/app' ? 'active' : ''}`}
          >
            App
          </Link>
          <Link
            href="/auth"
            className={`navbar-link ${pathname === '/auth' ? 'active' : ''}`}
          >
            Login
          </Link>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}