"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { updateVideo, type AdminVideo } from "@/lib/api"

interface EditVideoModalProps {
  isOpen: boolean
  onClose: () => void
  video: AdminVideo | null
  onSuccess?: () => void
}

export function EditVideoModal({ isOpen, onClose, video, onSuccess }: EditVideoModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [durationSeconds, setDurationSeconds] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (video) {
      setTitle(video.title)
      setDescription(video.description || "")
      setCategory(video.category || "")
      setDurationSeconds(String(video.durationSeconds))
      setVideoFile(null)
      setThumbnailFile(null)
      setVideoPreview(video.videoUrl || null)
      setThumbnailPreview(video.thumbnailUrl || null)
      setError(null)
    }
  }, [video])

  if (!isOpen || !video) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!durationSeconds || isNaN(Number(durationSeconds)) || Number(durationSeconds) <= 0) {
      setError("Valid duration in seconds is required")
      return
    }

    setIsSubmitting(true)

    try {
      await updateVideo(video.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        durationSeconds: Number(durationSeconds),
        video: videoFile || undefined,
        thumbnail: thumbnailFile || undefined,
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update video"
      setError(message)
      console.error("Failed to update video:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-[110] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Edit Video</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Description</label>
              <Input
                placeholder="Enter video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Category</label>
              <Input
                placeholder="Enter category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Duration (seconds) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g., 300"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                required
                min="1"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Video File (optional, leave empty to keep current)
              </label>
              {videoPreview && !videoFile && (
                <div className="mb-2 p-3 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Current Video:</p>
                  <video controls className="w-full">
                    <source src={videoPreview} type="video/mp4" />
                    <source src={videoPreview} type="video/webm" />
                    Your browser does not support the video element.
                  </video>
                </div>
              )}
              {videoFile && (
                <div className="mb-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary mb-1">New file selected: {videoFile.name}</p>
                  <video controls className="w-full mt-2">
                    <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                </div>
              )}
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setVideoFile(file)
                  if (file) {
                    setVideoPreview(null) // Clear preview when new file is selected
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Thumbnail Image (optional, leave empty to keep current)
              </label>
              {thumbnailPreview && !thumbnailFile && (
                <div className="mb-2 p-3 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Current Thumbnail:</p>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Current thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              {thumbnailFile && (
                <div className="mb-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary mb-1">New file selected: {thumbnailFile.name}</p>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mt-2">
                    <img
                      src={URL.createObjectURL(thumbnailFile)}
                      alt="New thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setThumbnailFile(file)
                  if (file) {
                    setThumbnailPreview(null) // Clear preview when new file is selected
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </>
  )
}

