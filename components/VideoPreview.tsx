'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { MediaItemType } from '#/types';
import { useRef, useState } from 'react';
import { Button } from '#/components/ui/button';
import { cn, reorderByField } from '#/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { LoaderIcon, WrenchIcon } from 'lucide-react';
import { getProjectMediaAndNarration } from '#/lib/actions/queries';

interface VideoPreviewProps {
	projectId: string;
};

const VideoPreview = ({
	projectId
}: VideoPreviewProps) => {
	const [videoSrc, setVideoSrc] = useState('');
	const [narration, setNarration] = useState('');
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);

	const { isPending: projectLoading } = useQuery({
		queryKey: ['preview'],
		queryFn: async () => {
			try {
				const project = await getProjectMediaAndNarration(projectId);

				const reorderedMediaItems = reorderByField(project.media, project.mediaOrder, 'id');
				
				setMediaItems(reorderedMediaItems);
				setVideoSrc(project.previewUrl);
				if (project.narration) {
					setNarration(project.narration.audioUrl ?? '');
				}

				return project;
			} catch (error) {
				toast.error('Failed to load your media ;(');
				throw error;
			}
		},
		refetchOnWindowFocus: false
	});

	const generatePreview = async () => {
		setIsProcessing(true);

		try {
			const response = await fetch(`/api/generatePreview?projectId=${projectId}`, {
				method: 'GET'
			});

			if (!response.ok) {
				return toast.error(await response.text());
			}

			const result = await response.json() as { data: { preview: string } };
			setVideoSrc(result.data.preview as string);

			console.log('Video Preview Data :>>', result);
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			setIsProcessing(false);
		}
	};

	const isDisabled = mediaItems.length === 0 || projectLoading;

	return (
		<div className='w-full h-full flex flex-col p-2'>
			{projectLoading ? (
				<div className='flex flex-col items-center justify-center h-svh gap-y-4'>
					<Image
						src='/images/preview-loading-dark.svg'
						height='300'
						width='300'
						alt='Preview Loading'
						fetchPriority='high'
						className='hidden dark:block animate-pulse'
					/>
					<Image
						src='/images/preview-loading-light.svg'
						height='300'
						width='300'
						alt='Preview Loading'
						fetchPriority='high'
						className='block dark:hidden animate-pulse'
					/>
					<h2 className='text-xl font-medium -mt-14'>Loading Preview...</h2>
					<p className='text-muted-foreground text-sm'>Feel free to start uploading your media</p>
				</div>
			) : videoSrc ? (
					<video controls autoPlay src={videoSrc} ref={videoRef} className='w-full max-h-full my-auto rounded-lg' />
				) : (
				<div className='flex flex-col items-center justify-center h-svh gap-y-4'>
					<Image
						src='/images/no-video-dark.svg'
						height='300'
						width='300'
						alt='No Video Yet'
						fetchPriority='high'
						className='hidden dark:block'
					/>
					<Image
						src='/images/no-video-light.svg'
						height='300'
						width='300'
						alt='No Video Yet'
						fetchPriority='high'
						className='block dark:hidden'
					/>
					<h2 className='text-xl font-medium'>No Video Yet</h2>
					<p className='text-muted-foreground text-sm'>
						Click on the button below to generate a preview
					</p>
					<Button disabled={isDisabled || isProcessing} onClick={generatePreview} size='sm' className='bg-black hover:bg-core text-white mx-auto relative'>
						<span className={cn('opacity-100 flex items-center', isProcessing && 'opacity-0')}>
							<WrenchIcon className='size-4 mr-2' />
							Generate Preview
						</span>
						{isProcessing && (
							<div className='absolute flex items-center justify-center w-full h-full'>
								<LoaderIcon className='size-5 text-white animate-spin' />
							</div>
						)}
					</Button>
				</div>
			)}
		</div>
	)
}

export default VideoPreview;
