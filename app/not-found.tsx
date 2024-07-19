import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Button } from '#/components/ui/button';

export const metadata: Metadata = {
	title: 'Page Not Found ;( ~ Memoire',
	description: 'The page you requested for does not exist.'
};

const NotFound = () => {
	return (
		<div className='flex flex-col items-center justify-center h-svh gap-y-4'>
			<Image
				src='/images/error-dark.svg'
				height='300'
				width='300'
				alt='Error'
				fetchPriority='high'
				className='hidden dark:block'
			/>
			<Image
				src='/images/error-light.svg'
				height='300'
				width='300'
				alt='Error'
				fetchPriority='high'
				className='block dark:hidden'
			/>
			<h2 className='text-xl font-medium'>Page Not Found ;(</h2>
			<Link href='/'>
				<Button className='text-white transition-colors duration-300 bg-core hover:bg-core-secondary' size='sm'>
					Go home
				</Button>
			</Link>
		</div>
	)
}

export default NotFound;
