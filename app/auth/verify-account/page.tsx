import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SIGN_IN_ROUTE } from '#/lib/utils';
import VerifyAccount from '#/app/auth/verify-account/VerifyAccount';

export const metadata: Metadata = {
	title: 'Verify Your Account ~ Memoire',
	description: 'Verify your Memoire account'
};

type PageProps = {
	searchParams: {
		email: string;
	}
}

const Page = ({ searchParams }: PageProps) => {
	if (!searchParams.email) redirect(SIGN_IN_ROUTE);

	return <VerifyAccount email={searchParams.email} />;
};

export default Page;
