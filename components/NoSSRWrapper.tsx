import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { LoaderIcon } from 'lucide-react';

interface NoSSRWrapperProps {
	children: ReactNode;
};

const NoSSRWrapper = (props: NoSSRWrapperProps) => (<>{props.children}</>);

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
	ssr: false,
	loading: () => (
		<div className='w-full h-full flex flex-col p-2'>
			<LoaderIcon className='size-12 animate-spin text-muted-foreground m-auto' />
		</div>
	)
});
