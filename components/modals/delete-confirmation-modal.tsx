"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  itemName: string
  itemType: string
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  itemName, 
  itemType 
}: DeleteConfirmationModalProps) {
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-[110]"
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <span className="font-semibold text-foreground">{itemName}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1 cursor-pointer">Cancel</Button>
            <Button onClick={onConfirm} className="flex-1 cursor-pointer bg-destructive hover:bg-destructive/90 text-white">Delete</Button>
          </div>
        </Card>
      </motion.div>
    </>
  )
}
