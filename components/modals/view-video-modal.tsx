"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { type AdminVideo } from "@/lib/api"

interface ViewVideoModalProps {
  isOpen: boolean
  onClose: () => void
  video: AdminVideo | null
}

function formatDuration(seconds: number) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function ViewVideoModal({ isOpen, onClose, video }: ViewVideoModalProps) {
  if (!isOpen || !video) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-[100]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl z-[110] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Video Details</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Thumbnail Preview */}
            {video.thumbnailUrl && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Thumbnail</label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Video Preview */}
            {video.videoUrl && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Video</label>
                <div className="w-full rounded-lg border border-border p-4 bg-secondary/30">
                  <video controls className="w-full">
                    <source src={video.videoUrl} type="video/mp4" />
                    <source src={video.videoUrl} type="video/webm" />
                    <source src={video.videoUrl} type="video/ogg" />
                    Your browser does not support the video element.
                  </video>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Title</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">{video.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Duration</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {formatDuration(video.durationSeconds)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Category</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {video.category || <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                <p className="text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      video.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                    }`}
                  >
                    {video.isActive ? "Published" : "Inactive"}
                  </span>
                </p>
              </div>

              {video.description && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                  <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">{video.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Video URL</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg break-all">
                  {video.videoUrl || <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Thumbnail URL</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg break-all">
                  {video.thumbnailUrl || <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Created At</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {new Date(video.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1 cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  )
}

