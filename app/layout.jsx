export const metadata = {
  title: 'AI Crop Stress Whisperer',
  description: 'AI-powered crop stress detection',
}

import '../styles/globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
