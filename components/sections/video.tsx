"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Eye, Search, RefreshCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddVideoModal } from "@/components/modals/add-video-modal"
import { EditVideoModal } from "@/components/modals/edit-video-modal"
import { ViewVideoModal } from "@/components/modals/view-video-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { fetchAdminVideos, deleteVideo, type AdminVideo } from "@/lib/api"

function formatDuration(seconds: number) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function VideoSection() {
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showEditVideo, setShowEditVideo] = useState(false)
  const [showViewVideo, setShowViewVideo] = useState(false)
  const [showDeleteVideo, setShowDeleteVideo] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null)
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminVideos({ page: 1, limit: 50 })
        setVideos(res.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load videos"
        setError(message)
        console.error("Failed to load videos:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadVideos()
  }, [refreshKey])

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return videos
    return videos.filter((v) => v.title.toLowerCase().includes(term) || (v.category ?? "").toLowerCase().includes(term))
  }, [videos, search])

  return (
    <>
      <AnimatePresence>
        <AddVideoModal
          isOpen={showAddVideo}
          onClose={() => setShowAddVideo(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      </AnimatePresence>

      <AnimatePresence>
        <EditVideoModal
          isOpen={showEditVideo}
          onClose={() => {
            setShowEditVideo(false)
            setSelectedVideo(null)
          }}
          video={selectedVideo}
          onSuccess={() => {
            setRefreshKey((k) => k + 1)
            setShowEditVideo(false)
            setSelectedVideo(null)
          }}
        />
      </AnimatePresence>

      <AnimatePresence>
        <ViewVideoModal
          isOpen={showViewVideo}
          onClose={() => {
            setShowViewVideo(false)
            setSelectedVideo(null)
          }}
          video={selectedVideo}
        />
      </AnimatePresence>

      <AnimatePresence>
        {selectedVideo && (
          <DeleteConfirmationModal
            isOpen={showDeleteVideo}
            onClose={() => {
              setShowDeleteVideo(false)
              setSelectedVideo(null)
            }}
            onConfirm={async () => {
              if (!selectedVideo) return
              try {
                setIsLoading(true)
                setError(null)
                await deleteVideo(selectedVideo.id)
                setShowDeleteVideo(false)
                setSelectedVideo(null)
                setRefreshKey((k) => k + 1)
              } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete video"
                setError(message)
                console.error("Failed to delete video:", err)
              } finally {
                setIsLoading(false)
              }
            }}
            title="Delete Video"
            itemName={selectedVideo.title}
            itemType="video"
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search videos..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="gap-2 cursor-pointer"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoading}
            >
              <RefreshCcw className={isLoading ? "animate-spin" : ""} size={16} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddVideo(true)} className="w-full sm:w-auto gap-2 cursor-pointer">
              <Plus size={18} />
              Upload Video
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 border-destructive/40 bg-destructive/5 text-destructive text-sm">
            <div className="flex items-start justify-between gap-3">
              <p>{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() => setRefreshKey((k) => k + 1)}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          {isLoading && (
            <div className="py-10 flex items-center justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading videos...
              </div>
            </div>
          )}

          {!isLoading && filteredVideos.length === 0 && !error && (
            <div className="py-10 flex items-center justify-center text-sm text-muted-foreground">
              No videos found. Try adjusting your search or upload a new video.
            </div>
          )}

          {!isLoading && filteredVideos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVideos.map((video) => (
                    <motion.tr
                      key={video.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "rgb(0, 0, 0, 0.02)" }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">{video.title}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDuration(video.durationSeconds)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {video.category || <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            video.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                          }`}
                        >
                          {video.isActive ? "Published" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowViewVideo(true)
                            }}
                            className="p-2 hover:bg-primary/10 rounded transition-colors text-primary cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowEditVideo(true)
                            }}
                            className="p-2 hover:bg-secondary/50 rounded transition-colors text-foreground cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowDeleteVideo(true)
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
          )}
        </Card>
      </motion.div>
    </>
  )
}
