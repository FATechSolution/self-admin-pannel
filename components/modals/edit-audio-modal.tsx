"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { updateAudio, type AdminAudio, CONTENT_CATEGORIES, type ContentCategory, type Question, fetchQuestionsByCategory } from "@/lib/api"

interface EditAudioModalProps {
  isOpen: boolean
  onClose: () => void
  audio: AdminAudio | null
  onSuccess?: () => void
}

export function EditAudioModal({ isOpen, onClose, audio, onSuccess }: EditAudioModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ContentCategory>("Survival")
  const [questionId, setQuestionId] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load questions when category changes
  useEffect(() => {
    const loadQuestions = async () => {
      if (!category) return
      
      // Validate category is one of the allowed categories
      const validCategories: ContentCategory[] = ["Survival", "Safety", "Social", "Self", "Meta-Needs"]
      if (!validCategories.includes(category as ContentCategory)) {
        setQuestions([])
        return
      }

      setLoadingQuestions(true)
      try {
        const data = await fetchQuestionsByCategory(category as ContentCategory)
        setQuestions(data)
      } catch (err) {
        console.error("Failed to load questions:", err)
        setQuestions([])
      } finally {
        setLoadingQuestions(false)
      }
    }

    loadQuestions()
  }, [category])

  useEffect(() => {
    if (audio) {
      setTitle(audio.title)
      setDescription(audio.description || "")
      // Validate and set category - ensure it's one of the valid categories
      const validCategories: ContentCategory[] = ["Survival", "Safety", "Social", "Self", "Meta-Needs"]
      const audioCategory = audio.category as ContentCategory
      setCategory(validCategories.includes(audioCategory) ? audioCategory : "Survival")
      setQuestionId(audio.questionId || "")
      setDurationSeconds(String(audio.durationSeconds))
      setAudioFile(null)
      setAudioUrl(audio.audioUrl || "")
      setThumbnailFile(null)
      setThumbnailUrl(audio.thumbnailUrl || "")
      setAudioPreview(audio.audioUrl || null)
      setThumbnailPreview(audio.thumbnailUrl || null)
      setError(null)
    }
  }, [audio])

  if (!isOpen || !audio) return null

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

    if (!durationSeconds || isNaN(Number(durationSeconds)) || Number(durationSeconds) <= 0) {
      setError("Valid duration in seconds is required")
      return
    }

    setIsSubmitting(true)

    try {
      await updateAudio(audio.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category,
        questionId: questionId || undefined,
        durationSeconds: Number(durationSeconds),
        audio: audioFile || undefined,
        audioUrl: audioFile ? undefined : (audioUrl.trim() || undefined),
        thumbnail: thumbnailFile || undefined,
        thumbnailUrl: thumbnailFile ? undefined : (thumbnailUrl.trim() || undefined),
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update audio"
      setError(message)
      console.error("Failed to update audio:", err)
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
            <h3 className="text-lg font-semibold text-foreground">Edit Audio</h3>
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
                placeholder="Enter audio title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Description</label>
              <Input
                placeholder="Enter audio description"
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
                  setQuestionId("") // Reset question when category changes
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
                    <option key={q.questionId} value={q.questionId}>
                      {q.needLabel || q.needKey}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Link this audio to a specific need from the assessment
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
                Audio File <span className="text-muted-foreground text-xs">(optional, leave empty to keep current)</span>
              </label>
              {audioPreview && !audioFile && (
                <div className="mb-2 p-3 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Current Audio:</p>
                  <audio controls className="w-full">
                    <source src={audioPreview} type="audio/mpeg" />
                    <source src={audioPreview} type="audio/mp3" />
                    <source src={audioPreview} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              {audioFile && (
                <div className="mb-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary mb-1">New file selected: {audioFile.name}</p>
                </div>
              )}
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setAudioFile(file)
                  if (file) {
                    setAudioUrl("") // Clear URL if file is selected
                    setAudioPreview(null) // Clear preview when new file is selected
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Audio URL <span className="text-muted-foreground text-xs">(if not uploading file)</span>
              </label>
              <Input
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={audioUrl}
                onChange={(e) => {
                  setAudioUrl(e.target.value)
                  if (e.target.value.trim()) {
                    setAudioFile(null) // Clear file if URL is provided
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Thumbnail Image <span className="text-muted-foreground text-xs">(optional, leave empty to keep current)</span>
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
                    setThumbnailUrl("") // Clear URL if file is selected
                    setThumbnailPreview(null) // Clear preview when new file is selected
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
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </>
  )
}

