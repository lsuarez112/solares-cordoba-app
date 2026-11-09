import { toast } from "sonner"

type ToastOptions = {
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

export const appToast = {
  success(message: string, options?: ToastOptions) {
    toast.success(message, options)
  },

  error(message: string, options?: ToastOptions) {
    toast.error(message, options)
  },

  info(message: string, options?: ToastOptions) {
    toast.info(message, options)
  },

  warning(message: string, options?: ToastOptions) {
    toast.warning(message, options)
  },
}
