'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { CSS } from '@dnd-kit/utilities';
import { Label } from '#/components/ui/label';
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import { placeholderImage } from '#/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { Textarea } from '#/components/ui/textarea';
import { useCompletion } from '#/hooks/useCompletion';
import { MediaItemType, TransitionType } from '#/types';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import TransitionPicker from '#/components/project/TransitionPicker';
import { GripVerticalIcon, ImageIcon, SparklesIcon, SquareIcon, VideoIcon } from 'lucide-react';

interface MediaItemProps {
	media: MediaItemType;
	mediaNumber: string;
	handleDurationChange: (e: ChangeEvent<HTMLInputElement>) => void;
	handleDescriptionChange: (newDescription: string) => void;
	handleTransitionChange: (newTransition: TransitionType) => void;
}

const MediaItem = ({
	media,
	mediaNumber,
	handleDurationChange,
	handleDescriptionChange,
	handleTransitionChange
}: MediaItemProps) => {
	const [description, setDescription] = useState('');
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: media.id });
	const style = { transition, transform: CSS.Transform.toString(transform) };

	const { completion, input, setInput, trigger, isLoading, stop } = useCompletion({
		api: '/api/generate',
		initialInput: media.description ?? '',
		body: { url: media.url, type: media.type, description },
    onResponse: (res) => {
      if (res.status === 429) {
        toast.error(`You've been rate limited! Please try again later.`);
      }
    },
		onFinish(_, completion) {
			handleDescriptionChange(completion);
		}
	});

	useEffect(() => {
		if (completion) {
			setInput(completion.trim());
		}
	}, [completion]);

	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		setDescription(e.target.value);
		handleDescriptionChange(e.target.value);
	};

	const handleFormSubmit = (e: FormEvent) => {
		e.preventDefault();
		trigger(input);
	};

	return (
		<div className='border-b bg-white touch-none' ref={setNodeRef} style={style}>
			<div className='flex flex-1 items-center justify-between py-3.5 font-medium'>
				<GripVerticalIcon {...attributes} {...listeners} className='cursor-grab mr-1 text-muted-foreground' />
				<div className='mr-2'>{media.type === 'PHOTO' ? <ImageIcon /> : <VideoIcon />}</div>
				<h6 className='flex-1 text-left select-none'>
					Media #{mediaNumber}
				</h6>
			</div>
			<div className='flex gap-x-2 pb-4'>
				{/* TODO: Generate media (both image & video) thumbnail */}
				{media.type === 'PHOTO'
					? <Image src={media.url} placeholder={placeholderImage} className='w-16 h-auto object-cover rounded-md cursor-pointer select-none' width={media.width * 0.15} height={media.height * 0.15} alt='...' />
					: <Image src='/images/placeholder.svg' className='w-16 h-auto object-cover rounded-md cursor-pointer select-none' width={media.width * 0.15} height={media.height * 0.15} alt='...' />
				}
				<div className='flex flex-col flex-1 gap-y-2 mr-px'>
					<div className='space-y-1'>
						<Label htmlFor='duration'>Duration</Label>
						<Input
							id='duration'
							defaultValue={media.duration}
							min={1}
							max={10}
							type='number'
							className='p-2 h-8'
							disabled={media.type === 'VIDEO'}
							placeholder='Enter your media duration'
							onChange={handleDurationChange}
						/>
					</div>
					<div className='space-y-1 relative'>
						<Label htmlFor='description'>Description</Label>
						<form onSubmit={handleFormSubmit} className='absolute right-0 -top-2'>
							{isLoading ? (
								<Button size='sm' variant='outline' onClick={stop} className='bg-red-200 hover:bg-red-600 text-red-600 hover:text-white border-red-600 text-xs w-max h-7 px-2'>
									<SquareIcon className='size-3.5 mr-1.5' />
									Stop generation
								</Button>
							): (
								<Button size='sm' type='submit' className='bg-core hover:bg-black text-white text-xs w-max h-7 px-2'>
									<SparklesIcon className='size-3.5 mr-1.5' />
									Generate with AI
								</Button>
							)}
						</form>
						<Textarea
							id='description'
							value={input}
							onChange={handleInputChange}
							disabled={isLoading}
							maxLength={400}
							className='p-2 h-20 resize-none scrollbar-thin'
							placeholder='Enter your media description or provide a context for better AI generations'
						/>
						<span className='text-xs text-muted-foreground absolute right-0 -bottom-5 select-none'>{input.length}/400</span>
					</div>
					<div className='space-y-1'>
						<Label htmlFor={`transition-${media.id}`}>Transition</Label><br />
						<TransitionPicker
							mediaId={media.id}
							defaultTransition={media.transition as TransitionType}
							onChange={handleTransitionChange}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MediaItem;
