"use client"

import { motion } from "framer-motion"
import { Menu, LogOut } from "lucide-react"

interface NavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeSection: string
}



export function Navbar({ sidebarOpen, setSidebarOpen, activeSection }: NavbarProps) {

  const getSectionTitle = () => {
    const sections: Record<string, string> = {
      dashboard: "Dashboard",
      users: "User Management",
      "learn-grow": "Learn & Grow",
    }
    return sections[activeSection] || "Dashboard"
  }

  return (
    <nav className="bg-white border-b border-border">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeSection}
            className="text-lg md:text-xl font-semibold text-foreground"
          >
            {getSectionTitle()}
          </motion.h2>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Clear auth token
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            // Clear local storage
            localStorage.clear()
            // Redirect to login
            window.location.href = '/login'
          }}
          className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </nav>
  )
}
