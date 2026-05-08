'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { useTranslation, LANGUAGES } from './TranslationContext'
import { useState, useRef, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { lang, switchLang, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <nav className="navbar">
      <div className="page-shell">
        <Link href="/" className="navbar-brand">
          {t('navBrand')}
        </Link>
        <div className="navbar-nav">
          <Link
            href="/"
            className={`navbar-link ${pathname === '/' ? 'active' : ''}`}
          >
            {t('navHome')}
          </Link>
          <Link
            href="/app"
            className={`navbar-link ${pathname === '/app' ? 'active' : ''}`}
          >
            {t('navApp')}
          </Link>
          <Link
            href="/auth"
            className={`navbar-link ${pathname === '/auth' ? 'active' : ''}`}
          >
            {t('navLogin')}
          </Link>

          {/* Language picker */}
          <div className="lang-picker" ref={dropRef}>
            <button
              className="lang-trigger"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label="Select language"
            >
              <span className="lang-flag">{currentLang.flag}</span>
              <span className="lang-code">{currentLang.code.toUpperCase()}</span>
              <svg
                className={`lang-chevron ${open ? 'open' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {open && (
              <ul className="lang-dropdown" role="listbox">
                {LANGUAGES.map((l) => (
                  <li
                    key={l.code}
                    role="option"
                    aria-selected={l.code === lang}
                    className={`lang-option ${l.code === lang ? 'active' : ''}`}
                    onClick={() => {
                      switchLang(l.code)
                      setOpen(false)
                    }}
                  >
                    <span className="lang-flag">{l.flag}</span>
                    <span>{l.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={t(theme === 'dark' ? 'switchToLight' : 'switchToDark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}