'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Toaster } from 'sileo'
import 'sileo/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const theme = savedTheme || systemTheme
    
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [])

  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  )
}