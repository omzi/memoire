import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const getScrollbarWidth = () => {
  const div = document.createElement('div');

  div.style.width = '100px';
  div.style.height = '100px';
  div.style.overflow = 'scroll';
  div.style.position = 'absolute';
  div.style.top = '-9999px';

  document.body.appendChild(div);

  // Calculate the scrollbar width
  const scrollbarWidth = div.offsetWidth - div.clientWidth;

  document.body.removeChild(div);

  return scrollbarWidth;
};

export const generateDefaultAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${seed}`;
};

export const blurActiveElement = () => {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement) activeElement.blur();
};

export const generateRandomChars = (() => {
	const generateChars = (min: number, max: number): string[] => Array.from({ length: max - min + 1 }, (_, i) => String.fromCharCode(min + i));

	const sets = {
		numeric: generateChars(48, 57),
		lowerCase: generateChars(97, 122),
		upperCase: generateChars(65, 90),
		special: [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`],
		alphanumeric: [
			...generateChars(48, 57),
			...generateChars(65, 90),
			...generateChars(97, 122)
		]
	};

	const iter = function* (
		len: number,
		set: string[] | undefined
	): Generator<string, void, unknown> {
		if (set && set.length < 1) set = Object.values(sets).flat();
		for (let i = 0; i < len; i++) yield set![(Math.random() * set!.length) | 0];
	};

	return Object.assign(
		(len: number, ...set: string[]) => [...iter(len, set.flat())].join(''),
		sets
	);
})();

export const generateOneTimePassword = (length: number): string => {
  const chars = '0123456789';
  const charsLength = chars.length;
  const isBrowser = typeof window !== 'undefined' && typeof window.crypto !== 'undefined';
  
  let oneTimePassword = '';
  const randomValues = new Uint8Array(length);
  if (isBrowser) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Node.js environment
    const { randomBytes } = require('crypto');
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      randomValues[i] = bytes[i];
    }
  }

  for (let i = 0; i < length; i++) {
    oneTimePassword += chars[randomValues[i] % charsLength];
  }

  return oneTimePassword;
};

export const UUIDRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const publicRoutes = ['/', '/terms', '/privacy-policy'];
export const authRoutes = [
	'/auth/totp',
	'/auth/error',
	'/auth/sign-up',
	'/auth/sign-in',
	'/auth/verify-account',
	'/auth/forgot-password',
	'/auth/reset-password'
];
export const metaRoutes = [
	'/android-chrome-192x192.png',
	'/android-chrome-512x512.png',
	'/apple-touch-icon.png',
	'/browserconfig.xml',
	'/favicon-32x32.png',
	'/favicon-16x16.png',
	'/mstile-150x150.png',
	'/manifest.webmanifest',
	'/safari-pinned-tab.svg'
];

export const API_AUTH_PREFIX = '/api/auth';
export const SIGN_IN_ROUTE = '/auth/sign-in';
export const DEFAULT_SIGN_IN_REDIRECT = '/home';

export const compileTemplate = <T extends Record<string, any>>(template: string, values: T): string => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim() as string;
    return trimmedKey in values ? String(values[trimmedKey]) : `{{${trimmedKey}}}`;
  });
};
