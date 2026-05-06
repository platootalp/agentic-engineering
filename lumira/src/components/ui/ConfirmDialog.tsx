'use client'
import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="
              relative z-10
              w-full max-w-md mx-4
              rounded-2xl border border-border
              bg-card
              p-6
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              id="confirm-dialog-title"
              className="text-xl font-semibold text-foreground mb-2"
            >
              {title}
            </h2>

            <p 
              id="confirm-dialog-description"
              className="text-muted-foreground mb-6 leading-relaxed"
            >
              {description}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => onOpenChange(false)}
                className="
                  px-4 py-2
                  rounded-lg
                  bg-muted hover:bg-muted/80
                  text-muted-foreground hover:text-foreground
                  font-medium
                  transition-all duration-200
                "
              >
                {cancelText}
              </button>

              <button
                onClick={() => {
                  onConfirm()
                  onOpenChange(false)
                }}
                className="
                  px-4 py-2
                  rounded-lg
                  bg-destructive hover:bg-destructive/90
                  text-white
                  font-medium
                  transition-all duration-200
                  hover:shadow-lg hover:shadow-destructive/25
                "
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}