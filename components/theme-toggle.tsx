'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(initialTheme)
  }, [])

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newTheme = theme === 'light' ? 'dark' : 'light'
    
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  }

  if (!mounted) {
    return <div className="w-10 h-10 rounded-2xl bg-gray-100" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      type="button"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            theme === 'dark' 
              ? 'opacity-0 rotate-90 scale-50 text-amber-500' 
              : 'opacity-100 rotate-0 scale-100 text-amber-600'
          }`} 
        />
        <Moon 
          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
            theme === 'light' 
              ? 'opacity-0 -rotate-90 scale-50 text-blue-400' 
              : 'opacity-100 rotate-0 scale-100 text-blue-400'
          }`}
        />
      </div>
    </button>
  )
}