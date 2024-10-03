import { z } from "zod"

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.string(),
  label: z.string().nullable().optional(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>
