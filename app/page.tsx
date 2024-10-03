"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { columns } from "@/components/columns"
import { DataTable } from "@/components/data-table/data-table"
import { UserNav } from "@/components/user-nav"
import { getTasks, updateTask, deleteTask, addTask } from "@/lib/taskManager"
import { Task } from "@/types/schema"

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks()
        setTasks(fetchedTasks)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch tasks:", err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
    }
    fetchTasks()
  }, [])

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask)
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      )
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleTaskAdd = async (newTask: Omit<Task, 'id'>) => {
    try {
      const addedTask = await addTask(
        newTask.title,
        newTask.description ?? "", // Use empty string as default if description is undefined
        newTask.status,
        newTask.priority,
        newTask.label ?? ""
      )
      setTasks(currentTasks => [...currentTasks, addedTask])
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <DataTable
          data={tasks}
          columns={columns}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskAdd={handleTaskAdd}
        />
      </div>
    </>
  )
}
