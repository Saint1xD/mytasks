"use client";

import { useState, useCallback } from 'react'

type ToastProps = {
  id?: number
  title: string
  description?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback(({ title, description = '', duration = 3000 }: ToastProps) => {
    const id = Date.now()
    setToasts(currentToasts => [...currentToasts, { id, title, description, duration }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id))
      }, duration)
    }
  }, [])

  return { toast: addToast, toasts }
}
