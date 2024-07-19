'use client';

import { usePathname } from 'next/navigation';
import { useQueryState, parseAsBoolean } from 'nuqs';
import HeroButton from '#/components/shared/HeroButton';
import { LayoutGridIcon, SparkleIcon, SparklesIcon, StarIcon, Trash2Icon, UserRoundIcon } from 'lucide-react';

const HeroCard = () => {
	const pathname = usePathname();
	const [starred] = useQueryState('starred', parseAsBoolean.withDefault(false));
	const [trashed] = useQueryState('trashed', parseAsBoolean.withDefault(false));

	return (
		<section className='relative flex flex-col justify-center items-center gap-y-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-5 sm:p-10 shadow-inner'>
			<SparklesIcon className='absolute text-white stroke-1 z-0 top-4 left-4 opacity-20 w-20 h-20' />
			<SparkleIcon className='absolute text-white stroke-1 z-0 bottom-4 right-4 opacity-20 w-20 h-20' />

			<h1 className='text-3xl sm:text-4xl font-semibold font-clash-display-bold flex-wrap text-center text-white shadow-sm'>
				Welcome to Memoire!
			</h1>

			<p className='text-white/75 text-lg text-center max-w-[35ch]'>
				Upload your media, generate AI narrations & matching music, and create stunning videos.
			</p>

			<ul className='grid grid-cols-2 xs:flex justify-center items-center z-10 max-w-5xl w-full mx-auto gap-2.5 xs:gap-x-4 sm:gap-x-8 md:gap-x-12 lg:gap-x-20'>
				<HeroButton
					isLink
					label='Home'
					path='/home'
					icon={LayoutGridIcon}
					active={pathname === '/home' && !starred && !trashed}
				/>
				<HeroButton
					isLink
					label='Starred'
					path='/home?starred=true'
					icon={StarIcon}
					active={pathname === '/home' && starred}
				/>
				<HeroButton
					isLink
					label='Trash'
					path='/home?trashed=true'
					icon={Trash2Icon}
					active={pathname === '/home' && trashed}
				/>
				<HeroButton
					isLink
					label='Profile'
					path='/profile'
					icon={UserRoundIcon}
					active={pathname === '/profile'}
				/>
			</ul>
		</section>
	)
}

export default HeroCard;
