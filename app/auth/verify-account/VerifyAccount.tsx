'use client';

import Loader from 'react-ts-loaders';
import { useRouter } from 'next/navigation';
import FormError from '#/components/FormError';
import { Button } from '#/components/ui/button';
import { OTPInput, SlotProps } from 'input-otp';
import verifyUser from '#/lib/actions/verifyUser';
import FormSuccess from '#/components/FormSuccess';
import AuthHeader from '#/components/auth/AuthHeader';
import { useEffect, useState, useTransition } from 'react';
import { SIGN_IN_ROUTE, blurActiveElement, cn } from '#/lib/utils';
import requestVerificationCode from '#/lib/actions/requestVerificationCode';

const OTP_LENGTH = 6;

const Slot = (props: SlotProps & { disabled: boolean }) => {
	return (
		<div
			className={cn(
				'relative aspect-[10/14] text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
				'flex flex-1 items-center justify-center',
				'transition-all duration-300',
				'border-accent-foreground/20 border rounded-md',
				'group-hover:border-accent-foreground/50 group-focus-within:border-accent-foreground/50',
				'outline outline-0 outline-accent-foreground/20',
				{ 'outline-4 outline-accent-foreground': props.isActive },
				{ 'opacity-15 bg-black/15': props.disabled }
			)}
		>
			{props.char !== null && <div>{props.char}</div>}
			{props.hasFakeCaret && <FakeCaret />}
		</div>
	)
};

const FakeCaret = () => {
	return (
		<div className='absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink'>
			<div className='w-[2px] md:w-1 h-[calc(100%-20px)] md:h-[calc(100%-40px)] bg-black' />
		</div>
	)
};

interface VerifyAccountProps {
	email: string;
};

const VerifyAccount = ({ email }: VerifyAccountProps) => {
	const router = useRouter();
	const [countdown, setCountdown] = useState(60);
	const [verificationCode, setVerificationCode] = useState('');
	const [isVerifying, startVerificationTransition] = useTransition();
	const [isRequestingNewCode, startRequestNewCodeTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | undefined>('');
	const [successMessage, setSuccessMessage] = useState<string | undefined>('');

	useEffect(() => {
		if (countdown === 0) return;

		const timer = setInterval(() => {
			setCountdown(previousCountdown => previousCountdown - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown]);
	
	const requestNewCode = async () => {
		if (countdown > 0) return;

		setErrorMessage('');
		setSuccessMessage('');

		startRequestNewCodeTransition(async () => {
			const response = await requestVerificationCode(email);

			setErrorMessage(response.error);
			setSuccessMessage(response.success);
		});
	};

	const handleVerificationCodeChange = async (verificationCode: string) => {
		setVerificationCode(verificationCode);

		if (verificationCode.length === OTP_LENGTH) {
			blurActiveElement();
			setErrorMessage('');
			setSuccessMessage('');

			startVerificationTransition(async () => {
				const response = await verifyUser(verificationCode);

				setErrorMessage(response.error);
				setSuccessMessage(response.success);
				
				if (!response.error) {
					router.push(SIGN_IN_ROUTE);
				} else {
					setVerificationCode('');
				}
			});
		}
	};

	return (
		<div className='flex flex-col justify-center w-full h-full max-w-2xl gap-y-8 p-4 sm:px-6 lg:px-8'>
			<AuthHeader
				title='Verify Your Account'
				subtitle={<>We have sent a code by email to {email ? <strong>{email}</strong> : 'your email'}. Enter it below to confirm your account.</>}
			/>

			<div className='relative'>
				<OTPInput
					value={verificationCode}
					maxLength={OTP_LENGTH}
					containerClassName='group flex items-center justify-around has-[:disabled]:opacity-30'
					render={({ slots }) => (
						<div className={cn('flex w-full gap-x-2 md:gap-x-4', isVerifying && 'pointer-events-none')}>
							{slots.map((slot, idx) => (
								<Slot key={idx} {...slot} disabled={isVerifying} />
							))}
						</div>
					)}
					onChange={handleVerificationCodeChange}
				/>

				<div className={cn(
					'absolute inset-0 opacity-0 flex items-center justify-center invisible transition-all duration-300',
					isVerifying && 'visible opacity-100'
				)}>
					<Loader size={40} className='aspect-square' />
				</div>
			</div>

			<FormError message={errorMessage} />
			<FormSuccess message={successMessage} />

			<Button type='submit' disabled={countdown > 0} onClick={requestNewCode} className='h-12 relative bg-black hover:bg-core dark:bg-core hover:dark:bg-core-secondary text-sm xl:text-base'>
				{isRequestingNewCode ? (
					<Loader size={24} className='leading-[0] text-white' />
				) : (
					<>{countdown > 0 ? `Request New Code (${countdown}s)` : 'Request New Code'}</>
				)}
			</Button>
		</div>
	);
}

export default VerifyAccount;
