import type { Metadata } from 'next';
import SignIn from '#/app/auth/sign-in/SignIn';

export const metadata: Metadata = {
	title: 'Sign In ~ Memoire',
	description: 'Sign in to your Memoire account'
};

const Page = () => {
	return <SignIn />;
};

export default Page;
