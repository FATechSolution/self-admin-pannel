"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createArticle, CONTENT_CATEGORIES, type ContentCategory, type Question, fetchQuestionsByCategory } from "@/lib/api"

interface AddArticleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddArticleModal({ isOpen, onClose, onSuccess }: AddArticleModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<ContentCategory>("Survival")
  const [questionId, setQuestionId] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [readTimeMinutes, setReadTimeMinutes] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch questions when category changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!category) return
      
      setLoadingQuestions(true)
      try {
        const data = await fetchQuestionsByCategory(category)
        setQuestions(data)
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

    if (!content.trim()) {
      setError("Content is required")
      return
    }

    if (!category) {
      setError("Category is required")
      return
    }

    if (!readTimeMinutes || isNaN(Number(readTimeMinutes)) || Number(readTimeMinutes) <= 0) {
      setError("Valid read time in minutes is required")
      return
    }

    setIsSubmitting(true)

    try {
      await createArticle({
        title: title.trim(),
        content: content.trim(),
        category: category,
        questionId: questionId || undefined,
        readTimeMinutes: Number(readTimeMinutes),
        thumbnail: thumbnailFile || undefined,
      })

      // Reset form
      setTitle("")
      setContent("")
      setCategory("Survival")
      setQuestionId("")
      setReadTimeMinutes("")
      setThumbnailFile(null)
      setError(null)

      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create article"
      setError(message)
      console.error("Failed to create article:", err)
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl z-[110] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Add Article</h3>
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
                placeholder="Enter article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Content <span className="text-destructive">*</span>
              </label>
              <textarea
                placeholder="Enter article content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isSubmitting}
                rows={10}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground resize-y min-h-[200px]"
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
                Link this article to a specific need from the assessment
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Read Time (minutes) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g., 5"
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(e.target.value)}
                required
                min="1"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Thumbnail Image (optional)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
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
                {isSubmitting ? "Creating..." : "Add Article"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </>
  )
}
