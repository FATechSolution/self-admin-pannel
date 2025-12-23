"use client"

import { motion } from "framer-motion"
import { lazy, Suspense } from "react"

/* Lazy loading all section components */
const DashboardOverview = lazy(() =>
  import("./sections/dashboard-overview").then((mod) => ({ default: mod.DashboardOverview })),
)
const UserManagementSection = lazy(() =>
  import("./sections/user-management").then((mod) => ({ default: mod.UserManagementSection })),
)
const AudioSection = lazy(() => import("./sections/audio").then((mod) => ({ default: mod.AudioSection })))
const VideoSection = lazy(() =>
  import("./sections/video").then((mod) => ({ default: mod.VideoSection })),
)
const ArticleSection = lazy(() =>
  import("./sections/article").then((mod) => ({ default: mod.ArticleSection })),
)
const LearnGrowSection = lazy(() =>
  import("./sections/learn-grow").then((mod) => ({ default: mod.LearnGrowSection })),
)

function SectionFallback() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

interface DashboardProps {
  activeSection: string
}

export function Dashboard({ activeSection }: DashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 max-w-7xl mx-auto w-full"
    >
      <Suspense fallback={<SectionFallback />}>
        {activeSection === "dashboard" && <DashboardOverview />}
        {activeSection === "users" && <UserManagementSection />}
        {activeSection === "learn-grow" && <LearnGrowSection />}
        {activeSection === "audios" && <AudioSection />}
        {activeSection === "videos" && <VideoSection />}
        {activeSection === "articles" && <ArticleSection />}
      </Suspense>
    </motion.div>
  )
}
