"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        login(localStorage.getItem('token')!, updatedUser);
        toast({
          title: "Email updated",
          description: "Your email has been successfully updated.",
        });
      } else {
        throw new Error('Failed to update email');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        const response = await fetch('/api/user/update-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData,
        });

        if (response.ok) {
          const { avatarUrl } = await response.json();
          setAvatarUrl(avatarUrl);
          toast({
            title: "Avatar updated",
            description: "Your profile picture has been successfully updated.",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update avatar');
        }
      } catch (error) {
        console.error('Error updating avatar:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update profile picture. Please try again.",
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-24 h-24">
            {avatarUrl ? (
              <Image
                src={avatarUrl.startsWith('http') ? avatarUrl : `/api/avatars/${avatarUrl.split('/').pop()}`}
                alt={user.email}
                width={96}
                height={96}
                className="object-cover"
              />
            ) : (
              <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button variant="outline" onClick={triggerFileInput}>Change Profile Picture</Button>
          </div>
        </div>

        <div>
          <p className="text-lg"><strong>Role:</strong> {user.role}</p>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Update Email</Button>
        </form>

        <div>
          <Link href="/reset-password">
            <Button variant="outline">Reset Password</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
