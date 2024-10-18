"use client";

import React from 'react';
import { Task, TaskActivity, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FlagIcon, UserIcon, ActivityIcon } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailsProps {
  selectedTask: Task | null;
  taskActivities: TaskActivity[];
  users: User[];
}

export default function TaskDetails({ selectedTask, taskActivities, users }: TaskDetailsProps) {
  const formatDateWithOffset = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    const date = addDays(parseISO(dateString), 1);
    return format(date, 'PPP');
  };

  const formatActivityDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'PPP p');
  };

  const getUserEmailById = (userId: number | null) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'Unassigned';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="text-green-500">↓</span>;
      case 'medium':
        return <span className="text-yellow-500">→</span>;
      case 'high':
        return <span className="text-red-500">↑</span>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="col-span-1">
            <div className="flex flex-col space-y-2">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge
                  variant={selectedTask?.completed ? 'default' : 'secondary'}
                  className={cn(
                    "mt-1",
                    selectedTask?.completed && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {selectedTask?.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{selectedTask?.description || 'No description'}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <div className="flex items-center mt-1">
                {getPriorityIcon(selectedTask?.priority || 'medium')}
                <span className="ml-2 capitalize">{selectedTask?.priority}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned To</p>
              <p className="mt-1">{getUserEmailById(selectedTask?.userId ?? null)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date (Initial Date)</p>
              <div className="flex items-center mt-1">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <p>{formatDateWithOffset(selectedTask?.startDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date (Deadline)</p>
              <div className="flex items-center mt-1">
                <FlagIcon className="mr-2 h-4 w-4" />
                <p>{formatDateWithOffset(selectedTask?.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
        <div className="max-h-60 overflow-y-auto">
          {taskActivities.length > 0 ? (
            <ul className="space-y-4">
              {taskActivities.map((activity) => (
                <li key={activity.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <ActivityIcon className="w-4 h-4 text-blue-500" />
                    <p className="font-medium">{activity.userEmail} {activity.action}d the task</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{formatActivityDate(activity.createdAt)}</p>
                  <ul className="text-sm space-y-1">
                    {Object.entries(activity.details)
                      .sort(([a], [b]) => a === 'start_date' ? -1 : b === 'start_date' ? 1 : 0)
                      .map(([key, value]: [string, any]) => {
                      if (key === 'start_date' || key === 'due_date') {
                        if (value.from === value.to) return null;
                        const label = key === 'start_date' ? 'Start Date' : 'Due Date';
                        const icon = key === 'start_date' ? <CalendarIcon className="inline-block mr-1 h-4 w-4" /> : <FlagIcon className="inline-block mr-1 h-4 w-4" />;
                        return (
                          <li key={key}>
                            {icon}
                            {label}: {' '}
                            {value.from ? formatDateWithOffset(value.from) : 'Not set'} → {' '}
                            {value.to ? formatDateWithOffset(value.to) : 'Not set'}
                          </li>
                        );
                      }
                      if (key === 'user_id') {
                        return (
                          <li key={key}>
                            <UserIcon className="inline-block mr-1 h-4 w-4" />
                            Assigned To: {getUserEmailById(value.from)} → {getUserEmailById(value.to)}
                          </li>
                        );
                      }
                      if (key === 'completed') {
                        return (
                          <li key={key}>
                            <ActivityIcon className="inline-block mr-1 h-4 w-4" />
                            Status: {value.from ? 'Completed' : 'In Progress'} → {value.to ? 'Completed' : 'In Progress'}
                          </li>
                        );
                      }
                      return (
                        <li key={key} className="capitalize">
                          {key}: {value.from || 'Not set'} → {value.to || 'Not set'}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activity log available for this task.</p>
          )}
        </div>
      </div>
    </div>
  );
}
