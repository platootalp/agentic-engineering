"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from 'framer-motion'

const Sheet = DialogPrimitive.Root

const SheetTrigger = DialogPrimitive.Trigger

const SheetClose = DialogPrimitive.Close

const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        className
      )}
      {...props}
      ref={ref}
    />
  </motion.div>
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "top" | "bottom" | "left" | "right"
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => {
  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  }

  return (
    <SheetPortal>
      <AnimatePresence>
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SheetOverlay />
          </motion.div>
          <DialogPrimitive.Content
            ref={ref}
            forceMount
            className={cn(
              "fixed z-50 gap-4 bg-card p-6 shadow-lg",
              sideClasses[side],
              className
            )}
            asChild
            {...props}
          >
            <motion.div
              initial={side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : side === 'top' ? { y: '-100%' } : { y: '100%' }}
              animate={{ x: 0, y: 0 }}
              exit={side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : side === 'top' ? { y: '-100%' } : { y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {children}
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </motion.div>
          </DialogPrimitive.Content>
        </>
      </AnimatePresence>
    </SheetPortal>
  )
})
SheetContent.displayName = DialogPrimitive.Content.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
}
