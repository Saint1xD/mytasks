"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModeToggle } from '@/components/mode-toggle';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  return (
    <header className="flex justify-between items-center p-4 bg-background">
      <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
        Task Master
      </Link>
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                {currentUser.avatarUrl ? (
                  <AvatarImage src={`/api/avatars/${currentUser.avatarUrl.split('/').pop()}`} alt={currentUser.email} />
                ) : (
                  <AvatarFallback>{currentUser.email[0].toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout} className="flex items-center text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
            <Link href="/register" className="text-blue-500 hover:underline">Register</Link>
          </>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
