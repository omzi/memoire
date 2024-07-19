import LoginForm from '#/components/auth/LoginForm';
import AuthHeader from '#/components/auth/AuthHeader';

const SignIn = () => {
	return (
		<div className='flex flex-col justify-center w-full max-w-2xl mx-auto gap-y-6 px-4 py-6 lg:py-12 sm:px-6 lg:px-8'>
			<AuthHeader
				title='Sign In'
				subtitle='Welcome back! Sign in to continue using Memoire.'
			/>
			<LoginForm />
		</div>
	);
};

export default SignIn;
