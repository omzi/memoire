'use client';

import { toast } from 'react-toastify';
import { Label } from '#/components/ui/label';
import { Button } from '#/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Textarea } from '#/components/ui/textarea';
import { useCompletion } from '#/hooks/useCompletion';
import { cn, reorderByField, voices } from '#/lib/utils';
import { ActivePane, MediaItemType, Voice } from '#/types';
import { getProjectMediaAndNarration } from '#/lib/actions/queries';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import { ChangeEvent, FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';
import { SquareIcon, SparklesIcon, ChevronDownIcon, MicIcon, PlayIcon, PauseIcon, BoltIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '#/components/ui/dropdown-menu';
import { NarrationGenerationSchema, NarrationMediaItem } from '#/lib/validations';

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
	const [input, setInput] = useState('');
	const [narration, setNarration] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const voiceRef = useRef<HTMLAudioElement | null>(null);
	const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);
	const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
	const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
	const [fetchedVoices, setFetchedVoices] = useState<Map<string, string>>(new Map());
	const [abortController, setAbortController] = useState<AbortController | null>(null);

	const { isPending: projectMediaAndNarrationLoading } = useQuery({
		queryKey: ['media'],
		queryFn: async () => {
			try {
				const projectMedia = await getProjectMediaAndNarration(projectId);

				console.log('Project Media Query [Narration]:>>', projectMedia);
				const reorderedMediaItems = reorderByField(projectMedia.media, projectMedia.mediaOrder, 'id');

				setMediaItems(reorderedMediaItems);
				setNarration(projectMedia.narration);
				return projectMedia;
			} catch (error) {
				toast.error('Failed to load your media ;(');
				throw error;
			}
		}
	});

	const stopGeneration = useCallback(() => {
		if (abortController) {
			abortController.abort();
			setAbortController(null);
		}
	}, [abortController]);
	
	const onClose = () => {
		onPaneChange(null);
	};

	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		// handleNarrationChange(e.target.value);
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
			const description  = data.mediaItems.map($ => $.text).join('\n\n');
			setNarration(description);
			setInput(description);

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

	const handleVoiceSelect = (voice: Voice) => {
		setSelectedVoice(voice);
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
				<div className='flex flex-col flex-1 gap-y-2 mr-px'>
					<div className='space-y-1 relative'>
						<Label htmlFor='description'>Script</Label>
						<form onSubmit={handleFormSubmit} className='absolute right-0 -top-2'>
							{isLoading ? (
								<Button size='sm' variant='outline' onClick={stopGeneration} className='bg-red-200 hover:bg-red-600 text-red-600 hover:text-white border-red-600 text-xs w-max h-7 px-2'>
									<SquareIcon className='size-3.5 mr-1.5' />
									Stop generation
								</Button>
							) : (
								<Button size='sm' type='submit' disabled={projectMediaAndNarrationLoading} className='bg-core hover:bg-black text-white text-xs w-max h-7 px-2'>
									<SparklesIcon className='size-3.5 mr-1.5' />
									Generate with AI
								</Button>
							)}
						</form>
						<Textarea
							id='description'
							value={input}
							onChange={handleInputChange}
							disabled
							maxLength={1500}
							className='p-2 h-40 resize-none scrollbar-thin'
							placeholder={`Please click the button above to ${input.length > 0 ? 're' : ''}generate your script`}
						/>
						<span className='text-xs text-muted-foreground absolute right-0 -bottom-5 select-none'>{input.length}/1500</span>
					</div>

					<div className='space-y-1'>
						<Label htmlFor='voice'>Voice</Label>
						<audio ref={voiceRef} className='sr-only' />
						<DropdownMenu>
							<DropdownMenuTrigger disabled={fetchedVoices.size !== voices.length || projectMediaAndNarrationLoading} asChild>
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
							<BoltIcon className='size-4 mr-2' />
							Generate Narration
						</Button>
					</div>
				</div>
			</div>
			<SidebarPaneCloseButton pane='narration' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default NarrationPane;
