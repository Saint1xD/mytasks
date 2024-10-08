"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    console.log('Fetching tasks...');
    try {
      const response = await fetch('/api/tasks');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      console.log('Received data:', data);
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
        body: JSON.stringify({ title: newTask, dueDate, priority }),
      });
      console.log('Add task response:', response.status);
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      setNewTask('');
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
      console.log('Update task response:', response.status);
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
      console.log('Delete task response:', response.status);
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
              "w-[240px] justify-start text-left font-normal",
              !dueDate && "text-muted-foreground"
            )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
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
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center space-x-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => updateTask({ ...task, completed: checked as boolean })}
              />
              {editingTask?.id === task.id ? (
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              ) : (
                <span className={cn(task.completed && "line-through")}>{task.title}</span>
              )}
              <span className="text-sm text-muted-foreground">
                {task.dueDate && format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
              <span className="text-sm font-medium">{task.priority}</span>
              {editingTask?.id === task.id ? (
                <Button onClick={() => updateTask(editingTask)}>Save</Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks available.</p>
      )}
    </div>
  );
}
