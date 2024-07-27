'use client';

import { toast } from 'react-toastify';
import { Prisma } from '@prisma/client';
import { cn, voices } from '#/lib/utils';
import { ActivePane, Voice } from '#/types';
import { Label } from '#/components/ui/label';
import { Button } from '#/components/ui/button';
import { useDebounceCallback } from 'usehooks-ts';
import { Textarea } from '#/components/ui/textarea';
import { Skeleton } from '#/components/ui/skeleton';
import { updateNarration } from '#/lib/actions/mutations';
import { useMutation, useQuery } from '@tanstack/react-query';
import { NarrationGenerationSchema } from '#/lib/validations';
import { getProjectMediaAndNarration } from '#/lib/actions/queries';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';
import { ChangeEvent, FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { SquareIcon, SparklesIcon, ChevronDownIcon, MicIcon, PlayIcon, PauseIcon, PodcastIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '#/components/ui/dropdown-menu';

interface NarrationPaneProps {
	projectId: string;
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const NarrationPane = ({
	projectId,
	activePane,
	onPaneChange
}: NarrationPaneProps) => {
	const [audioUrl, setAudioUrl] = useState('');
	const [narration, setNarration] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const voiceRef = useRef<HTMLAudioElement | null>(null);
	const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
	const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
	const [fetchedVoices, setFetchedVoices] = useState<Map<string, string>>(new Map());
	const [abortController, setAbortController] = useState<AbortController | null>(null);

	const { isPending: projectNarrationLoading } = useQuery({
		queryKey: ['narration'],
		queryFn: async () => {
			try {
				const projectMedia = await getProjectMediaAndNarration(projectId);
				
				if (projectMedia.narration) {
					console.log('projectMedia.narration :>>', projectMedia.narration);
					setAudioUrl(projectMedia.narration.audioUrl ?? '');
					setNarration(projectMedia.narration.transcript ?? '');
					setSelectedVoice(projectMedia.narration.voice as Voice);
				}

				return projectMedia;
			} catch (error) {
				toast.error('Failed to load your narration ;(');
				throw error;
			}
		}
	});

	const { mutate: updateNarrationMutation } = useMutation({
		mutationKey: [`project-${projectId}`],
		mutationFn: async (data: Prisma.NarrationUpdateInput) => {
			try {
				const project = await updateNarration(projectId, data);

				return project;
			} catch (error) {
				throw error;
			}
		}
	});

	const debouncedUpdateNarration = useDebounceCallback(updateNarrationMutation, 500);

	const stopGeneration = useCallback(() => {
		if (abortController) {
			abortController.abort();
			setAbortController(null);
		}
	}, [abortController]);
	
	const onClose = () => {
		onPaneChange(null);
	};

	const handleFormSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const controller = new AbortController();
		setAbortController(controller);
		setIsLoading(true);

		try {
			const response = await fetch('/api/generateScript', {
				method: 'POST',
				body: JSON.stringify({ projectId }),
				signal: controller.signal
			});

			if (!response.ok) {
				return toast.error(await response.text());
			}

			const object = await response.json();
			const data = NarrationGenerationSchema.parse(object);
			const transcript  = data.mediaItems.map($ => $.text).join('\n\n');
			setNarration(transcript);

			console.log('Generation Data :>>', data);
		} catch (error: any) {
			if (error.name === 'AbortError') {
				console.log('Fetch request was aborted');
			} else {
				toast.error(error.message);
			}
		} finally {
			console.log('[finally] reached...');
			setIsLoading(false);
		}
	};

	const handleNarrationChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		if (narration) {
			debouncedUpdateNarration({ transcript: e.target.value });
		}

		setNarration(e.target.value);
	};

	const handleVoiceSelect = (voice: Voice) => {
		setSelectedVoice(voice);

		if (narration) {
			debouncedUpdateNarration({ voice });
		}
	};

	const handleVoicePreviewClick = (e: MouseEvent<HTMLButtonElement>, voice: Voice) => {
		e.preventDefault();

		const fetchedVoiceUrl = fetchedVoices.get(voice);
		if (fetchedVoiceUrl) {
			if (voiceRef.current) {
				if (playingVoice === voice) {
					voiceRef.current.pause();
					setPlayingVoice(null);
				} else {
					voiceRef.current.src = fetchedVoiceUrl;
					voiceRef.current.play();
					setPlayingVoice(voice);
				}
			}
		}
	};

	useEffect(() => {
		const handleAudioEnded = () => setPlayingVoice(null);
		if (voiceRef.current) {
			voiceRef.current.addEventListener('ended', handleAudioEnded);
		}

		return () => {
			if (voiceRef.current) {
				voiceRef.current.removeEventListener('ended', handleAudioEnded);
			}
		};
	}, []);

	useEffect(() => {
		const fetchVoices = async () => {
			const newFetchedVoices = new Map<string, string>();
			for (const voice of voices) {
				const response = await fetch(voice.src);
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				newFetchedVoices.set(voice.id, url);
			}

			setFetchedVoices(newFetchedVoices);
		};

		fetchVoices();
	}, []);

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'narration' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Narration'
				description='Create, reviews & update the AI-generated narration.'
			/>
				<div className='p-3 flex-1 scrollbar-thin overflow-y-auto overflow-x-hidden'>
					<div className={cn('flex flex-col flex-1 gap-y-2 mr-px', !projectNarrationLoading && 'hidden')}>
						<div className='space-y-1.5 relative'>
							<Skeleton className='w-20 mt-1 h-[18px] rounded' />
							<Skeleton className='w-full h-40 rounded-md' />
							<Skeleton className='w-10 h-4 rounded absolute right-0 -bottom-5' />
						</div>

						<div className='space-y-1.5'>
							<Skeleton className='w-20 mt-1 h-[18px] rounded' />
							<Skeleton className='w-full h-10 rounded-md' />
						</div>

						<div className='mx-auto'>
							<Skeleton className='w-40 mt-1 h-9 rounded-md' />
						</div>

						<div className='space-y-1.5'>
							<Skeleton className='w-full h-[54px] rounded-[54px]' />
						</div>
					</div>
					<div className={cn('flex flex-col flex-1 gap-y-2 mr-px', projectNarrationLoading && 'hidden')}>
						<div className='space-y-1 relative'>
							<Label htmlFor='transcript'>Transcript</Label>
							<form onSubmit={handleFormSubmit} className='absolute right-0 -top-2'>
								{isLoading ? (
									<Button size='sm' variant='outline' onClick={stopGeneration} className='bg-red-200 hover:bg-red-600 text-red-600 hover:text-white border-red-600 text-xs w-max h-7 px-2'>
										<SquareIcon className='size-3.5 mr-1.5' />
										Stop generation
									</Button>
								) : (
									<Button size='sm' type='submit' disabled={projectNarrationLoading} className='bg-core hover:bg-black text-white text-xs w-max h-7 px-2'>
										<SparklesIcon className='size-3.5 mr-1.5' />
										Generate with AI
									</Button>
								)}
							</form>
							<Textarea
								id='transcript'
								value={narration}
								onChange={handleNarrationChange}
								maxLength={1500}
								className='p-2 h-40 resize-none scrollbar-thin'
								disabled={projectNarrationLoading || isLoading || !narration}
								placeholder={`Please click the button above to ${narration.length > 0 ? 're' : ''}generate your transcript`}
							/>
							<span className='text-xs text-muted-foreground absolute right-0 -bottom-5 select-none'>{narration.length}/1500</span>
						</div>

						<div className='space-y-1'>
							<Label htmlFor='voice'>Voice</Label>
							<audio ref={voiceRef} className='sr-only' />
							<DropdownMenu>
								<DropdownMenuTrigger disabled={fetchedVoices.size !== voices.length || projectNarrationLoading || isLoading || !narration} asChild>
									<Button id='voice' variant='outline' className='w-full flex items-center justify-between px-2 [&[data-state=open]>svg]:rotate-180'>
										<div className='flex items-center gap-y-1'>
											<MicIcon className='w-4 h-4 mr-2' />
											<span>{voices.find($ => $.id === selectedVoice)?.text || 'Select Voice'}</span>
										</div>
										<ChevronDownIcon className='w-4 h-4 shrink-0 transition-transform duration-200' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='w-48 p-2'>
									<div className='grid gap-1'>
										{voices.map(voice => (
											<DropdownMenuItem
												key={voice.id}
												onSelect={() => handleVoiceSelect(voice.id)}
												className={cn(
													'flex items-center justify-between cursor-pointer rounded-md',
													selectedVoice === voice.id && 'bg-accent text-accent-foreground'
												)}
											>
												<div className='font-medium'>{voice.text}</div>
												<Button onClick={e => handleVoicePreviewClick(e, voice.id)} size='icon' className='rounded-full w-8 h-8'>
													{playingVoice === voice.id ? <PauseIcon className='w-4 h-4' /> : <PlayIcon className='w-4 h-4' />}
												</Button>
											</DropdownMenuItem>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className='mx-auto'>
							<Button size='sm' className='bg-black hover:bg-core text-white'>
								<PodcastIcon className='size-4 mr-2' />
								Generate Narration
							</Button>
						</div>

						<audio className='w-full' controls>
							<source src={audioUrl} type='audio/mpeg' />
							Your browser does not support the audio element.
						</audio>
					</div>
				</div>
			<SidebarPaneCloseButton pane='narration' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default NarrationPane;
