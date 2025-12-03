"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Eye, Search, RefreshCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddArticleModal } from "@/components/modals/add-article-modal"
import { EditArticleModal } from "@/components/modals/edit-article-modal"
import { ViewArticleModal } from "@/components/modals/view-article-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { fetchAdminArticles, deleteArticle, type AdminArticle } from "@/lib/api"

export function ArticleSection() {
  const [showAddArticle, setShowAddArticle] = useState(false)
  const [showEditArticle, setShowEditArticle] = useState(false)
  const [showViewArticle, setShowViewArticle] = useState(false)
  const [showDeleteArticle, setShowDeleteArticle] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<AdminArticle | null>(null)
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminArticles({ page: 1, limit: 50 })
        setArticles(res.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load articles"
        setError(message)
        console.error("Failed to load articles:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [refreshKey])

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return articles
    return articles.filter(
      (a) => a.title.toLowerCase().includes(term) || (a.category ?? "").toLowerCase().includes(term)
    )
  }, [articles, search])

  return (
    <>
      <AnimatePresence>
        <AddArticleModal
          isOpen={showAddArticle}
          onClose={() => setShowAddArticle(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      </AnimatePresence>

      <AnimatePresence>
        <EditArticleModal
          isOpen={showEditArticle}
          onClose={() => {
            setShowEditArticle(false)
            setSelectedArticle(null)
          }}
          article={selectedArticle}
          onSuccess={() => {
            setRefreshKey((k) => k + 1)
            setShowEditArticle(false)
            setSelectedArticle(null)
          }}
        />
      </AnimatePresence>

      <AnimatePresence>
        <ViewArticleModal
          isOpen={showViewArticle}
          onClose={() => {
            setShowViewArticle(false)
            setSelectedArticle(null)
          }}
          article={selectedArticle}
        />
      </AnimatePresence>

      <AnimatePresence>
        {selectedArticle && (
          <DeleteConfirmationModal
            isOpen={showDeleteArticle}
            onClose={() => {
              setShowDeleteArticle(false)
              setSelectedArticle(null)
            }}
            onConfirm={async () => {
              if (!selectedArticle) return
              try {
                setIsLoading(true)
                setError(null)
                await deleteArticle(selectedArticle.id)
                setShowDeleteArticle(false)
                setSelectedArticle(null)
                setRefreshKey((k) => k + 1)
              } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete article"
                setError(message)
                console.error("Failed to delete article:", err)
              } finally {
                setIsLoading(false)
              }
            }}
            title="Delete Article"
            itemName={selectedArticle.title}
            itemType="article"
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search articles..."
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
            <Button onClick={() => setShowAddArticle(true)} className="w-full sm:w-auto gap-2 cursor-pointer">
              <Plus size={18} />
              Add Article
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
                Loading articles...
              </div>
            </div>
          )}

          {!isLoading && filteredArticles.length === 0 && !error && (
            <div className="py-10 flex items-center justify-center text-sm text-muted-foreground">
              No articles found. Try adjusting your search or add a new article.
            </div>
          )}

          {!isLoading && filteredArticles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Read Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredArticles.map((article) => (
                    <motion.tr
                      key={article.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "rgb(0, 0, 0, 0.02)" }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">{article.title}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {article.readTimeMinutes} {article.readTimeMinutes === 1 ? "min" : "mins"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {article.category || <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            article.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                          }`}
                        >
                          {article.isActive ? "Published" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedArticle(article)
                              setShowViewArticle(true)
                            }}
                            className="p-2 hover:bg-primary/10 rounded transition-colors text-primary cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedArticle(article)
                              setShowEditArticle(true)
                            }}
                            className="p-2 hover:bg-secondary/50 rounded transition-colors text-foreground cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedArticle(article)
                              setShowDeleteArticle(true)
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

