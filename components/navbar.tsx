"use client"

import { motion } from "framer-motion"
import { Menu, LogOut } from "lucide-react"
import { auth } from "@/lib/auth"

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
      audios: "Audios",
      videos: "Videos",
      articles: "Articles",
    }
    return sections[activeSection] || "Dashboard"
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-40">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -m-2 text-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg cursor-pointer flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeSection}
            className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate"
          >
            {getSectionTitle()}
          </motion.h2>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            auth.logout()
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer flex-shrink-0"
          title="Logout"
        >
          <LogOut size={16} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </nav>
  )
}
