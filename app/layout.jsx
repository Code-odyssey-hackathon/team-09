import '../styles/globals.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { TranslationProvider } from '../components/TranslationContext'
import Navigation from '../components/Navigation'
import BgSlideshow from '../components/BgSlideshow'

export const metadata = {
  title: 'AI Crop Stress Whisperer',
  description: 'AI-powered crop stress detection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <BgSlideshow />
          <TranslationProvider>
            <Navigation />
            {children}
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

