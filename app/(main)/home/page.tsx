import type { Metadata } from 'next';
import Home from '#/app/(main)/home/Home';

export const metadata: Metadata = {
	title: 'Home ~ Memoire',
	description: '...'
};

const Page = () => {
	return <Home />;
};

export default Page;
