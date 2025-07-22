import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portlio - Professional Client Onboarding Portals',
  description: 'Create beautiful onboarding portals for your clients in minutes. Collect payments, files, and approvals in one place.',
  keywords: 'client onboarding, freelancer tools, client portals, project management',
  authors: [{ name: 'Portlio Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <div id="root">{children}</div>
        <div id="modal-root"></div>
      </body>
    </html>
  )
}