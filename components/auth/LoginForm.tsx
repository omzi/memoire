'use client';

import * as z from 'zod';
import Link from 'next/link';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '#/components/ui/form';
import Loader from 'react-ts-loaders';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { AuthSchema } from '#/lib/validations';
import FormError from '#/components/FormError';
import { useState, useTransition } from 'react';
import { Button } from '#/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import FormSuccess from '#/components/FormSuccess';
import { zodResolver } from '@hookform/resolvers/zod';
import { DEFAULT_SIGN_IN_REDIRECT, SIGN_IN_ROUTE } from '#/lib/utils';
import checkUserVerification from '#/lib/actions/checkUserVerification';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const SignInSchema = AuthSchema.pick({
	password: true,
	email: true
});

const LoginForm = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const next = searchParams.get('next');
	const [isDisabled, setIsDisabled] = useState(false);
	const [isSubmitting, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>('');
	const [successMessage, setSuccessMessage] = useState<string | undefined>('');

	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		mode: 'all',
		defaultValues: {
			email: '',
			password: ''
		}
	});
	const { handleSubmit } = form;

	const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
		// console.log('Sign-In Data :>>', data);
		setIsDisabled(true);
		setErrorMessage('');
		setSuccessMessage('');
		const url = pathname === SIGN_IN_ROUTE ? (next || DEFAULT_SIGN_IN_REDIRECT) : pathname;

		startTransition(async () => {
			const response = await checkUserVerification(`${data.email}`);

			setErrorMessage(response.error);
			setSuccessMessage(response.success);
			
			console.log('Transition Response :>>', response);
			
			if (!response.error) {
				if (response.verify) {
					return router.push(`/auth/verify-account?email=${data.email}`);
				}

				try {
					const callback = await signIn('credentials', {
						...data,
						redirect: false
					});
	
					if (callback?.error) throw new Error(callback.error.replace(/^Error: /, ''));
					
					if (callback?.ok) {
						form.reset();
						router.push(url);
						setSuccessMessage('Sign in successful!');
					}
				} catch (error: any) {
					console.error('Sign-In Error :>>', error);
					
					setIsDisabled(false);
					setErrorMessage(error.message ?? 'An error occurred while signing in');
				}
			}
		});
	};

	return (
		<Form {...form}>
			<form className='flex flex-col gap-y-6' onSubmit={handleSubmit(onSubmit)}>
				{/* Email */}
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className='relative'>
									<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
										Email Address
									</label>
									<input
										type='text'
										className='block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base'
										placeholder='Enter your email address'
										disabled={isSubmitting || isDisabled}
										id={field.name}
										autoComplete='email'
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage className='text-red-400' />
						</FormItem>
					)}
				/>

				{/* Password */}
				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className='relative'>
									<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
										Password
									</label>
									<input
										type={showPassword ? 'text' : 'password'}
										className='block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base'
										placeholder='Enter your password'
										disabled={isSubmitting || isDisabled}
										id={field.name}
										autoComplete='password'
										{...field}
									/>
									<div onClick={()=> setShowPassword(previous => !previous)} className='absolute inset-y-0 right-0 flex text-gray-400 items-center pr-4 cursor-pointer'>
										{showPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-6 h-6' />}
									</div>
								</div>
							</FormControl>
							<FormMessage className='text-red-400' />
						</FormItem>
					)}
				/>

				<div className='-mt-2.5 text-base text-right'>
					<Link href={'/auth/forgot-password'} className='font-medium text-indigo-600 hover:text-indigo-500'>
						Forgot your password?
					</Link>
				</div>

				<FormError message={errorMessage} />
				<FormSuccess message={successMessage} />

				<Button type='submit' disabled={isSubmitting || isDisabled} className='h-12 relative bg-black hover:bg-core dark:bg-core hover:dark:bg-core-secondary text-sm xl:text-base'>
					{isSubmitting ? (
						<Loader size={24} className='leading-[0] text-white' />
					) : (
						'Sign In'
					)}
				</Button>

				<p className='-mt-2.5 text-base text-gray-600'>
					Don&apos;t have an account?{' '}
					<Link href={'/auth/sign-up'} className='font-medium text-indigo-600 hover:text-indigo-500'>
						Get started.
					</Link>
				</p>
			</form>
		</Form>
	)
}

export default LoginForm;
