import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import Home from '#/app/(main)/home/Home';
import { Session, getServerSession } from 'next-auth';

export const metadata: Metadata = {
	title: 'Home ~ Memoire',
	description: '...'
};

const Page = async () => {
	const session = await getServerSession(authConfig) as Session;

	return <Home userId={session.user.id} />;
};

export default Page;
