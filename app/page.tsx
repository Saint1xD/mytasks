"use client";

import Dashboard from '@/components/Dashboard';
import TaskList from '@/components/TaskList';
import { ModeToggle } from '@/components/mode-toggle';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Home() {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Task Master</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span>Welcome, {user.email}</span>
              <Button onClick={logout}>Logout</Button>
              <Link href="/reset-password" className="text-blue-500 hover:underline">Reset Password</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
              <Link href="/register" className="text-blue-500 hover:underline">Register</Link>
            </>
          )}
          <ModeToggle />
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <TaskList />
        </div>
        <div>
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
