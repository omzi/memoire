import { Prisma, $Enums } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  id: string;
  role: $Enums.Role;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedUser {}
}

export type ProjectType = Prisma.ProjectGetPayload<true>;
