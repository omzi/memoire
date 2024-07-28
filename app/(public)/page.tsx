import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import Landing from '#/app/(public)/Landing';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
	title: 'Capture. Narrate. Cherish. ~ Memoire',
	description: '🧙🏽‍♂️ Create stunning narrated videos from your photos & videos using AI.'
}

const Page = async () => {
	let isAuthenticated = false;
	const session = await getServerSession(authConfig);
	if (session) isAuthenticated = true;

	return (
		<div className='h-full'>
			<Landing isAuthenticated={isAuthenticated} />
		</div>
	);
};

export default Page;
