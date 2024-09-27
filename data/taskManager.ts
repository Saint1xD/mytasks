import { Task } from './schema'
import { v4 as uuidv4 } from 'uuid'
import initialTasks from './tasks.json'

let tasks: Task[] = initialTasks

export const getTasks = () => tasks

export const addTask = (title: string, status: string, priority: string) => {
  const newTask: Task = {
    id: uuidv4(),
    title,
    status,
    priority,
    label
  }
  tasks.push(newTask)
  return newTask
}

export const updateTaskStatus = (id: string, status: string) => {
  const task = tasks.find(t => t.id === id)
  if (task) {
    task.status = status
    return task
  }
  return null
}

export const updateTaskPriority = (id: string, priority: string) => {
  const task = tasks.find(t => t.id === id)
  if (task) {
    task.priority = priority
    return task
  }
  return null
}

export const deleteTask = (id: string) => {
  const index = tasks.findIndex(t => t.id === id)
  if (index !== -1) {
    return tasks.splice(index, 1)[0]
  }
  return null
}
