import type { Metadata } from 'next';
import Billing from '#/app/(main)/billing/Billing';

export const metadata: Metadata = {
	title: 'Billing ~ Memoire',
	description: '...'
};

const Page = () => {
	return <Billing />;
};

export default Page;
