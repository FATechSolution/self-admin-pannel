"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Users, Music, Video, Menu, X, FileText } from "lucide-react"
import { useEffect, useState } from "react"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ activeSection, setActiveSection, isOpen, setIsOpen }: SidebarProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    // Check initial screen size
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    checkScreenSize()

    // Listen for window resize
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Menu },
    { id: "users", label: "User Management", icon: Users },
    { id: "audios", label: "Audios", icon: Music },
    { id: "videos", label: "Videos", icon: Video },
    { id: "articles", label: "Articles", icon: FileText },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isLargeScreen ? false : { x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed left-0 top-0 h-screen w-64 sm:w-72 lg:w-72 bg-sidebar border-r border-sidebar-border z-50 lg:static lg:z-auto transform shadow-2xl lg:shadow-none flex flex-col overflow-y-auto lg:!translate-x-0 lg:shrink-0"
      >
        <div className="flex flex-col h-full p-3 sm:p-4 md:p-6">
          {/* Logo/Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
                <span className="text-sidebar-primary-foreground font-bold text-xs sm:text-sm">SA</span>
              </div>
              <h1 className="text-xs sm:text-sm md:text-lg font-bold text-sidebar-foreground truncate">
                Self-Actualisation
              </h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-sidebar-foreground hover:text-sidebar-primary transition-colors shrink-0 p-1 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const href = item.id === "dashboard" ? "/" : `/?section=${item.id}`

              return (
                <motion.a
                  key={item.id}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSection(item.id)
                    setIsOpen(false)
                    // Update URL (only in browser)
                    if (typeof window !== "undefined") {
                      window.history.pushState({}, '', href)
                    }
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-start gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm cursor-pointer ${activeSection === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md"
                      : "text-sidebar-foreground hover:bg-gray-100 hover:text-sidebar-primary"
                    }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5 shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </motion.a>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="pt-2 sm:pt-3 md:pt-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/60 truncate text-center md:text-left">© 2025 SA</p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
