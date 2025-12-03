"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Users, FileText, Music, Video } from "lucide-react"
import { getDashboardStats, type DashboardStats } from "@/lib/api"

function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard statistics"
        setError(message)
        console.error("Failed to load dashboard stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statsConfig = stats
    ? [
        { label: "Total Users", value: formatNumber(stats.totalUsers), icon: Users, color: "bg-blue-100" },
        { label: "Audio Files", value: formatNumber(stats.totalAudios), icon: Music, color: "bg-purple-100" },
        { label: "Articles", value: formatNumber(stats.totalArticles), icon: FileText, color: "bg-green-100" },
        { label: "Video Files", value: formatNumber(stats.totalVideos), icon: Video, color: "bg-pink-100" },
      ]
    : [
        { label: "Total Users", value: "—", icon: Users, color: "bg-blue-100" },
        { label: "Audio Files", value: "—", icon: Music, color: "bg-purple-100" },
        { label: "Articles", value: "—", icon: FileText, color: "bg-green-100" },
        { label: "Video Files", value: "—", icon: Video, color: "bg-pink-100" },
      ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading dashboard statistics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/40 bg-destructive/5 text-destructive">
        <p className="font-medium mb-2">Failed to load dashboard statistics</p>
        <p className="text-sm">{error}</p>
      </Card>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="p-8 md:p-10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon size={22} className="md:w-7 md:h-7 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
