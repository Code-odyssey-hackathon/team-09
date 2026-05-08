import '../styles/globals.css'
import { ThemeProvider } from '../components/ThemeProvider'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'AI Crop Stress Whisperer',
  description: 'AI-powered crop stress detection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
