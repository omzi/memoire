import { Button } from '#/components/ui/button';
import AuthHeader from '#/components/auth/AuthHeader';

const Error = () => {
	return (
		<div className='flex flex-col justify-center w-full max-w-2xl mx-auto gap-y-6 px-4 py-6 lg:py-12 sm:px-6 lg:px-8'>
			<AuthHeader
				title='Authentication Failed!'
				subtitle='Please try again by clicking the button below or contact support for assistance.'
			/>

			<Button className='h-12 relative bg-black hover:bg-core dark:bg-core hover:dark:bg-core-secondary text-sm xl:text-base'>
				Try Again
			</Button>
		</div>
	);
};

export default Error;
