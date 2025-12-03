"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { type AdminUser } from "@/lib/api"

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen || !user) return null

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
            <h3 className="text-lg font-semibold text-foreground">User Details</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Name</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {user.name || <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Email</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Subscription Type</label>
                <p className="text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.currentSubscriptionType === "Premium"
                        ? "bg-accent/20 text-accent"
                        : user.currentSubscriptionType === "Coach"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/50 text-foreground"
                    }`}
                  >
                    {user.currentSubscriptionType}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Email Verified</label>
                <p className="text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.isEmailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.isEmailVerified ? "Verified" : "Not Verified"}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Login Method</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {user.isOAuthUser ? (user.oauthProvider || "OAuth") : "Email/Password"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Assessment Status</label>
                <p className="text-sm">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.hasCompletedAssessment ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.hasCompletedAssessment ? "Completed" : "Not Completed"}
                  </span>
                </p>
              </div>

              {user.age && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Age</label>
                  <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">{user.age}</p>
                </div>
              )}

              {user.lastLogin && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Last Login</label>
                  <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}

              {user.focusAreas.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-2">Focus Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {user.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Created At</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Updated At</label>
                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                  {new Date(user.updatedAt).toLocaleString()}
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

