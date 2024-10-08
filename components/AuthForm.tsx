"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Handle authentication logic here based on 'mode'
    if (mode === 'login') {
      // Handle login
    } else {
      // Handle registration
    }

    toast({
      title: `Successfully ${mode === 'login' ? 'logged in' : 'registered'}`,
    });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit">
        {mode === 'login' ? 'Log In' : 'Register'}
      </Button>
    </form>
  );
}
