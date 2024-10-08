"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { CalendarIcon, Pencil, Trash2, ArrowUp, ArrowRight, ArrowDown, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
      });
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask,
          startDate: startDate?.toISOString(),
          dueDate: dueDate?.toISOString(),
          priority
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      setNewTask('');
      setStartDate(undefined);
      setDueDate(undefined);
      setPriority('medium');
      fetchTasks();
      toast({
        title: "Task added",
        description: "Your new task has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
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
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
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
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
      });
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set';
    return format(parseISO(date), "dd/MM/yyyy");
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
    if (isBefore(dueDateObj, today)) {
      return <AlertTriangle className="h-4 w-4 text-red-500" data-tooltip="Overdue" />;
    }
    if (isToday(dueDateObj)) {
      return <Clock className="h-4 w-4 text-yellow-500" data-tooltip="Due today" />;
    }
    return null;
  };

  const disablePastDates = (date: Date) => {
    return isAfter(date, new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(
              "w-[180px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy") : <span>Start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={disablePastDates}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(
              "w-[180px] justify-start text-left font-normal",
              !dueDate && "text-muted-foreground"
            )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={disablePastDates}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={addTask}>Add Task</Button>
      </div>
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
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-t">
                  <td className="p-2">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => updateTask({ ...task, completed: checked as boolean })}
                    />
                  </td>
                  <td className="p-2">
                    <span className={cn(task.completed && "line-through")}>{task.title}</span>
                    {getStatusIcon(task.dueDate)}
                  </td>
                  <td className="p-2">{formatDate(task.startDate)}</td>
                  <td className="p-2">{formatDate(task.dueDate)}</td>
                  <td className="p-2 flex items-center">
                    {getPriorityIcon(task.priority)}
                    <span className="ml-2">{task.priority}</span>
                  </td>
                  <td className="p-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        {editingTask && (
                          <div className="space-y-4">
                            <Input
                              value={editingTask.title}
                              onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                              placeholder="Task title"
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editingTask.startDate ? format(new Date(editingTask.startDate), "dd/MM/yyyy") : <span>Choose start date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editingTask.startDate ? new Date(editingTask.startDate) : undefined}
                                  onSelect={(date) => setEditingTask({...editingTask, startDate: date?.toISOString()})}
                                  disabled={disablePastDates}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editingTask.dueDate ? format(new Date(editingTask.dueDate), "dd/MM/yyyy") : <span>Choose due date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined}
                                  onSelect={(date) => setEditingTask({...editingTask, dueDate: date?.toISOString()})}
                                  disabled={disablePastDates}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <Select
                              value={editingTask.priority}
                              onValueChange={(value: 'low' | 'medium' | 'high') => setEditingTask({...editingTask, priority: value})}
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
                            <Button onClick={() => updateTask(editingTask)}>Save Changes</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
}
