import { Task } from './schema'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks`)
  return response.json()
}

export const addTask = async (title: string, status: string, priority: string, label: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, status, priority, label }),
  })
  return response.json()
}

export const updateTask = async (task: Task): Promise<Task | null> => {
  const response = await fetch(`${API_URL}/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
  return response.ok ? response.json() : null
}

export const deleteTask = async (id: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  })
  return response.ok
}
