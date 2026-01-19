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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search videos..."
              className="pl-10 text-sm sm:text-base h-10 sm:h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-none text-xs sm:text-sm h-10 sm:h-11"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoading}
            >
              <RefreshCcw className={isLoading ? "animate-spin" : ""} size={14} />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
            <Button onClick={() => setShowAddVideo(true)} className="flex-1 sm:flex-none gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm h-10 sm:h-11">
              <Plus size={16} />
              <span>Upload Video</span>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-3 sm:p-4 border-destructive/40 bg-destructive/5 text-destructive text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <p className="flex-1">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 cursor-pointer w-full sm:w-auto"
                onClick={() => setRefreshKey((k) => k + 1)}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          {isLoading && (
            <div className="py-8 sm:py-10 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading videos...
              </div>
            </div>
          )}

          {!isLoading && filteredVideos.length === 0 && !error && (
            <div className="py-8 sm:py-10 flex items-center justify-center text-xs sm:text-sm text-muted-foreground text-center px-4">
              No videos found. Try adjusting your search or upload a new video.
            </div>
          )}

          {/* Mobile Card View */}
          {!isLoading && filteredVideos.length > 0 && (
            <div className="block md:hidden divide-y divide-border">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 sm:p-4 space-y-2 sm:space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2">{video.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {formatDuration(video.durationSeconds)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        video.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                      }`}
                    >
                      {video.isActive ? "Published" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {video.category && (
                      <span className="px-2 py-0.5 bg-secondary/50 rounded text-muted-foreground">
                        {video.category}
                      </span>
                    )}
                    {(video.needLabel || video.needKey) && (
                      <span className="px-2 py-0.5 bg-primary/10 rounded text-primary">
                        {video.needLabel || video.needKey}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 pt-1">
                    <button
                      onClick={() => {
                        setSelectedVideo(video)
                        setShowViewVideo(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-primary/10 hover:bg-primary/20 rounded text-primary text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideo(video)
                        setShowEditVideo(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-secondary/50 hover:bg-secondary rounded text-foreground text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideo(video)
                        setShowDeleteVideo(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-destructive/10 hover:bg-destructive/20 rounded text-destructive text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Desktop Table View */}
          {!isLoading && filteredVideos.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">Title</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">Duration</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">Category</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground hidden lg:table-cell whitespace-nowrap">Related Need</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">Actions</th>
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
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-foreground">
                        <span className="line-clamp-2">{video.title}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                        {formatDuration(video.durationSeconds)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground">
                        {video.category || <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground hidden lg:table-cell">
                        {video.needLabel || video.needKey || <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm">
                        <span
                          className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            video.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                          }`}
                        >
                          {video.isActive ? "Published" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowViewVideo(true)
                            }}
                            className="p-1.5 lg:p-2 hover:bg-primary/10 rounded transition-colors text-primary cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowEditVideo(true)
                            }}
                            className="p-1.5 lg:p-2 hover:bg-secondary/50 rounded transition-colors text-foreground cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowDeleteVideo(true)
                            }}
                            className="p-1.5 lg:p-2 hover:bg-destructive/10 rounded transition-colors text-destructive cursor-pointer"
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
