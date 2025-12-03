"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  if (!isOpen) return null



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
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Add New User</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Name</label>
              <Input placeholder="Enter user name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email</label>
              <Input type="email" placeholder="Enter email address" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Role</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground">
                <option>User</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Status</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1 cursor-pointer">Cancel</Button>
              <Button className="flex-1 cursor-pointer">Add User</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  )
}
