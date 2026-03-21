//User interface
export interface User {
  id_user: number;
  name: string;
  surnames: string;
  birth_date: string;
  email: string;
  username: string;
  avatar: string;
  role: string;
  created_at: string;
  updated_at: string;
}

//Login interface
export interface LoginResponse {
  status: number;
  message: string;
  user: User;
  token: string;
}

//Register interface
export interface RegisterResponse {
  status: number;
  message: string;
}

//Login credentials interface
export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}
