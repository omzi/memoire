'use client';

import * as z from 'zod';
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
import FormError from '#/components/FormError';
import { AuthSchema } from '#/lib/validations';
import { Button } from '#/components/ui/button';
import { useState, useTransition } from 'react';
import FormSuccess from '#/components/FormSuccess';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import setNewPassword from '#/lib/actions/setNewPassword';
import { useRouter, useSearchParams } from 'next/navigation';

const ResetPasswordSchema = AuthSchema.pick({
	password: true
});

const ResetPassword = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const [isSubmitting, startTransition] = useTransition();
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>('');
	const [successMessage, setSuccessMessage] = useState<string | undefined>('');
	const form = useForm<z.infer<typeof ResetPasswordSchema>>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			password: ''
		}
	});
	const { handleSubmit } = form;

	const onSubmit = (data: z.infer<typeof ResetPasswordSchema>) => {
		// console.log('Reset Password Data :>>', data);

		setErrorMessage('');
		setSuccessMessage('');

		startTransition(async () => {
			const response = await setNewPassword(data, token);

			setErrorMessage(response.error);
			setSuccessMessage(response.success);

			if (!response.error) {
				router.push(SIGN_IN_ROUTE);
			}
		});
	};

	return (
		<Form {...form}>
			<form className='flex flex-col gap-y-6' onSubmit={handleSubmit(onSubmit)}>
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
										disabled={isSubmitting}
										id={field.name}
										autoComplete='password'
										{...field}
									/>
									<div onClick={() => setShowPassword(previous => !previous)} className='absolute inset-y-0 right-0 flex text-gray-400 items-center pr-4 cursor-pointer'>
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

				<Button type='submit' disabled={isSubmitting} className='h-12 relative bg-black hover:bg-core dark:bg-core hover:dark:bg-core-secondary text-sm xl:text-base'>
					{isSubmitting ? (
						<Loader size={24} className='leading-[0] text-white' />
					) : (
						'Save New Password'
					)}
				</Button>
			</form>
		</Form>
	);
};

export default ResetPassword;
