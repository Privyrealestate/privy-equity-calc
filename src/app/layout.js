import { Libre_Franklin, Crimson_Pro, Space_Mono } from 'next/font/google'
import './globals.css'

const libre_franklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-libre-franklin',
  display: 'swap',
})

const crimson_pro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson-pro',
  display: 'swap',
})

const space_mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Privy | Hidden Equity Calculator',
  description: 'Unlock the hidden value of your property in Frederick & Washington Counties.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${libre_franklin.variable} ${crimson_pro.variable} ${space_mono.variable}`}>
      <body className="bg-privy-ledger text-privy-dominion antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
