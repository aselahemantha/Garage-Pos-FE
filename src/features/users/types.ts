export type UserRole = 'owner' | 'advisor' | 'mechanic';

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface ChangePasswordInput {
  new_password: string;
}
