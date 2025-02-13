import './globals.css'

export const metadata = {
  title: 'Metrics Dashboard',
  description: 'Monitor your application metrics in real-time',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
