import { User } from './user';

export type SignupRequest = Omit<User, 'confirmPassword'>;

export interface SignupResponse {
  id: string;
  login: string;
  lastName: string;
  firstName: string;
  email: string;
  createdAt: string;
}
