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
import { useRouter } from 'next/navigation';
import { SIGN_IN_ROUTE } from '#/lib/utils';
import { AuthSchema } from '#/lib/validations';
import FormError from '#/components/FormError';
import { Button } from '#/components/ui/button';
import { useState, useTransition } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import FormSuccess from '#/components/FormSuccess';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthHeader from '#/components/auth/AuthHeader';
import handleSignUp from '#/lib/actions/handleSignUp';

const SignUp = () => {
	const router = useRouter();
	const [isDisabled, setIsDisabled] = useState(false);
	const [isSubmitting, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>('');
	const [successMessage, setSuccessMessage] = useState<string | undefined>('');
	const form = useForm<z.infer<typeof AuthSchema>>({
		resolver: zodResolver(AuthSchema),
		defaultValues: {
			email: '',
			password: '',
			firstName: '',
			lastName: ''
		}
	});
	const { handleSubmit } = form;

	const onSubmit = async (data: z.infer<typeof AuthSchema>) => {
		// console.log('Sign-Up Data :>>', data);
		setIsDisabled(true);
		setErrorMessage('');
		setSuccessMessage('');

		startTransition(async () => {
			const response = await handleSignUp(data);

			setErrorMessage(response.error);
			setSuccessMessage(response.success);
			
			if (!response.error) {
				router.push(`/auth/verify-account?email=${data.email}`);
			} else {
				setIsDisabled(false);
			}
		});
	};

	return (
		<div className='flex flex-col justify-center w-full max-w-2xl mx-auto gap-y-6 px-4 py-6 lg:py-12 sm:px-6 lg:px-8'>
			<AuthHeader
				title='Sign Up'
				subtitle='Ready to dive into the world of AI-powered education? Create your account now!'
			/>

			<Form {...form}>
				<form className='flex flex-col gap-y-6' onSubmit={handleSubmit(onSubmit)}>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* First Name */}
						<FormField
							control={form.control}
							name='firstName'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className='relative'>
											<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
												First Name
											</label>
											<input
												type='text'
												className='block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base'
												placeholder='Enter your first name'
												disabled={isSubmitting || isDisabled}
												id={field.name}
												autoComplete='given-name'
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage className='text-red-400' />
								</FormItem>
							)}
						/>

						{/* Last Name */}
						<FormField
							control={form.control}
							name='lastName'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className='relative'>
											<label htmlFor={field.name} className='absolute -top-2.5 left-5 inline-block bg-white dark:bg-black px-1 text-base font-medium text-gray-600 dark:text-gray-300'>
												Last Name
											</label>
											<input
												type='text'
												className='block w-full rounded-md border-0 py-2 px-6 h-14 text-gray-900 dark:text-gray-200 shadow-sm bg-white dark:bg-black ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-base'
												placeholder='Enter your last name'
												disabled={isSubmitting || isDisabled}
												id={field.name}
												autoComplete='family-name'
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage className='text-red-400' />
								</FormItem>
							)}
						/>
					</div>

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
											placeholder='Enter your preferred password'
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

					<FormError message={errorMessage} />
					<FormSuccess message={successMessage} />

					<Button type='submit' disabled={isSubmitting || isDisabled} className='h-12 relative bg-black hover:bg-core dark:bg-core hover:dark:bg-core-secondary text-sm xl:text-base'>
						{isSubmitting ? (
							<Loader size={24} className='leading-[0] text-white' />
						) : (
							'Sign Up'
						)}
					</Button>
					
					<p className='-mt-2.5 text-base text-gray-600'>
						Already have an account?{' '}
						<Link href={SIGN_IN_ROUTE} className='font-medium text-indigo-600 hover:text-indigo-500'>
							Sign in.
						</Link>
					</p>
				</form>
			</Form>
		</div>
	);
};

export default SignUp;
