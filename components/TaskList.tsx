// TaskList.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { CalendarIcon, Pencil, Trash2, ArrowUp, ArrowRight, ArrowDown, AlertTriangle, Clock, Plus, User as UserIcon, Calendar as CalendarIconSolid, PlayCircle, FlagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
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
  const { toast } = useToast();
  const { user } = useAuth();

  const toUTCDateString = (date: Date) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('API did not return an array:', data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
      });
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
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
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      fetchTasks();
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
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      fetchTasks();
      setEditingTask(null);
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
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      fetchTasks();
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

  return (
    <div className="space-y-4">
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

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-100 dark:bg-gray-800">
                <th className="p-2">Status</th>
                <th className="p-2">Title</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">Due Date</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Assigned To</th>
                {canManageTasks && <th className="p-2">Actions</th>}
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className={cn(task.completed && 'line-through')}>
                            {task.title}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              {/* <h4 className="text-sm font-medium">Description</h4> */}
                              <p className="text-sm text-muted-foreground">{task.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <UserIcon className="h-4 w-4" />
                              <span className="text-sm">
                                {assignedUser ? assignedUser.email : 'Unassigned'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarIconSolid className="h-4 w-4" />
                              <span className="text-sm">Start: {formatDate(task.startDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CalendarIconSolid className="h-4 w-4" />
                              <span className="text-sm">Due: {formatDate(task.dueDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPriorityIcon(task.priority)}
                              <span className="text-sm capitalize">{task.priority} Priority</span>
                            </div>
                            <Badge variant={task.completed ? 'secondary' : 'default'}>
                              {task.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="p-2">{formatDate(task.startDate)}</td>
                    <td className="p-2">{formatDate(task.dueDate)}</td>
                    <td className="p-2 flex items-center">
                      {getPriorityIcon(task.priority)}
                      <span className="ml-2">{task.priority}</span>
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
                          <span>{assignedUser.email}</span>
                        </div>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </td>
                    {canManageTasks && (
                      <td className="p-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTask(task)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Task</DialogTitle>
                              <DialogDescription>
                                Update the details of your task.
                              </DialogDescription>
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
                        <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
}
