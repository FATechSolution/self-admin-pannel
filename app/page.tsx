"use client"

import { useState, Suspense, lazy, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { auth } from "@/lib/auth"
import { getCurrentAdmin } from "@/lib/api"

/* Added lazy loading for Dashboard component */
const Dashboard = lazy(() => import("@/components/dashboard").then((mod) => ({ default: mod.Dashboard })))

function DashboardFallback() {
  return (
    <div className="p-6 flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  )
}





export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      // Check if token exists
      const token = auth.getToken()
      if (!token) {
        router.push("/login")
        return
      }

      // Verify token is valid by calling the API
      try {
        await getCurrentAdmin()
        setIsAuthenticated(true)
        
        // Check URL params for section
        const params = new URLSearchParams(window.location.search)
        const sectionParam = params.get("section")
        
        if (sectionParam) {
          setActiveSection(sectionParam)
        } else {
          const savedSection = localStorage.getItem("activeSection")
          if (savedSection) {
            setActiveSection(savedSection)
          }
        }
      } catch (error) {
        // Token is invalid or expired
        auth.removeToken()
        router.push("/login")
        return
      } finally {
        setIsChecking(false)
        setMounted(true)
      }
    }

    checkAuthentication()
  }, [router])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("activeSection", activeSection)
      // Update URL without page reload
      const newUrl = activeSection === "dashboard" 
        ? "/" 
        : `/?section=${activeSection}`
      window.history.pushState({}, '', newUrl)
    }
  }, [activeSection, mounted])

  // Show loading while checking authentication
  if (isChecking || !mounted || !isAuthenticated) {
    return (
      <div className="flex h-screen bg-background w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background w-full">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeSection={activeSection} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <Suspense fallback={<DashboardFallback />}>
            <Dashboard activeSection={activeSection} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
