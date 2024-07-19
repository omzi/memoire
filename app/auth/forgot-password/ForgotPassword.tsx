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
import { useForm } from 'react-hook-form';
import { SIGN_IN_ROUTE } from '#/lib/utils';
import { AuthSchema } from '#/lib/validations';
import FormError from '#/components/FormError';
import { useState, useTransition } from 'react';
import { Button } from '#/components/ui/button';
import FormSuccess from '#/components/FormSuccess';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthHeader from '#/components/auth/AuthHeader';
import requestPasswordChangeToken from '#/lib/actions/requestPasswordResetToken';

const ForgotPasswordSchema = AuthSchema.pick({
	email: true
});

const ForgotPassword = () => {
	const [isSubmitting, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | undefined>('');
	const [successMessage, setSuccessMessage] = useState<string | undefined>('');
	const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: ''
		}
	});
	const { handleSubmit } = form;

	const onSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
		// console.log('Forgot Password Data :>>', data);

		setErrorMessage('');
		setSuccessMessage('');

		startTransition(async () => {
			const response = await requestPasswordChangeToken(`${data.email}`);

			setErrorMessage(response.error);
			setSuccessMessage(response.success);

			if (!response.error) {
				form.reset();
			}
		});
	};

	return (
		<div className='flex flex-col justify-center w-full max-w-2xl mx-auto gap-y-6 px-4 py-6 lg:py-12 sm:px-6 lg:px-8'>
			<AuthHeader
				title='Forgot Your Password?'
				subtitle='No worries, we&apos;ve got your back. Enter your email below, and we&apos;ll send you a link to reset your password.'
			/>

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
											disabled={isSubmitting}
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

					<FormError message={errorMessage} />
					<FormSuccess message={successMessage} />

					<Button type='submit' disabled={isSubmitting} className='h-12 relative bg-black hover:bg-core dark:bg-core hover:dark:bg-core-secondary text-sm xl:text-base'>
						{isSubmitting ? (
							<Loader size={24} className='leading-[0] text-white' />
						) : (
							'Request Email Link'
						)}
					</Button>

					<p className='-mt-2.5 text-base text-gray-600'>
						Remembered your password?{' '}
						<Link href={SIGN_IN_ROUTE} className='font-medium text-indigo-600 hover:text-indigo-500'>
							Sign in.
						</Link>
					</p>
				</form>
			</Form>
		</div>
	);
};

export default ForgotPassword;
