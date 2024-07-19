import { AlertTriangleIcon } from 'lucide-react';

interface FormErrorProps {
	message?: string;
}

const FormError = ({
	message
}: FormErrorProps) => {
	if (!message) return null;

	return (
		<div className='bg-[#CB1A14] p-3.5 flex flex-row items-start gap-x-2.5 rounded-lg text-white'>
			<AlertTriangleIcon className='h-5 w-5 flex-shrink-0' />
			<p>{message}</p>
		</div>
	)
}

export default FormError;
