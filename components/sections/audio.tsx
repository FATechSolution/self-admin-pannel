"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Eye, Search, RefreshCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddAudioModal } from "@/components/modals/add-audio-modal"
import { EditAudioModal } from "@/components/modals/edit-audio-modal"
import { ViewAudioModal } from "@/components/modals/view-audio-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { fetchAdminAudios, deleteAudio, type AdminAudio } from "@/lib/api"

function formatDuration(seconds: number) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function AudioSection() {
  const [showAddAudio, setShowAddAudio] = useState(false)
  const [showEditAudio, setShowEditAudio] = useState(false)
  const [showViewAudio, setShowViewAudio] = useState(false)
  const [showDeleteAudio, setShowDeleteAudio] = useState(false)
  const [selectedAudio, setSelectedAudio] = useState<AdminAudio | null>(null)
  const [audios, setAudios] = useState<AdminAudio[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadAudios = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminAudios({ page: 1, limit: 50 })
        setAudios(res.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load audios"
        setError(message)
        console.error("Failed to load audios:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAudios()
  }, [refreshKey])

  const filteredAudios = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return audios
    return audios.filter((a) => a.title.toLowerCase().includes(term) || (a.category ?? "").toLowerCase().includes(term))
  }, [audios, search])

  return (
    <>
      <AnimatePresence>
        <AddAudioModal
          isOpen={showAddAudio}
          onClose={() => setShowAddAudio(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      </AnimatePresence>

      <AnimatePresence>
        <EditAudioModal
          isOpen={showEditAudio}
          onClose={() => {
            setShowEditAudio(false)
            setSelectedAudio(null)
          }}
          audio={selectedAudio}
          onSuccess={() => {
            setRefreshKey((k) => k + 1)
            setShowEditAudio(false)
            setSelectedAudio(null)
          }}
        />
      </AnimatePresence>

      <AnimatePresence>
        <ViewAudioModal
          isOpen={showViewAudio}
          onClose={() => {
            setShowViewAudio(false)
            setSelectedAudio(null)
          }}
          audio={selectedAudio}
        />
      </AnimatePresence>

      <AnimatePresence>
        {selectedAudio && (
          <DeleteConfirmationModal
            isOpen={showDeleteAudio}
            onClose={() => {
              setShowDeleteAudio(false)
              setSelectedAudio(null)
            }}
            onConfirm={async () => {
              if (!selectedAudio) return
              try {
                setIsLoading(true)
                setError(null)
                await deleteAudio(selectedAudio.id)
                setShowDeleteAudio(false)
                setSelectedAudio(null)
                setRefreshKey((k) => k + 1)
              } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete audio"
                setError(message)
                console.error("Failed to delete audio:", err)
              } finally {
                setIsLoading(false)
              }
            }}
            title="Delete Audio"
            itemName={selectedAudio.title}
            itemType="audio"
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search audio files..."
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
            <Button onClick={() => setShowAddAudio(true)} className="flex-1 sm:flex-none gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm h-10 sm:h-11">
              <Plus size={16} />
              <span>Upload Audio</span>
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
                Loading audios...
              </div>
            </div>
          )}

          {!isLoading && filteredAudios.length === 0 && !error && (
            <div className="py-8 sm:py-10 flex items-center justify-center text-xs sm:text-sm text-muted-foreground text-center px-4">
              No audios found. Try adjusting your search or upload a new audio.
            </div>
          )}

          {/* Mobile Card View */}
          {!isLoading && filteredAudios.length > 0 && (
            <div className="block md:hidden divide-y divide-border">
              {filteredAudios.map((audio) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 sm:p-4 space-y-2 sm:space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2">{audio.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {formatDuration(audio.durationSeconds)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        audio.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                      }`}
                    >
                      {audio.isActive ? "Published" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {audio.category && (
                      <span className="px-2 py-0.5 bg-secondary/50 rounded text-muted-foreground">
                        {audio.category}
                      </span>
                    )}
                    {(audio.needLabel || audio.needKey) && (
                      <span className="px-2 py-0.5 bg-primary/10 rounded text-primary">
                        {audio.needLabel || audio.needKey}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 pt-1">
                    <button
                      onClick={() => {
                        setSelectedAudio(audio)
                        setShowViewAudio(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-primary/10 hover:bg-primary/20 rounded text-primary text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAudio(audio)
                        setShowEditAudio(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-secondary/50 hover:bg-secondary rounded text-foreground text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAudio(audio)
                        setShowDeleteAudio(true)
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
          {!isLoading && filteredAudios.length > 0 && (
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
                  {filteredAudios.map((audio) => (
                    <motion.tr
                      key={audio.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: "rgb(0, 0, 0, 0.02)" }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-foreground">
                        <span className="line-clamp-2">{audio.title}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                        {formatDuration(audio.durationSeconds)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground">
                        {audio.category || <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground hidden lg:table-cell">
                        {audio.needLabel || audio.needKey || <span className="text-muted-foreground/60">—</span>}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm">
                        <span
                          className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            audio.isActive ? "bg-accent/20 text-accent" : "bg-secondary/50 text-foreground"
                          }`}
                        >
                          {audio.isActive ? "Published" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedAudio(audio)
                              setShowViewAudio(true)
                            }}
                            className="p-1.5 lg:p-2 hover:bg-primary/10 rounded transition-colors text-primary cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAudio(audio)
                              setShowEditAudio(true)
                            }}
                            className="p-1.5 lg:p-2 hover:bg-secondary/50 rounded transition-colors text-foreground cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAudio(audio)
                              setShowDeleteAudio(true)
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
