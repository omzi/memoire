import { CheckCircleIcon } from 'lucide-react';

interface FormSuccessProps {
	message?: string;
}

const FormSuccess = ({
	message
}: FormSuccessProps) => {
	if (!message) return null;

	return (
		<div className='bg-[#07bc0c] p-3.5 flex flex-row items-start gap-x-2.5 rounded-lg text-white'>
			<CheckCircleIcon className='h-5 w-5 flex-shrink-0' />
			<p>{message}</p>
		</div>
	)
}

export default FormSuccess;
