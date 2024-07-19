'use client';

import { FC, ReactNode } from 'react';
import { SIGN_IN_ROUTE } from '#/lib/utils';
import { useRouter } from 'next/navigation';

interface LoginButtonProps {
	children: ReactNode;
	mode?: 'modal' | 'redirect';
	asChild?: boolean;
}

const LoginButton: FC<LoginButtonProps> = ({
	children,
	mode = 'redirect',
	asChild
}) => {
	const router = useRouter();

	const onClick = () => {
		router.push(SIGN_IN_ROUTE);
	}

	if (mode === 'modal') {
		return (
			<span>TODO: Implement modal...</span>
		)
	}

	return (
		<div onClick={onClick} className='cursor-pointer'>
			{children}
		</div>
	)
}

export default LoginButton;
