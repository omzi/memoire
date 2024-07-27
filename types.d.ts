import { Prisma, $Enums } from '@prisma/client';
import { type DefaultSession } from 'next-auth';
import { getProjectMediaAndNarration } from '#/lib/actions/queries';
import { transitions, voices, aspectRatios, frameRates } from '#/lib/utils';

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
export type MediaItemType = Prisma.MediaGetPayload<true>;

export type ActivePane = 'media' | 'narration' | 'music' | 'subtitle' | 'settings' | null;

export interface UploadResult {
  url: string;
  preview?: string;
  file?: File;
};

export interface MediaMetadata extends UploadResult {
  width: number;
  height: number;
  type: $Enums.MediaType;
};

export type ProjectMediaType = Awaited<ReturnType<typeof getProjectMediaAndNarration>>;
export type TransitionType = typeof transitions[number]['id'];
export type Voice = typeof voices[number]['id'];
export type AspectRatio = typeof aspectRatios[number]['ratio'];
export type FrameRate = typeof frameRates[number]['value'];
