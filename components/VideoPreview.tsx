'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toast } from 'react-toastify';
import { fetchFile } from '@ffmpeg/util';
import { LoaderIcon, WrenchIcon } from 'lucide-react';
import { db } from '#/lib/browserDatabase';
import { cn, reorderByField } from '#/lib/utils';
import { Button } from '#/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ProjectMediaType, MediaItemType } from '#/types';
import { getProjectMediaAndNarration } from '#/lib/actions/queries';
import Image from 'next/image';

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
	const [isPaused, setIsPaused] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isFFMPEGLoading, setIsFFMPEGLoading] = useState(false);
	const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);

	const { isPending: projectLoading, data: project } = useQuery({
		queryKey: ['preview'],
		queryFn: async () => {
			try {
				const project = await getProjectMediaAndNarration(projectId);

				const reorderedMediaItems = reorderByField(project.media, project.mediaOrder, 'id');
				
				setMediaItems(reorderedMediaItems);
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

	const processMedia = async () => {
		if (isProcessing) return;

		if (mediaItems.length > 0 && !isFFMPEGLoading) {
			try {
				setIsProcessing(true);

				const ffmpeg = FFMPEGRef.current;
				const inputOptions: string[] = [];
				const filterComplex: string[] = [];
				let lastStream = 'base';
				let filterIndex = 0;
				let offset = 0;
	
				console.log('Media Items :>>', JSON.stringify(mediaItems, null, 2));
	
				for (const media of mediaItems) {
					const extension = media.url.split('.').pop();
					const inputName = `${media.id}.${extension}`;
					await ffmpeg.writeFile(inputName, await fetchFile(media.url));
					inputOptions.push('-i', inputName);
	
					const currentStream = `v${filterIndex}`;
					const loopDuration = media.duration * frameRate;
	
					if (media.type === 'PHOTO') {
						filterComplex.push(`[${filterIndex}:v]scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,loop=${loopDuration}:${loopDuration}:0,fps=${frameRate}[${currentStream}]`);
					} else {
						filterComplex.push(`[${filterIndex}:v]scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${frameRate}[${currentStream}]`);
					}
	
					if (lastStream !== 'base') {
						const transitionOffset = offset - 1;
						filterComplex.push(`[${lastStream}][${currentStream}]xfade=transition=${media.transition}:duration=1:offset=${transitionOffset}[${currentStream}]`);
						offset += media.duration - 1;
					} else {
						offset += media.duration;
					}
	
					lastStream = currentStream;
					filterIndex++;
				}
	
				const combinedFilter = filterComplex.join(';');
	
				console.log('Input Options :>>\n\n', ...inputOptions);
				console.log('Combined Filter :>>\n\n', filterComplex.join(';\n'));
	
				await ffmpeg.exec([
					...inputOptions,
					'-filter_complex', combinedFilter,
					'-map', `[${lastStream}]`,
					'-aspect', aspectRatio,
					'-r', frameRate.toString(),
					'generated.mp4'
				]);
	
				const outputData = (await ffmpeg.readFile('generated.mp4')) as any;
				setVideoSrc(URL.createObjectURL(new Blob([outputData.buffer], { type: 'video/mp4' })));
			} catch (error: any) {
				toast.error(error.message ?? 'Failed to generate preview ;(');
			} finally {
				setIsProcessing(false);
			}
		}
	};

	const isDisabled = mediaItems.length === 0 || isFFMPEGLoading || projectLoading;

	return (
		<div className='w-full h-full flex flex-col p-2'>
			{isFFMPEGLoading && projectLoading ? (
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
						{mediaItems.length === 0 ? 'Please upload your media to get started' : 'Click on the button below to generate a preview'}
					</p>
					<Button disabled={isDisabled || isProcessing} onClick={processMedia} size='sm' className='bg-black hover:bg-core text-white mx-auto relative'>
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
