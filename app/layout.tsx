import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'
import { TaskProvider } from '@/contexts/TaskContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task Master - Intuitive Task Management',
  description: 'Manage your tasks efficiently with Task Master',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <TaskProvider>
              <Toaster />
              {children}
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
