import AuthHeader from '#/components/auth/AuthHeader';
import NewPasswordForm from '#/components/auth/NewPasswordForm';

const ResetPassword = () => {
	return (
		<div className='flex flex-col justify-center w-full max-w-2xl mx-auto gap-y-6 px-4 py-6 lg:py-12 sm:px-6 lg:px-8'>
			<AuthHeader
				title='Reset Your Password'
				subtitle='Time for a fresh start! Enter your new password below and get ready to get back on track.'
			/>
			<NewPasswordForm />
		</div>
	)
}

export default ResetPassword;
