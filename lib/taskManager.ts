import { Task } from '@/types/schema'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks`)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}. ${errorText}`)
  }
  return response.json()
}

export const addTask = async (
  title: string,
  description: string | undefined,
  status: string,
  priority: string,
  label: string | undefined
): Promise<Task> => {
  const taskData: Partial<Task> = {
    title,
    status,
    priority,
  }

  if (description !== undefined) {
    taskData.description = description
  }

  if (label !== undefined) {
    taskData.label = label
  }

  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to add task: ${response.status} ${response.statusText}. ${errorText}`)
  }
  return response.json()
}

export const updateTask = async (task: Task): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    throw new Error('Failed to update task')
  }
  return response.json()
}

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}
