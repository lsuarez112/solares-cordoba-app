import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const toastStyle = {
  "--normal-bg": "#09090b",
  "--normal-text": "#fafafa",
  "--normal-border": "#27272a",
  "--success-bg": "#09090b",
  "--success-text": "#fafafa",
  "--success-border": "#27272a",
  "--error-bg": "#09090b",
  "--error-text": "#fafafa",
  "--error-border": "#27272a",
  "--warning-bg": "#09090b",
  "--warning-text": "#fafafa",
  "--warning-border": "#27272a",
  "--info-bg": "#09090b",
  "--info-text": "#fafafa",
  "--info-border": "#27272a",
  "--border-radius": "var(--radius)",
} as React.CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-sky-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white" />,
      }}
      style={toastStyle}
      toastOptions={{
        classNames: {
          toast:
            "group toast border border-zinc-800 bg-zinc-950 text-white shadow-lg",
          title: "text-white",
          description: "text-zinc-300",
          actionButton: "bg-white text-zinc-950",
          cancelButton: "border-zinc-700 bg-zinc-900 text-white",
          closeButton:
            "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
