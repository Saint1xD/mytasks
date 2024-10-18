// TaskList.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task, User, TaskActivity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, formatInTimeZone } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { parseISO } from 'date-fns';
import { CalendarIcon, Pencil, Trash2, ArrowUp, ArrowRight, ArrowDown, AlertTriangle, Clock, Plus, User as UserIcon, Calendar as CalendarIconSolid, PlayCircle, FlagIcon, ActivityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskContext } from '@/contexts/TaskContext';
import TaskDetails from '@/components/TaskDetails';

export default function TaskList() {
  const { tasks, refreshTasks } = useTaskContext();
  const [users, setUsers] = useState<User[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskActivities, setTaskActivities] = useState<TaskActivity[]>([]);

  const toUTCDateString = (date: Date) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
  };

  const getUserEmailById = (userId: number | null) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'Unassigned';
  };

  const formatDateWithOffset = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = addDays(parseISO(dateString), 1);
    return format(date, 'PPP');
  };

  const formatActivityDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'PPP p');
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshTasks();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [refreshTasks, toast]);

  const fetchTaskActivities = useCallback(async (taskId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const activities = await response.json();
        setTaskActivities(activities);
      } else {
        console.error('Failed to fetch task activities');
      }
    } catch (error) {
      console.error('Error fetching task activities:', error);
    }
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    fetchTaskActivities(task.id);
  }, [fetchTaskActivities]);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('API did not return an array:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
      });
      setUsers([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTask,
          description: newDescription,
          startDate,
          dueDate,
          priority,
          userId: assignedUserId ? parseInt(assignedUserId) : null,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      resetNewTaskForm();
      await refreshTasks();
      setIsAddTaskDialogOpen(false);
      toast({
        title: 'Task added',
        description: 'Your new task has been added successfully.',
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task. Please try again.',
      });
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(task),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      await refreshTasks();
      setEditingTask(null);
      setIsEditTaskDialogOpen(false);
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
      });
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      await refreshTasks();
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = parseISO(dateString);
    return formatInTimeZone(date, 'UTC', 'dd/MM/yyyy');
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (dueDate: string | undefined) => {
    if (!dueDate) return null;
    const dueDateObj = parseISO(dueDate);
    const today = new Date();
    if (dueDateObj < today) {
      return <AlertTriangle className="h-4 w-4 text-red-500" data-tooltip="Overdue" />;
    }
    if (dueDateObj.toDateString() === today.toDateString()) {
      return <Clock className="h-4 w-4 text-yellow-500" data-tooltip="Due today" />;
    }
    return null;
  };

  const disablePastDates = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  const resetNewTaskForm = () => {
    setNewTask('');
    setNewDescription('');
    setStartDate(undefined);
    setDueDate(undefined);
    setPriority('medium');
    setAssignedUserId(null);
  };

  const canManageTasks = user && (user.role === 'admin' || user.role === 'manager');

  const renderTaskTable = (tasks: Task[], isCompleted: boolean) => (
    <table className="w-full">
      <thead>
        <tr className="text-left bg-gray-100 dark:bg-gray-800">
          <th className="p-2 w-16">Status</th>
          <th className="p-2 w-1/3">Title</th>
          <th className="p-2 w-28">Start Date</th>
          <th className="p-2 w-28">Due Date</th>
          <th className="p-2 w-24">Priority</th>
          <th className="p-2 w-48">Assigned To</th>
          {canManageTasks && <th className="p-2 w-24">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => {
          const assignedUser = users.find((u) => u.id === task.userId);
          return (
            <tr key={task.id} className="border-t">
              <td className="p-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => updateTask({ ...task, completed: checked as boolean })}
                  />
                  {getStatusIcon(task.dueDate)}
                </div>
              </td>
              <td className="p-2">
                <Button
                  variant="link"
                  className={cn(
                    "text-left break-words h-[56px] flex items-center",
                    task.completed && "line-through"
                  )}
                  onClick={() => handleTaskClick(task)}
                >
                  <span className="inline-block max-w-[200px] whitespace-normal">
                    {task.title}
                  </span>
                </Button>
              </td>
              <td className="p-2">{formatDate(task.startDate)}</td>
              <td className="p-2">{formatDate(task.dueDate)}</td>
              <td className="p-2">
                <div className="flex items-center">
                  {getPriorityIcon(task.priority)}
                  <span className="ml-2">{task.priority}</span>
                </div>
              </td>
              <td className="p-2">
                {assignedUser ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      {assignedUser.avatarUrl ? (
                        <AvatarImage src={assignedUser.avatarUrl} alt={assignedUser.email} />
                      ) : (
                        <AvatarFallback>{assignedUser.email.charAt(0).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="truncate max-w-[120px]">{assignedUser.email}</span>
                  </div>
                ) : (
                  <span>Unassigned</span>
                )}
              </td>
              {canManageTasks && (
                <td className="p-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingTask(task);
                        setIsEditTaskDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-8">
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">In Progress</h2>
              {canManageTasks && (
                <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>Enter the details for the new task.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Task title" />
                      <Textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Task description"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? formatDate(startDate) : <span>Start date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate ? parseISO(startDate) : undefined}
                            onSelect={(date) => setStartDate(date ? toUTCDateString(date) : undefined)}
                            disabled={disablePastDates}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? formatDate(dueDate) : <span>Due date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate ? parseISO(dueDate) : undefined}
                            onSelect={(date) => setDueDate(date ? toUTCDateString(date) : undefined)}
                            disabled={disablePastDates}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={assignedUserId || 'unassigned'}
                        onValueChange={(value) => setAssignedUserId(value === 'unassigned' ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addTask}>Add Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {renderTaskTable(tasks.filter(task => !task.completed), false)}
          </div>
          <div className="overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Completed</h2>
            {renderTaskTable(tasks.filter(task => task.completed), true)}
          </div>
        </>
      ) : (
        <p>No tasks available.</p>
      )}

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <TaskDetails
            selectedTask={selectedTask}
            taskActivities={taskActivities}
            users={users}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the details of your task.</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <Input
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="Task title"
              />
              <Textarea
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, description: e.target.value })
                }
                placeholder="Task description"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                    {editingTask.startDate ? formatDate(editingTask.startDate) : <span>Choose start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editingTask.startDate ? parseISO(editingTask.startDate) : undefined}
                    onSelect={(date) =>
                      setEditingTask({
                        ...editingTask,
                        startDate: date ? toUTCDateString(date) : undefined,
                      })
                    }
                    disabled={disablePastDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <FlagIcon className="mr-2 h-4 w-4 text-red-500" />
                    {editingTask.dueDate ? formatDate(editingTask.dueDate) : <span>Choose due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editingTask.dueDate ? parseISO(editingTask.dueDate) : undefined}
                    onSelect={(date) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: date ? toUTCDateString(date) : undefined,
                      })
                    }
                    disabled={disablePastDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={editingTask.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  setEditingTask({ ...editingTask, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={editingTask.userId?.toString() || 'unassigned'}
                onValueChange={(value) =>
                  setEditingTask({
                    ...editingTask,
                    userId: value === 'unassigned' ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => updateTask(editingTask)}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
