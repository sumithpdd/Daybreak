import type { Metadata, Viewport } from 'next'
import { Providers } from "@/redux/provider";
import { AuthProvider } from "./components/AuthProvider";
import { Montserrat } from "next/font/google";
import ServiceWorkerRegister from "./components/morning/ServiceWorkerRegister";
import './globals.css'

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: 'Daybreak',
  description: 'A morning start page plus a full Kanban and OKR workspace, grounded in your day.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#070b14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased min-h-screen">
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
