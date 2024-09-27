import { Task } from './schema'

const API_URL = 'http://localhost:8080'

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

export const updateTaskStatus = async (id: string, status: string): Promise<Task | null> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  return response.ok ? response.json() : null
}

export const updateTaskPriority = async (id: string, priority: string): Promise<Task | null> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priority }),
  })
  return response.ok ? response.json() : null
}

export const deleteTask = async (id: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  })
  return response.ok
}
