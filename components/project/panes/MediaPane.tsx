'use client';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { Prisma } from '@prisma/client';
import { ImageIcon, SaveIcon } from 'lucide-react';
import { useEdgeStore } from '#/lib/edgestore';
import { Button } from '#/components/ui/button';
import useExitPrompt from '#/hooks/useExitPrompt';
import { useDebounceCallback } from 'usehooks-ts';
import { Skeleton } from '#/components/ui/skeleton';
import MediaItem from '#/components/project/MediaItem';
import { getProjectMedia } from '#/lib/actions/queries';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { saveMedia, saveMediaOrder, updateMedia } from '#/lib/actions/mutations';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';
import { MultiFileDropzone, type FileState } from '#/components/MultiFileDropzone';
import { cn, acceptedFileTypes, getPhotoDimensions, getVideoDimensions, reorderByField } from '#/lib/utils';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ActivePane, MediaMetadata, MediaItemType, ProjectMediaType, TransitionType, UploadResult } from '#/types';
import { DndContext, DragOverlay, DragEndEvent, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 MB

interface MediaPaneProps {
	projectId: string;
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const MediaPane = ({
	projectId,
	activePane,
	onPaneChange
}: MediaPaneProps) => {
	const { edgestore } = useEdgeStore();
	const queryClient = useQueryClient();
	const tabBottomRef = useRef<HTMLDivElement>(null);
	const [_, setShowExitPrompt] = useExitPrompt(false);
	const [mediaIds, setMediaIds] = useState<string[]>([]);
	const [isSaveDisabled, setIsSaveDisabled] = useState(true);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [fileStates, setFileStates] = useState<FileState[]>([]);
	const [isUploadDisabled, setIsUploadDisabled] = useState(false);
	const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);
	const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
	const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata[]>([]);
	const [mediaTab, setMediaTab] = useState<'upload' | 'manage'>('upload');

	const { isPending: projectMediaLoading, data: projectMedia, refetch } = useQuery({
		queryKey: ['media'],
		queryFn: async () => {
			try {
				const projectMedia = await getProjectMedia(projectId);

				console.log('Project Media Query :>>', projectMedia);
				const reorderedMediaItems = reorderByField(projectMedia.media, projectMedia.mediaOrder, 'id');
				
				setMediaIds(projectMedia.mediaOrder);
				setMediaItems(reorderedMediaItems);
				return projectMedia;
			} catch (error) {
				toast.error('Failed to load your media ;(');
				throw error;
			}
		}
	});

	const { mutate: saveMediaMutation } = useMutation({
		mutationKey: [`project-${projectId}`],
		mutationFn: async ({ projectId, mediaMetadata }: { projectId: string; mediaMetadata: MediaMetadata[] }) => {
			try {
				const project = await saveMedia({ projectId, mediaMetadata });

				return project;
			} catch (error) {
				throw error;
			}
		},
		onMutate: () => {
			setIsUploadDisabled(true);
			setShowExitPrompt(true);
		},
		onSuccess: async (data) => {
			// Confirm Edgestore URLs
			await Promise.all(
				uploadResults.map(async ({ url }) => {
					await edgestore.projectFiles.confirmUpload({ url });
				})
			);

			queryClient.setQueryData<ProjectMediaType>(['media'], data);

			const reorderedMediaItems = reorderByField(data.media, data.mediaOrder, 'id');

			setMediaIds(data.mediaOrder);
			setMediaItems(reorderedMediaItems);

			// Switch to manage tab
			setMediaTab('manage');

			setShowExitPrompt(false);
			setIsUploadDisabled(false);
			setFileStates([]);
			setUploadResults([]);
			setMediaMetadata([]);
		},
		onError: () => {
			setIsUploadDisabled(true);
		}
	});

	const { mutate: updateMediaMutation } = useMutation({
		mutationKey: [`project-${projectId}`],
		mutationFn: async (variables: { mediaId: string; data: Prisma.MediaUpdateInput }) => {
			try {
				const media = await updateMedia({ projectId, ...variables });

				return media;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: async (data) => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
		}
	});

	const { mutate: saveMediaOrderMutation } = useMutation({
		mutationKey: [`project-${projectId}`],
		mutationFn: async (newMediaOrder: string[]) => {
			try {
				const media = await saveMediaOrder({ projectId, newMediaOrder });

				return media;
			} catch (error) {
				throw error;
			}
		}
	});

	const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
	const debouncedUpdateMedia = useDebounceCallback(updateMediaMutation, 500);

	useEffect(() => {
		const pendingFiles = fileStates.filter(({ progress }) => typeof progress === 'number' && progress < 100 || progress === 'PENDING');
		const erroredFiles = fileStates.filter(state => state.progress === 'ERROR');

		if (pendingFiles.length === 0 && fileStates.length > erroredFiles.length) {
			setIsSaveDisabled(false);
		} else {
			setIsSaveDisabled(true);
		}

		if (tabBottomRef.current && fileStates.length > 0) {
			tabBottomRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fileStates]);

	const updateFileProgress = (key: string, progress: FileState['progress']) => {
		setFileStates(fileStates => {
			const newFileStates = structuredClone(fileStates);
			const fileState = newFileStates.find(state => state.key === key);
			if (fileState) {
				fileState.progress = progress;
			}

			return newFileStates;
		});
	};

	const clearFailedUploads = () => {
		setFileStates(fileStates => {
			const newFileStates = fileStates.filter(state => state.progress !== 'ERROR');

			return newFileStates;
		});
	};

	const savePhotosToDatabase = async () => {
		// Then, check if some files errored out. If yes, get a confirmation from user
		const erroredFiles = fileStates.filter(state => state.progress === 'ERROR');
		if (erroredFiles.length > 0) {
			const message = erroredFiles.length === 1
				? `An error occurred while uploading a file. Proceed?`
				: `An error occurred while uploading ${erroredFiles.length} files. Proceed?`;

			if (!confirm(message)) return;
		}

		saveMediaMutation({ projectId, mediaMetadata });
	};

	const onClose = () => {
		onPaneChange(null);
	};

	const onMediaTabChange = (value: string) => {
		setMediaTab(value as 'upload' | 'manage');
	};

	const handleDurationChange = (mediaId: string) => (e: ChangeEvent<HTMLInputElement>) => {
		debouncedUpdateMedia({ mediaId, data: { duration: parseInt(e.target.value, 10) } });
	};

	const handleDescriptionChange = (mediaId: string) => (e: ChangeEvent<HTMLTextAreaElement>) => {
		debouncedUpdateMedia({ mediaId, data: { description: e.target.value } });
	};

	const handleTransitionChange = (mediaId: string) => (newTransition: TransitionType) => {
		debouncedUpdateMedia({ mediaId, data: { transition: newTransition } });
	};

	const getMediaPosition = (id: string) => mediaItems.findIndex(media => media.id === id);

	const handleMediaDragStart = (e: DragEndEvent) => {
		setActiveId(e.active.id as string);
	};

	const handleMediaDragEnd = (e: DragEndEvent) => {
		const { active, over } = e;

		if (over) {
			if (active.id === over.id) return;
			const originalPosition = getMediaPosition(active.id as string);
			const newPosition = getMediaPosition(over.id as string);

			const newItems = arrayMove(mediaItems, originalPosition, newPosition);
			setMediaItems(newItems);
			setActiveId(null);

			// Save new media order
			saveMediaOrderMutation(newItems.map(item => item.id));
		}
	};

	const completedFiles = fileStates.filter(({ progress }) => typeof progress === 'number' && progress === 100 || progress === 'COMPLETE');

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'media' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Media'
				description='Upload & manage your project media files.'
			/>
			<div className='p-3 flex-1 scrollbar-thin overflow-y-auto'>
				<Tabs defaultValue='upload' value={mediaTab} onValueChange={onMediaTabChange} className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='upload'>Upload</TabsTrigger>
						<TabsTrigger value='manage'>Manage</TabsTrigger>
					</TabsList>
					<TabsContent value='upload' className='flex flex-col items-center gap-y-2'>
						<MultiFileDropzone
							value={fileStates}
							disabled={isUploadDisabled}
							dropzoneOptions={{
								accept: acceptedFileTypes,
								maxFiles: 10,
								maxSize: MAX_FILE_SIZE
							}}
							onFilesAdded={async (addedFiles) => {
								setFileStates([...fileStates, ...addedFiles]);
								await Promise.all(
									addedFiles.map(async (addedFileState) => {
										try {
											const fileResponse = await edgestore.projectFiles.upload({
												file: addedFileState.file,
												options: { temporary: true },
												onProgressChange: async (progress) => {
													updateFileProgress(addedFileState.key, progress);
													if (progress === 100) {
														// wait 1 second to set it to complete
														// so that the user can see the progress bar
														await new Promise(resolve => setTimeout(resolve, 1000));
														updateFileProgress(addedFileState.key, 'COMPLETE');
													}
												}
											});

											const data = {
												url: fileResponse.url,
												preview: addedFileState.preview,
												file: addedFileState.file
											};

											setUploadResults(uploadResults => [...uploadResults, data]);

											const size = addedFileState.type === 'PHOTO'
												? await getPhotoDimensions(addedFileState.preview)
												: await getVideoDimensions(addedFileState.preview);
											const metadata = { ...size, url: fileResponse.url, type: addedFileState.type };
											setMediaMetadata(mediaMetadata => [...mediaMetadata, metadata]);
										} catch (error) {
											updateFileProgress(addedFileState.key, 'ERROR');
										}
									})
								);
							}}
						/>

						<Button
							size='sm'
							variant='destructive'
							onClick={clearFailedUploads}
							className={cn(
								'rounded-lg shadow-sm hidden',
								fileStates.filter(state => state.progress === 'ERROR').length > 0 && 'block'
							)}
						>
							Clear failed uploads
						</Button>

						<Button
							size='sm'
							onClick={savePhotosToDatabase}
							className='bg-black hover:bg-core text-white w-max'
							disabled={isSaveDisabled || isUploadDisabled || completedFiles.length !== mediaMetadata.length}
						>
							<SaveIcon className='size-4 mr-2' />
							Save
						</Button>

						<div ref={tabBottomRef} />
					</TabsContent>
					<TabsContent value='manage' className='mt-0'>
						<div className='w-full'>
							{/* Loading state */}
							{projectMediaLoading && [...Array(5)].map((_, idx) => (
								<div key={idx} className='flex flex-1 items-center justify-between py-3.5 border-b font-medium'>
									<Skeleton className='w-6 h-6 rounded mr-2' />
									<Skeleton className='flex-1 h-6 rounded' />
								</div>
							))}

							<DndContext
								sensors={sensors}
								onDragStart={handleMediaDragStart}
								onDragEnd={handleMediaDragEnd}
								collisionDetection={closestCorners}
								modifiers={[restrictToVerticalAxis]}
							>
								{mediaItems.length > 0 && mediaItems.map((media, idx, array) => (
									<SortableContext
										key={media.id}
										items={mediaItems}
										strategy={verticalListSortingStrategy}
									>
										<MediaItem
											media={media}
											mediaNumber={`${idx + 1}`.padStart(`${array.length}`.length, '0')}
											handleDurationChange={handleDurationChange(media.id)}
											handleDescriptionChange={handleDescriptionChange(media.id)}
											handleTransitionChange={handleTransitionChange(media.id)}
										/>
									</SortableContext>
								))}

								<DragOverlay>
									{activeId ? (
										<Image
											alt='...'
											width={80}
											height={80}
											className='w-20 h-20 object-cover rounded-md cursor-grabbing'
											src={mediaItems.find($ => $.id === activeId)?.url || '/images/placeholder.svg'}
										/>
									) : null}
								</DragOverlay>
							</DndContext>

							{/* Empty state */}
							{projectMedia && projectMedia.media.length === 0 && (
								<div className='h-72 flex flex-col items-center justify-center gap-y-2'>
									<Image
										src='/images/empty-state-dark.svg'
										height='150'
										width='150'
										alt='No media yet'
										fetchPriority='high'
										className='hidden dark:block'
									/>
									<Image
										src='/images/empty-state-light.svg'
										height='150'
										width='150'
										alt='No media yet'
										fetchPriority='high'
										className='block dark:hidden'
									/>
									<h2 className='text-xl font-medium'>No Media Yet</h2>
									<p className='text-muted-foreground text-sm'>Upload your project media to get started</p>
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</div>
			<SidebarPaneCloseButton pane='media' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default MediaPane;
