"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import { columns } from "@/components/columns"
import { DataTable } from "@/components/data-table"
import { UserNav } from "@/components/user-nav"
import { getTasks } from "@/data/taskManager"
import { Task } from "@/data/schema"

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
    }
    fetchTasks()
  }, [])

  const handleDataChange = async () => {
    const fetchedTasks = await getTasks()
    setTasks(fetchedTasks)
  }

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
    }
    fetchTasks()
  }, [])

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
        <DataTable data={tasks} columns={columns} onDataChange={handleDataChange} />
      </div>
    </>
  )
}
