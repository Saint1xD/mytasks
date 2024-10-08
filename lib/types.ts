export interface Task {
  id: number;
  title: string;
  completed: boolean;
  startDate?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  userId: number | null;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
}
