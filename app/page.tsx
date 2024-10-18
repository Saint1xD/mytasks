"use client";

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import TaskList from '@/components/TaskList';
import { useAuth } from '@/contexts/AuthContext';


export default function Home() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(`/api/avatars/${user.avatarUrl.split('/').pop()}`);
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <main className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <TaskList />
        </div>
        <div className="lg:w-1/4 lg:mt-[72px]">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
