import type { Metadata } from 'next';
import Profile from '#/app/(main)/profile/Profile';

export const metadata: Metadata = {
	title: 'Profile ~ Memoire',
	description: '...'
};

const Page = () => {
	return <Profile />;
};

export default Page;
