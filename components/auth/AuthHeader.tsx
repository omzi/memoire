import Link from 'next/link';
import Image from 'next/image';
import { FC, ReactNode } from 'react';

interface AuthHeaderProps {
	title: string;
	subtitle: string | ReactNode;
}

const AuthHeader: FC<AuthHeaderProps> = ({
	title,
	subtitle
}) => {
	return (
		<>
			<Link href={'/'} className='w-fit'>
				<Image
					src={'/images/logo.png'}
					height={80}
					width={80}
					alt='Memoire Logo'
					fetchPriority='high'
				/>
			</Link>
			<h3 className='text-[32px] leading-none lg:text-5xl font-bold'>
				{title}
			</h3>
			<h2 className='text-[18px] text-gray-500 -mt-4'>
				{subtitle}
			</h2>
		</>
	)
}

export default AuthHeader;
