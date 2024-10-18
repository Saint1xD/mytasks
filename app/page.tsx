"use client";

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import TaskList from '@/components/TaskList';
import { ModeToggle } from '@/components/mode-toggle';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { user, logout } = useAuth();
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
