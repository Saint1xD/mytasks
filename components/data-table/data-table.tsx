"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { statuses, priorities, labels } from "@/data/data"
import { Task } from "@/types/schema"
import { DataTableRowActions } from "./data-table-row-actions"
import { TaskDetailsDialog } from "./task-details-dialog"

interface DataTableProps<TData extends Task, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskAdd: (task: Omit<Task, 'id'>) => void
}

export function DataTable<TData extends Task, TValue>({
  columns,
  data,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false)
  const [newTaskTitle, setNewTaskTitle] = React.useState("")
  const [newTaskDescription, setNewTaskDescription] = React.useState("")
  const [newTaskStatus, setNewTaskStatus] = React.useState("todo")
  const [newTaskPriority, setNewTaskPriority] = React.useState("medium")
  const [newTaskLabel, setNewTaskLabel] = React.useState("no_label")

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onTaskUpdate: (updatedTask: Task) => {
        onTaskUpdate(updatedTask)
      },
      onTaskDelete: (taskId: string) => {
        onTaskDelete(taskId)
      },
    },
  })

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        await onTaskAdd({
          title: newTaskTitle,
          description: newTaskDescription,
          status: newTaskStatus,
          priority: newTaskPriority,
          label: newTaskLabel === "no_label" ? "" : newTaskLabel,
        })
        setNewTaskTitle("")
        setNewTaskDescription("")
        setNewTaskStatus("todo")
        setNewTaskPriority("medium")
        setNewTaskLabel("no_label")
        setIsAddTaskOpen(false)
      } catch (error) {
        console.error("Failed to add task:", error)
        // You might want to show an error message to the user here
      }
    }
  }

  const handleDeleteSelected = (ids: string[]) => {
    setSelectedIds(ids)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    selectedIds.forEach(id => onTaskDelete(id))
    table.resetRowSelection()
    setIsDeleteConfirmOpen(false)
  }

  const handleRowClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} onDeleteSelected={handleDeleteSelected} />
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogTrigger asChild>
          <Button>Add Task</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Fill in the details to add a new task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <Textarea
              placeholder="Task description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newTaskLabel} onValueChange={setNewTaskLabel}>
              <SelectTrigger>
                <SelectValue placeholder="Select label (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_label">No Label</SelectItem>
                {labels.map((label) => (
                  <SelectItem key={label.value} value={label.value}>
                    {label.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete {selectedIds.length} selected task(s)? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} onClick={(e) => {
                        // Prevent opening details when clicking on checkbox or actions
                        if (cell.column.id !== 'select' && cell.column.id !== 'actions') {
                          e.stopPropagation()
                          handleRowClick(row.original)
                        }
                      }}>
                        {cell.column.id === "actions" ? (
                          <DataTableRowActions
                            row={row}
                            onTaskUpdate={onTaskUpdate}
                            onTaskDelete={onTaskDelete}
                          />
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
        <TaskDetailsDialog
          task={selectedTask}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
  )
}
