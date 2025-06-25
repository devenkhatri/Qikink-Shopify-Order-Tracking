import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Qikink Order Tracking - Shopify App',
  description: 'Manage and sync order tracking information between Shopify and Qikink',
  keywords: ['shopify', 'qikink', 'order tracking', 'ecommerce', 'fulfillment'],
  authors: [{ name: 'Qikink Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}