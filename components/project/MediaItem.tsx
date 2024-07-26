'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { CSS } from '@dnd-kit/utilities';
import { Label } from '#/components/ui/label';
import { Input } from '#/components/ui/input';
import { useSortable } from '@dnd-kit/sortable';
import { Button } from '#/components/ui/button';
import { cn, placeholderImage } from '#/lib/utils';
import { Textarea } from '#/components/ui/textarea';
import { deleteMedia } from '#/lib/actions/mutations';
import { useCompletion } from '#/hooks/useCompletion';
import { MediaItemType, TransitionType } from '#/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import TransitionPicker from '#/components/project/TransitionPicker';
import { GripVerticalIcon, ImageIcon, Loader, SparklesIcon, SquareIcon, Trash2Icon, VideoIcon } from 'lucide-react';

interface MediaItemProps {
	projectId: string;
	media: MediaItemType;
	onMediaDelete: (id: string) => void;
	mediaNumber: string;
	handleDurationChange: (e: ChangeEvent<HTMLInputElement>) => void;
	handleDescriptionChange: (newDescription: string) => void;
	handleTransitionChange: (newTransition: TransitionType) => void;
};

const MediaItem = ({
	projectId,
	media,
	onMediaDelete,
	mediaNumber,
	handleDurationChange,
	handleDescriptionChange,
	handleTransitionChange
}: MediaItemProps) => {
	const isMediaMutating = Boolean(useIsMutating({
		mutationKey: [`project-${projectId}`],
		exact: true
	}));
	const queryClient = useQueryClient();
	const [visible, setVisible] = useState(true);
	const [description, setDescription] = useState('');
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: media.id });
	const style = { transition, transform: CSS.Transform.toString(transform) };

	const { mutate: deleteMediaMutation, isPending: isDeleting } = useMutation({
		mutationKey: [`project-${projectId}`],
		mutationFn: async (mediaId: string) => {
			try {
				await deleteMedia({ projectId, mediaId });
			} catch (error) {
				throw error;
			}
		},
		onSuccess: async () => {
			setVisible(false);

			queryClient.invalidateQueries({ queryKey: ['media'] });
		}
	});

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

	const handleDelete = () => {
		if (isMediaMutating) return;
		
		stop();
		deleteMediaMutation(media.id);
	};

	const exitAnimation = {
		opacity: 0,
		x: '120px',
		transition: { duration: 0.25, ease: 'easeInOut' }
	};

	return (
		<AnimatePresence onExitComplete={() => onMediaDelete(media.id)}>
			{visible && (
				<motion.div className='border-b bg-white touch-none' exit={exitAnimation} ref={setNodeRef} style={style}>
					<div className='flex flex-1 items-center justify-between py-3.5 font-medium'>
						<GripVerticalIcon
							{...attributes} {...listeners}
							className={cn('cursor-grab mr-1 text-muted-foreground', isDeleting && 'opacity-50 cursor-not-allowed pointer-events-none')}
						/>
						<div className='mr-2'>{media.type === 'PHOTO' ? <ImageIcon /> : <VideoIcon />}</div>
						<h6 className='flex-1 text-left select-none'>
							Media #{mediaNumber}
						</h6>
	
						{isDeleting ? (
							<Loader className='animate-spin text-muted-foreground' />
						): (
							<Trash2Icon onClick={handleDelete} className={cn('text-red-500 cursor-pointer', isMediaMutating && 'opacity-50 cursor-not-allowed pointer-events-none')} />
						)}
					</div>
					<div className='flex gap-x-2 pb-4'>
						{/* TODO: Generate media (both image & video) thumbnail */}
						{/* TODO: Open media in popup onClick */}
						{media.type === 'PHOTO'
							? <Image
									src={media.url} placeholder={placeholderImage}
									width={media.width * 0.15} height={media.height * 0.15} alt='...'
									className={cn('w-16 h-auto object-cover rounded-md cursor-pointer select-none', isDeleting && 'cursor-not-allowed')}
								/>
							: <Image
									src='/images/placeholder.svg'
									width={media.width * 0.15} height={media.height * 0.15} alt='...'
									className={cn('w-16 h-auto object-cover rounded-md cursor-pointer select-none', isDeleting && 'cursor-not-allowed')}
								/>
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
									disabled={media.type === 'VIDEO' || isDeleting}
									placeholder='Enter your media duration'
									onChange={handleDurationChange}
								/>
							</div>
							<div className='space-y-1 relative'>
								<Label htmlFor='description'>Description</Label>
								<form onSubmit={handleFormSubmit} className='absolute right-0 -top-2'>
									{isLoading ? (
										<Button size='sm' variant='outline' disabled={isDeleting} onClick={stop} className='bg-red-200 hover:bg-red-600 text-red-600 hover:text-white border-red-600 text-xs w-max h-7 px-2'>
											<SquareIcon className='size-3.5 mr-1.5' />
											Stop generation
										</Button>
									): (
										<Button size='sm' type='submit' disabled={isDeleting} className='bg-core hover:bg-black text-white text-xs w-max h-7 px-2'>
											<SparklesIcon className='size-3.5 mr-1.5' />
											Generate with AI
										</Button>
									)}
								</form>
								<Textarea
									id='description'
									value={input}
									onChange={handleInputChange}
									disabled={isLoading || isDeleting}
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
									disabled={isDeleting}
									defaultTransition={media.transition as TransitionType}
									onChange={handleTransitionChange}
								/>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default MediaItem;
