"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { type AdminArticle } from "@/lib/api"

interface ViewArticleModalProps {
  isOpen: boolean
  onClose: () => void
  article: AdminArticle | null
}

export function ViewArticleModal({ isOpen, onClose, article }: ViewArticleModalProps) {
  if (!isOpen || !article) return null

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-3xl z-[110] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Article Details</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Thumbnail Preview */}
            {article.thumbnailUrl && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Thumbnail</label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Title</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">{article.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Read Time</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {article.readTimeMinutes} {article.readTimeMinutes === 1 ? "minute" : "minutes"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Category</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {article.category || <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                <p className="text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      article.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                    }`}
                  >
                    {article.isActive ? "Published" : "Inactive"}
                  </span>
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-2">Content</label>
                <div className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {article.content}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Thumbnail URL</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg break-all">
                  {article.thumbnailUrl || <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Created At</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {new Date(article.createdAt).toLocaleString()}
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

