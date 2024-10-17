"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format, isToday, isPast, differenceInDays } from "date-fns";
import { AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { useTaskContext } from '@/contexts/TaskContext';

export default function Dashboard() {
  const { tasks, refreshTasks } = useTaskContext();

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const upcomingDeadlines = tasks
    .filter(task => !task.completed && task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const getDeadlineIcon = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date)) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (isToday(date)) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CalendarDays className="h-4 w-4 text-green-500" />;
    }
  };

  const getDeadlineText = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date)) {
      return "Overdue";
    } else if (isToday(date)) {
      return "Due today";
    } else {
      const daysLeft = differenceInDays(date, new Date());
      return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
    }
  };

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
                <div className="flex items-center space-x-2">
                  {getDeadlineIcon(task.dueDate!)}
                  <span className="truncate">{task.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    {getDeadlineText(task.dueDate!)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {upcomingDeadlines.length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
