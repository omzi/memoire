'use client';

import Image from 'next/image';
import { useState } from 'react';
import { TransitionType } from '#/types';
import { cn, transitions } from '#/lib/utils';
import { Button } from '#/components/ui/button';
import { ArrowLeftRightIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '#/components/ui/popover';

interface TransitionPickerProps {
	mediaId: string;
	defaultTransition: TransitionType;
	onChange: (newTransition: TransitionType) => void;
};

const TransitionPicker = ({
	mediaId,
	onChange,
	defaultTransition
}: TransitionPickerProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [transition, setTransition] = useState<TransitionType>(defaultTransition);

	const selectTransition = (newTransition: TransitionType) => {
		if (defaultTransition !== newTransition) {
			setTransition(newTransition);
			onChange(newTransition);
		}
		
		setIsOpen(false);
	};

	const onOpenChange = (open: boolean) => {
		setIsOpen(open);
	};
	
	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button id={`transition-${mediaId}`} size='sm' className='bg-black hover:bg-core text-white text-xs w-max h-7 px-2'>
					<ArrowLeftRightIcon className='size-3.5 mr-1.5' />
					{transitions.find($ => $.id === transition)!.text}
				</Button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-80 h-96 p-4 overflow-y-auto scrollbar-thin rounded-md shadow-sm'>
				<div className='grid grid-cols-2 gap-2'>
					{transitions.map(($, idx) => (
						<button
							key={idx}
							onClick={() => selectTransition($.id)}
							className={cn(
								'flex flex-col items-center gap-y-1 rounded-md relative p-2 text-sm border-2 hover:border-gray-400 text-black',
								transition === $.id && 'border-black hover:border-black bg-muted'
							)}
						>
							<Image src={$.preview} className='aspect-[180/136] w-full h-auto rounded-md' width={100} height={100} alt={`${$.text} transition`} />
							<span className='bg-black text-white mt-1 text-xs py-0.5 px-1.5 rounded text-nowrap'>{$.text}</span>
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	)
};

export default TransitionPicker;
