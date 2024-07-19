import { ReactNode } from 'react';
import authConfig from '#/auth.config';
import { redirect } from 'next/navigation';
import { SIGN_IN_ROUTE } from '#/lib/utils';
import { getUserById } from '#/lib/data/user';
import NavBar from '#/components/shared/NavBar';
import HeroCard from '#/components/shared/HeroCard';
import { Session, getServerSession } from 'next-auth';
import { UserProvider } from '#/components/contexts/UserContext';

const MainLayout = async ({ children }: { children: ReactNode }) => {
	const session = await getServerSession(authConfig) as Session;
	const user = await getUserById(session.user.id);
	if (!user) redirect(SIGN_IN_ROUTE);

	return (
		<UserProvider user={user}>
			<main className='flex min-h-svh w-full flex-col bg-white'>
				<NavBar isAuthenticated isPrivateLayout />

				<div className='flex-1 overflow-auto p-4 md:px-8 w-full'>
					<HeroCard />

					<section className='my-12'>
						{children}
					</section>
				</div>
			</main>
		</UserProvider>
	);
};

export default MainLayout;
