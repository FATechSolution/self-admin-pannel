"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { updateArticle, type AdminArticle } from "@/lib/api"

interface EditArticleModalProps {
  isOpen: boolean
  onClose: () => void
  article: AdminArticle | null
  onSuccess?: () => void
}

export function EditArticleModal({ isOpen, onClose, article, onSuccess }: EditArticleModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [readTimeMinutes, setReadTimeMinutes] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setContent(article.content)
      setCategory(article.category || "")
      setReadTimeMinutes(String(article.readTimeMinutes))
      setThumbnailFile(null)
      setThumbnailPreview(article.thumbnailUrl || null)
      setError(null)
    }
  }, [article])

  if (!isOpen || !article) return null

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

    if (!readTimeMinutes || isNaN(Number(readTimeMinutes)) || Number(readTimeMinutes) <= 0) {
      setError("Valid read time in minutes is required")
      return
    }

    setIsSubmitting(true)

    try {
      await updateArticle(article.id, {
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        readTimeMinutes: Number(readTimeMinutes),
        thumbnail: thumbnailFile || undefined,
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update article"
      setError(message)
      console.error("Failed to update article:", err)
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
            <h3 className="text-lg font-semibold text-foreground">Edit Article</h3>
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

