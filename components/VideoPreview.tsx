'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { MediaItemType } from '#/types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { db } from '#/lib/browserDatabase';
import { Button } from '#/components/ui/button';
import { cn, reorderByField } from '#/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { LoaderIcon, WrenchIcon } from 'lucide-react';
import { getProjectMediaAndNarration } from '#/lib/actions/queries';

interface VideoPreviewProps {
	projectId: string;
};

const VideoPreview = ({
	projectId
}: VideoPreviewProps) => {
	const frameRate = 24;
	const aspectRatio = '16:9';
	const FFMPEGRef = useRef(new FFmpeg());
	const [videoSrc, setVideoSrc] = useState('');
	const [narration, setNarration] = useState('');
	const [isPaused, setIsPaused] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isFFMPEGLoading, setIsFFMPEGLoading] = useState(false);
	const [generationProgress, setGenerationProgress] = useState(0);
	const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);

	const { isPending: projectLoading } = useQuery({
		queryKey: ['preview'],
		queryFn: async () => {
			try {
				const project = await getProjectMediaAndNarration(projectId);

				const reorderedMediaItems = reorderByField(project.media, project.mediaOrder, 'id');
				
				setMediaItems(reorderedMediaItems);
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

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      setIsPaused(!video.paused);
      video.paused ? video.play() : video.pause();
    }
  };

	useEffect(() => {
		const load = async () => {
			setIsFFMPEGLoading(true);

			const ffmpeg = FFMPEGRef.current
			ffmpeg.on('log', ({ message }) => {
				console.log('[FFmpeg]:>>', message);
			});

			ffmpeg.on('progress', ({ progress }) => {
				setGenerationProgress(Math.round(progress));
			});
			
			// Check if FFmpeg core and WASM are in IndexedDB
			const coreURL = await db.ffmpegCore.get('coreURL');
			const wasmURL = await db.ffmpegCore.get('wasmURL');
	
			if (coreURL && wasmURL) {
				await ffmpeg.load({
					coreURL: URL.createObjectURL(new Blob([coreURL.value], { type: 'application/javascript' })),
					wasmURL: URL.createObjectURL(new Blob([wasmURL.value], { type: 'application/wasm' }))
				});
			} else {
				const [coreResponse, wasmResponse] = await Promise.all([
					fetch('/js/ffmpeg-core.js'),
					fetch('/js/ffmpeg-core.wasm')
				]);

				const coreBuffer = await coreResponse.arrayBuffer();
				const wasmBuffer = await wasmResponse.arrayBuffer();

				// Save to IndexedDB
				await db.ffmpegCore.put({ key: 'coreURL', value: coreBuffer });
				await db.ffmpegCore.put({ key: 'wasmURL', value: wasmBuffer });

				await ffmpeg.load({
					coreURL: URL.createObjectURL(new Blob([coreBuffer], { type: 'application/javascript' })),
					wasmURL: URL.createObjectURL(new Blob([wasmBuffer], { type: 'application/wasm' }))
				});
			}
			
			setIsFFMPEGLoading(false);
		};
		
		load();
	}, []);

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

	const isDisabled = mediaItems.length === 0 || isFFMPEGLoading || projectLoading;

	return (
		<div className='w-full h-full flex flex-col p-2'>
			{isFFMPEGLoading && projectLoading && mediaItems.length === 0 ? (
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
				) : mediaItems.length === 0 ? (
					<div className='flex flex-col items-center justify-center h-svh gap-y-4'>
						<Image
							src='/images/no-video-dark.svg'
							height='300'
							width='300'
							alt='No Media Items Yet'
							fetchPriority='high'
							className='hidden dark:block'
						/>
						<Image
							src='/images/no-video-light.svg'
							height='300'
							width='300'
							alt='No Media Items Yet'
							fetchPriority='high'
							className='block dark:hidden'
						/>
						<h2 className='text-xl font-medium'>No Media Items Yet</h2>
						<p className='text-muted-foreground text-sm'>
							Please upload your media to get started
						</p>
					</div>
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

					{false && (
						<div className='w-full sm:w-96 mx-auto bg-gray-200 rounded-full dark:bg-gray-700'>
							<div className='bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full' style={{ width: `${generationProgress}%` }}>{generationProgress}%</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default VideoPreview;
