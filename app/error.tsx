'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FC, useEffect } from 'react';
import { Button } from '#/components/ui/button';

type ErrorProps = {
	error: Error & { digest?: string }
	reset: () => void // Attempt to recover by trying to re-render the segment
}

const Error: FC<ErrorProps> = ({ error, reset }) => {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('A fatal error occurred :>>', error);
	}, [error]);

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
			<h2 className='text-xl font-medium'>Something Went Wrong!</h2>
			<Button variant='outline' size='sm' onClick={() => reset()}>
				Try again?
			</Button>
			<Link href='/'>
				<Button className='transition-colors duration-300 bg-core hover:bg-blue-600' size='sm'>
					Go home
				</Button>
			</Link>
		</div>
	)
}

export default Error;
