export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  startDate?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  userId: number | null;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  userId: number;
  userEmail: string;
  action: string;
  details: any;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  avatarUrl?: string;
}
