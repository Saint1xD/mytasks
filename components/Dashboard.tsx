"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Task } from "@/lib/types";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error('API did not return an array:', data);
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const upcomingDeadlines = tasks
    .filter(task => !task.completed && task.dueDate && new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Task Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {upcomingDeadlines.map(task => (
              <li key={task.id} className="flex justify-between items-center">
                <span>{task.title}</span>
                <span className="text-sm text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
