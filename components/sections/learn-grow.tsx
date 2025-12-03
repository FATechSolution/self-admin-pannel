"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Music, Video, FileText, Edit2, Play } from "lucide-react"
import { useState, useEffect } from "react"
import { AddAudioModal } from "@/components/modals/add-audio-modal"
import { AddVideoModal } from "@/components/modals/add-video-modal"
import { AddArticleModal } from "@/components/modals/add-article-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"

type TabType = "audios" | "articles" | "videos"

export function LearnGrowSection() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("learnGrowActiveTab") as TabType) || "audios"
    }
    return "audios"
  })
  const [showAddAudio, setShowAddAudio] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showAddArticle, setShowAddArticle] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{id: number, title: string, type: string} | null>(null)

  useEffect(() => {
    localStorage.setItem("learnGrowActiveTab", activeTab)
  }, [activeTab])

  const audioFiles = [
    { id: 1, title: "Morning Meditation", description: "Start your day with peaceful meditation and mindfulness exercises", status: "Published" },
    { id: 2, title: "Daily Affirmations", description: "Empower yourself with positive affirmations and self-belief practices", status: "Published" },
    { id: 3, title: "Focus & Concentration", description: "Enhance your mental clarity and focus with guided audio sessions", status: "Published" },
    { id: 4, title: "Relaxation Sounds", description: "Unwind and de-stress with calming nature sounds and ambient music", status: "Published" },
  ]

  const articles = [
    { id: 1, title: "Self Growth Article", description: "Discover techniques for personal growth and self-improvement", status: "Published" },
    { id: 2, title: "Personal Development", description: "Strategies for achieving your full potential and success", status: "Draft" },
  ]

  const videos = [
    { id: 1, title: "Calm the Racing Mind", description: "Immerse yourself in peace and harmony with this mindfulness practice", status: "Published" },
    { id: 2, title: "Yoga for Beginners", description: "Learn fundamental yoga poses and breathing techniques for wellness", status: "Published" },
  ]

  const tabs = [
    { id: "audios", label: "Audios", icon: Music },
    { id: "articles", label: "Articles", icon: FileText },
    { id: "videos", label: "Videos", icon: Video },
  ]

  const getCurrentData = () => {
    switch (activeTab) {
      case "audios": return audioFiles
      case "articles": return articles
      case "videos": return videos
    }
  }

  const getAddButtonText = () => {
    switch (activeTab) {
      case "audios": return "Upload Audio"
      case "articles": return "Add Article"
      case "videos": return "Upload Video"
    }
  }

  const handleAdd = () => {
    switch (activeTab) {
      case "audios": setShowAddAudio(true); break
      case "articles": setShowAddArticle(true); break
      case "videos": setShowAddVideo(true); break
    }
  }

  return (
    <>
      <AnimatePresence>
        {showAddAudio && (
          <AddAudioModal key="add-audio" isOpen={showAddAudio} onClose={() => setShowAddAudio(false)} />
        )}
        {showAddVideo && (
          <AddVideoModal key="add-video" isOpen={showAddVideo} onClose={() => setShowAddVideo(false)} />
        )}
        {showAddArticle && (
          <AddArticleModal key="add-article" isOpen={showAddArticle} onClose={() => setShowAddArticle(false)} onAdd={() => {}} />
        )}
        {selectedItem && showDelete && (
          <DeleteConfirmationModal
            key="delete-confirmation"
            isOpen={showDelete}
            onClose={() => setShowDelete(false)}
            onConfirm={() => setShowDelete(false)}
            title={`Delete ${selectedItem.type}`}
            itemName={selectedItem.title}
            itemType={selectedItem.type}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>
          <Button onClick={handleAdd} className="gap-2 cursor-pointer w-full sm:w-auto text-sm">
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="whitespace-nowrap">{getAddButtonText()}</span>
          </Button>
        </div>

        {/* Content Table */}
        <Card className="overflow-hidden relative group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <table className="w-full">
              <thead style={{ backgroundColor: '#ceeafe' }} className="border-b border-border">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Title</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-foreground min-w-[200px] md:min-w-[300px]">
                    Description
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {getCurrentData().map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: "rgb(0, 0, 0, 0.02)" }}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{item.title}</td>
                    {"description" in item && (
                      <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-muted-foreground min-w-[200px] md:min-w-[300px] max-w-[400px]">
                        <div className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer" title={String(item.description)}>
                          {String(item.description)}
                        </div>
                      </td>
                    )}
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {(activeTab === "audios" || activeTab === "videos") && (
                          <button className="p-2 hover:bg-green-100 rounded transition-colors text-green-600 hover:text-green-700 cursor-pointer">
                            <Play size={16} fill="currentColor" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-primary/10 rounded transition-colors text-foreground hover:text-primary cursor-pointer">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem({id: item.id, title: item.title, type: activeTab.slice(0, -1)})
                            setShowDelete(true)
                          }}
                          className="p-2 hover:bg-destructive/10 rounded transition-colors text-destructive cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </>
  )
}
