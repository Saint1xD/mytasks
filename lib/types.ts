export interface Task {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  userId: number;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
}
