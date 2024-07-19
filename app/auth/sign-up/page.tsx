import type { Metadata } from 'next';
import SignUp from '#/app/auth/sign-up/SignUp';

export const metadata: Metadata = {
	title: 'Sign Up ~ Memoire',
	description: 'Sign up for a FREE Memoire account'
};

const Page = () => {
	return <SignUp />;
};

export default Page;
