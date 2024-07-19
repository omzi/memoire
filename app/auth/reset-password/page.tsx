import type { Metadata } from 'next';
import ResetPassword from '#/app/auth/reset-password/ResetPassword';

export const metadata: Metadata = {
	title: 'Reset Your Password ~ Memoire',
	description: 'Set your new password'
};

const Page = () => {
	return <ResetPassword />;
};

export default Page;
