"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createVideo, CONTENT_CATEGORIES, type ContentCategory } from "@/lib/api"

interface AddVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Question {
  _id: string
  needKey: string
  needLabel: string
  questionText: string
}

export function AddVideoModal({ isOpen, onClose, onSuccess }: AddVideoModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("Survival")
  const [questionId, setQuestionId] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch questions when category changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!category) return
      
      setLoadingQuestions(true)
      try {
        const response = await fetch(`/api/goals/needs/${category}`)
        const data = await response.json()
        if (data.success) {
          setQuestions(data.data || [])
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err)
        setQuestions([])
      } finally {
        setLoadingQuestions(false)
      }
    }

    fetchQuestions()
  }, [category])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!category) {
      setError("Category is required")
      return
    }

    if (!videoFile && !videoUrl.trim()) {
      setError("Either video file or video URL is required")
      return
    }

    if (!durationSeconds || isNaN(Number(durationSeconds)) || Number(durationSeconds) <= 0) {
      setError("Valid duration in seconds is required")
      return
    }

    setIsSubmitting(true)

    try {
      await createVideo({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category,
        questionId: questionId || undefined,
        durationSeconds: Number(durationSeconds),
        video: videoFile || undefined,
        videoUrl: videoUrl.trim() || undefined,
        thumbnail: thumbnailFile || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("Survival")
      setQuestionId("")
      setDurationSeconds("")
      setVideoFile(null)
      setVideoUrl("")
      setThumbnailFile(null)
      setThumbnailUrl("")
      setError(null)

      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create video"
      setError(message)
      console.error("Failed to create video:", err)
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
            <h3 className="text-lg font-semibold text-foreground">Upload Video</h3>
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
              <label className="text-sm font-medium text-foreground block mb-2">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ContentCategory)
                  setQuestionId("")
                }}
                required
                disabled={isSubmitting}
              >
                {CONTENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Related Need <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                disabled={isSubmitting || loadingQuestions}
              >
                <option value="">None - General content</option>
                {loadingQuestions ? (
                  <option disabled>Loading needs...</option>
                ) : (
                  questions.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.needLabel || q.needKey}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Link this video to a specific need from the assessment
              </p>
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
                Video File <span className="text-muted-foreground text-xs">(or provide URL below)</span>
              </label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  setVideoFile(e.target.files?.[0] || null)
                  if (e.target.files?.[0]) {
                    setVideoUrl("") // Clear URL if file is selected
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Video URL <span className="text-muted-foreground text-xs">(if not uploading file)</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value)
                  if (e.target.value.trim()) {
                    setVideoFile(null) // Clear file if URL is provided
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Thumbnail Image <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setThumbnailFile(e.target.files?.[0] || null)
                  if (e.target.files?.[0]) {
                    setThumbnailUrl("") // Clear URL if file is selected
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Thumbnail URL <span className="text-muted-foreground text-xs">(if not uploading file)</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value)
                  if (e.target.value.trim()) {
                    setThumbnailFile(null) // Clear file if URL is provided
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
                {isSubmitting ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </>
  )
}
