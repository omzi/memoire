'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '#/components/ui/button';
import UserButton from '#/components/UserButton';
import ModeToggle from '#/components/ModeToggle';
import { Skeleton } from '#/components/ui/skeleton';
import { cn, generateDefaultAvatar, getScrollbarWidth } from '#/lib/utils';
import { ArrowRight, InfoIcon, LayoutGridIcon, LightbulbIcon, MenuIcon, StarIcon, TwitterIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '#/components/ui/dropdown-menu';

interface NavBarProps {
	isAuthenticated: boolean;
	isPublicLayout?: boolean;
	isPrivateLayout?: boolean;
}

const NavBar = ({ isAuthenticated, isPublicLayout, isPrivateLayout }: NavBarProps) => {
	const { data: session } = useSession();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleOnOpenChange = (menuOpen: boolean) => {
		setMenuOpen(menuOpen);
	};

	useEffect(() => {
		const html = document.documentElement;
		const scrollbarWidth = getScrollbarWidth();

		if (menuOpen) {
			html.classList.add('no-scroll');
			html.style.paddingRight = `${scrollbarWidth}px`;
		} else {
			html.classList.remove('no-scroll');
			html.style.paddingRight = '0';
		}

		return () => {
			html.classList.remove('no-scroll');
			html.style.paddingRight = '0';
		};
	}, [menuOpen]);

	return (
		<>
			{/* Overlay */}
			<div className={cn(
				'fixed invisible inset-0 z-[1] bg-black bg-opacity-0 transition-all duration-300',
				menuOpen && 'visible bg-opacity-50'
			)}></div>
			{/* Fixed navbar */}

			{!isPrivateLayout && (
				<nav className='fixed z-10 flex justify-between p-2 rounded-full bg-black left-1/2 mt-5 -translate-x-1/2 outline-2 outline-black outline outline-offset-4 w-[90svw] sm:w-96'>
					<div className='flex items-center gap-x-2'>
						<DropdownMenu onOpenChange={handleOnOpenChange} modal={false}>
							<DropdownMenuTrigger asChild>
								<Button size='icon' className='bg-transparent hover:bg-white/20 rounded-full'>
									<MenuIcon className='text-white' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent loop side='bottom' sideOffset={15} align='start' className='w-[calc(90svw-16px)] sm:w-[calc(24rem-16px)] p-0'>
								<DropdownMenuItem className='py-3 px-3 w-full cursor-pointer'>
									<LightbulbIcon className='h-4 w-4 mr-2' />
									Feedback
								</DropdownMenuItem>
								<hr />
								<DropdownMenuItem className='py-3 px-3 w-full cursor-pointer'>
									<StarIcon className='h-4 w-4 mr-2' />
									Star on GitHub
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Link href='/'>
							<Image
								width={36}
								height={36}
								alt='Logo'
								src='/images/logo.png'
							/>
						</Link>
					</div>
					<div className='flex items-center gap-x-2'>
						{/* Auth session loading... */}
						{!session && isAuthenticated && (
							<Skeleton className='h-8 w-[6.25rem] rounded-full' />
						)}

						{/* Authenticated... */}
						{session && isAuthenticated && (
							<Link href='/home'>
								<Button className='w-auto h-8 mr-2 rounded-full px-4 text-white bg-core hover:bg-blue-600' size='sm'>
									<LayoutGridIcon className='w-4 h-4 mr-2' />
									Home
								</Button>
							</Link>
						)}

						{/* Unauthenticated... */}
						{!session && !isAuthenticated && (
							<Link href='/auth/sign-in'>
								<Button className='w-auto h-8 rounded-full px-4 text-white bg-core hover:bg-blue-600'>
									Sign In
									<ArrowRight className='w-4 h-4 ml-2' />
								</Button>
							</Link>
						)}

						<Button size='icon' className='bg-white/20 hover:bg-white/20 rounded-full'>
							<TwitterIcon className='text-white' />
						</Button>
					</div>
				</nav>
			)}

			{/* Normal navbar */}
			<nav className={cn(
				'flex items-center justify-between w-full px-8 py-4 mt-2.5',
				isPublicLayout && 'hidden lg:flex'
			)}>
				<Link href='/' className='hidden xs:block'>
					<Image
						src='/images/logo-text-dark.png'
						height={111}
						width={500}
						alt='Memoire Logo'
						className='w-auto h-10 hidden dark:block'
					/>
					<Image
						src='/images/logo-text-light.png'
						height={111}
						width={500}
						alt='Memoire Logo'
						className='w-auto h-10 block dark:hidden'
					/>
				</Link>
				<Link href='/' className='block xs:hidden'>
					<Image
						src='/images/logo.png'
						height={40}
						width={40}
						alt='Memoire Logo'
					/>
				</Link>
				
				<div className='flex items-center gap-x-2'>
					<ModeToggle />
					<Button onClick={() => {}} className='bg-white dark:bg-black hover:bg-gray-500/5 dark:hover:bg-gray-200/10 rounded-full shadow-sm p-1 h-10' variant='outline'>
						<InfoIcon className='hidden xs:inline w-8 h-8 mr-2 p-1.5 rounded-full bg-black/10 dark:bg-white/25 text-black dark:text-white' />
						<span className='xs:pr-4 px-2 xs:px-0 text-black dark:text-white'>About</span>
					</Button>

					{!isPublicLayout && isAuthenticated && (
						!session ? (
							<Skeleton className='w-10 h-10 rounded-full' />
						) : (
							<UserButton
								profilePicture={session.user.image || generateDefaultAvatar(`${session.user.email}`)}
								profilePictureAlt={`${session.user.name}'s Profile Picture`}
								fullName={`${session.user.name}`}
								email={`${session.user.email}`}
							/>
						)
					)}
				</div>
			</nav>
		</>
	)
}

export default NavBar;
