import type { Metadata } from 'next';
import Error from '#/app/auth/error/Error';

export const metadata: Metadata = {
	title: 'An Auth Error Occurred ~ Memoire',
	description: 'An error occurred during authentication'
};

const Page = () => {
	return <Error />;
};

export default Page;
