"use client"

import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
  type ToastActionElement,
} from "@/components/ui/toast"
import { createContext, useContext, useState } from "react"

const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const ToastContext = createContext<{
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToasterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const addToast = React.useCallback(
    ({ ...props }: Omit<ToasterToast, "id">) => {
      setToasts((currentToasts) => {
        const id = Math.random().toString(36).substring(2, 9)
        return [...currentToasts, { id, ...props }]
      })
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    )
  }, [])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const { addToast } = useContext(ToastContext)

  return {
    toast: addToast,
    dismiss: () => {},
  }
}

export function Toaster() {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} onOpenChange={() => removeToast(id)}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
} 