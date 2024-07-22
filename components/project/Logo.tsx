import Link from 'next/link';
import Image from 'next/image';
import TooltipHint from '#/components/shared/TooltipHint';

const Logo = () => {
	return (
		<TooltipHint label='Home' side='bottom' align='center'>
			<Link href='/home' className='ml-3'>
				<div className='size-10 relative shrink-0'>
					<Image
						src='/images/logo.png'
						fill
						alt='Memoire'
						className='shrink-0 hover:opacity-75 transition'
					/>
				</div>
			</Link>
		</TooltipHint>
	);
};

export default Logo;
