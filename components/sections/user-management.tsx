"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Search, RefreshCcw, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ViewUserModal } from "@/components/modals/view-user-modal"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { fetchAdminUsers, deleteAdminUser, type AdminUser } from "@/lib/api"

export function UserManagementSection() {
  const [showViewUser, setShowViewUser] = useState(false)
  const [showDeleteUser, setShowDeleteUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchAdminUsers({ page: 1, limit: 50 })
        setUsers(res.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load users"
        setError(message)
        console.error("Failed to load users:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [refreshKey])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [users, search])

  return (
    <>
      <AnimatePresence>
        <ViewUserModal
          isOpen={showViewUser}
          onClose={() => {
            setShowViewUser(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && (
          <DeleteConfirmationModal
            isOpen={showDeleteUser}
            onClose={() => {
              setShowDeleteUser(false)
              setSelectedUser(null)
            }}
            onConfirm={async () => {
              if (!selectedUser) return
              try {
                setIsLoading(true)
                setError(null)
                await deleteAdminUser(selectedUser.id)
                setShowDeleteUser(false)
                setSelectedUser(null)
                setRefreshKey((k) => k + 1)
              } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to delete user"
                setError(message)
                console.error("Failed to delete user:", err)
              } finally {
                setIsLoading(false)
              }
            }}
            title="Delete User"
            itemName={selectedUser.name || selectedUser.email}
            itemType="user"
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search users..."
              className="pl-10 w-full text-sm sm:text-base h-10 sm:h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-1.5 sm:gap-2 cursor-pointer w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-11"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={isLoading}
          >
            <RefreshCcw className={isLoading ? "animate-spin" : ""} size={14} />
            <span>Refresh</span>
          </Button>
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

        <Card className="overflow-hidden relative group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 overflow-x-auto">
            {isLoading && (
              <div className="py-8 sm:py-10 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading users...
                </div>
              </div>
            )}

            {!isLoading && filteredUsers.length === 0 && !error && (
              <div className="py-8 sm:py-10 flex items-center justify-center text-xs sm:text-sm text-muted-foreground text-center px-4">
                No users found. Try adjusting your search.
              </div>
            )}

            {/* Mobile Card View */}
            {!isLoading && filteredUsers.length > 0 && (
              <div className="block md:hidden divide-y divide-border">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 sm:p-4 space-y-2 sm:space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm text-foreground">
                          {user.name || <span className="text-muted-foreground/60">No name</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 break-all">{user.email}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          user.hasCompletedAssessment
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.hasCompletedAssessment ? "Done" : "Pending"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.currentSubscriptionType === "Premium"
                              ? "bg-accent/20 text-accent"
                              : user.currentSubscriptionType === "Coach"
                              ? "bg-primary/20 text-primary"
                              : user.currentSubscriptionType === "Gold"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-foreground"
                          }`}
                        >
                          {user.currentSubscriptionType}
                        </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isOAuthUser
                            ? user.oauthProvider === "google"
                              ? "bg-red-100 text-red-700"
                              : user.oauthProvider === "apple"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.isOAuthUser
                          ? user.oauthProvider
                            ? user.oauthProvider.charAt(0).toUpperCase() + user.oauthProvider.slice(1)
                            : "OAuth"
                          : "Email"}
                      </span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowViewUser(true)
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-primary/10 hover:bg-primary/20 rounded text-primary text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeleteUser(true)
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
            {!isLoading && filteredUsers.length > 0 && (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead style={{ backgroundColor: "#ceeafe" }} className="border-b border-border">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">
                        Subscription
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground hidden lg:table-cell">
                        Auth Method
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">
                        Assessment
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: "rgb(0, 0, 0, 0.02)" }}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-foreground">
                          {user.name || <span className="text-muted-foreground/60">—</span>}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-muted-foreground break-all">
                          {user.email}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm">
                          <span
                            className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                              user.currentSubscriptionType === "Premium"
                                ? "bg-accent/20 text-accent"
                                : user.currentSubscriptionType === "Coach"
                                ? "bg-primary/20 text-primary"
                                : user.currentSubscriptionType === "Gold"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-foreground"
                            }`}
                          >
                            {user.currentSubscriptionType}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm hidden lg:table-cell">
                          <span
                            className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                              user.isOAuthUser
                                ? user.oauthProvider === "google"
                                  ? "bg-red-100 text-red-700"
                                  : user.oauthProvider === "apple"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.isOAuthUser
                              ? user.oauthProvider
                                ? user.oauthProvider.charAt(0).toUpperCase() + user.oauthProvider.slice(1)
                                : "OAuth"
                              : "Email"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm">
                          <span
                            className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                              user.hasCompletedAssessment
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.hasCompletedAssessment ? "Completed" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowViewUser(true)
                              }}
                              className="p-1.5 lg:p-2 hover:bg-primary/10 rounded transition-colors text-primary cursor-pointer"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteUser(true)
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
          </div>
        </Card>
      </motion.div>
    </>
  )
}
