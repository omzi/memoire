'use client';

import Image from 'next/image';
import { ChangeEvent } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Label } from '#/components/ui/label';
import { Input } from '#/components/ui/input';
import { placeholderImage } from '#/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { Textarea } from '#/components/ui/textarea';
import { MediaItemType, TransitionType } from '#/types';
import TransitionPicker from '#/components/project/TransitionPicker';
import { GripVerticalIcon, ImageIcon, VideoIcon } from 'lucide-react';

interface MediaItemProps {
	media: MediaItemType;
	mediaNumber: string;
	handleDurationChange: (e: ChangeEvent<HTMLInputElement>) => void;
	handleDescriptionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
	handleTransitionChange: (newTransition: TransitionType) => void;
}

const MediaItem = ({
	media,
	mediaNumber,
	handleDurationChange,
	handleDescriptionChange,
	handleTransitionChange
}: MediaItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: media.id });
	const style = {
		transition,
		transform: CSS.Transform.toString(transform)
	};

	return (
		<div className='border-b bg-white' ref={setNodeRef} style={style}>
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
					? <Image src={media.url} placeholder={placeholderImage} className='w-16 h-auto object-cover rounded-md cursor-pointer select-none' width={media.width / 0.15} height={media.height / 0.15} alt='...' />
					: <Image src='/images/placeholder.svg' className='w-16 h-auto object-cover rounded-md cursor-pointer select-none' width={media.width / 0.15} height={media.height / 0.15} alt='...' />
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
					<div className='space-y-1'>
						<Label htmlFor='description'>Description</Label>
						<Textarea
							id='description'
							defaultValue={media.description ?? ''}
							className='p-2 h-20 resize-none scrollbar-thin'
							placeholder='Enter your media description or generate with AI'
							onChange={handleDescriptionChange}
						/>
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
