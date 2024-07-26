'use client';

import { toast } from 'react-toastify';
import { Prisma } from '@prisma/client';
import { ChangeEvent, useState } from 'react';
import { Label } from '#/components/ui/label';
import { cn, aspectRatios, frameRates } from '#/lib/utils';
import { Button } from '#/components/ui/button';
import { ActivePane, AspectRatio, FrameRate } from '#/types';
import { useDebounceCallback } from 'usehooks-ts';
import { Textarea } from '#/components/ui/textarea';
import usePreviousValue from '#/hooks/usePreviousValue';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getProjectSettingsById } from '#/lib/actions/queries';
import { updateProjectSettings } from '#/lib/actions/mutations';
import { ChevronDownIcon, ProportionsIcon } from 'lucide-react';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '#/components/ui/dropdown-menu';
import { Skeleton } from '#/components/ui/skeleton';

interface SettingsPaneProps {
	projectId: string;
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const SettingsPane = ({
	projectId,
	activePane,
	onPaneChange
}: SettingsPaneProps) => {
	const [description, setDescription] = useState('');
	const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
	const [isFrameRateOpen, setIsFrameRateOpen] = useState(false);
	const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>(null);
	const previousAspectRatio = usePreviousValue(aspectRatio);
	const [frameRate, setFrameRate] = useState<FrameRate | null>(null);
	const previousFrameRate = usePreviousValue(frameRate);

	const { isPending: projectSettingsLoading } = useQuery({
		queryKey: ['settings'],
		queryFn: async () => {
			try {
				const project = await getProjectSettingsById(projectId);

				setDescription(project.description ?? '');
				setAspectRatio(project.aspectRatio as AspectRatio);
				setFrameRate(project.frameRate as FrameRate);

				return project;
			} catch (error) {
				toast.error('Failed to load your project settings ;(');
				throw error;
			}
		}
	});

	const { mutate: updateProjectSettingsMutation } = useMutation({
		mutationKey: [`project-${projectId}`],
		mutationFn: async (data: Prisma.ProjectUpdateInput) => {
			try {
				const project = await updateProjectSettings(projectId, data);

				return project;
			} catch (error) {
				throw error;
			}
		}
	});

	const debouncedUpdateProjectSettings = useDebounceCallback(updateProjectSettingsMutation, 500);

	const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value);
		debouncedUpdateProjectSettings({ description: e.target.value });
	};

	const selectedAspectRatio = aspectRatios.find($ => $.ratio === aspectRatio);
	const selectedFrameRate = frameRates.find($ => $.value === frameRate);

	const selectAspectRatio = (newAspectRatio: AspectRatio) => {
		if (previousAspectRatio !== newAspectRatio) {
			setAspectRatio(newAspectRatio);
			debouncedUpdateProjectSettings({ aspectRatio: newAspectRatio });
		}

		setIsAspectRatioOpen(false);
	};

	const selectFrameRate = (newFrameRate: FrameRate) => {
		if (previousFrameRate !== newFrameRate) {
			setFrameRate(newFrameRate);
			debouncedUpdateProjectSettings({ frameRate: newFrameRate });
		}

		setIsFrameRateOpen(false);
	};

	const onAspectRatioOpenChange = (open: boolean) => {
		setIsAspectRatioOpen(open);
	};

	const onFrameRateOpenChange = (open: boolean) => {
		setIsFrameRateOpen(open);
	};

	const onClose = () => {
		onPaneChange(null);
	};

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'settings' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Settings'
				description='Customize your project settings & preferences.'
			/>
			<div className='p-3 flex-1 scrollbar-thin overflow-y-auto overflow-x-hidden'>
				{projectSettingsLoading ? (
					<div className='flex flex-col flex-1 gap-y-2 mr-px'>
						<div className='space-y-1.5 relative'>
							<Skeleton className='w-20 mt-1 h-[18px] rounded' />
							<Skeleton className='w-full h-40 rounded-md' />
							<Skeleton className='w-10 h-4 rounded absolute right-0 -bottom-5' />
						</div>

						<div className='space-y-1.5'>
							<Skeleton className='w-20 mt-1 h-[18px] rounded' />
							<Skeleton className='w-full h-10 rounded-md' />
						</div>

						<div className='space-y-1.5'>
							<Skeleton className='w-20 mt-1 h-[18px] rounded' />
							<Skeleton className='w-full h-10 rounded-md' />
						</div>
					</div>
				) : (
					<div className='flex flex-col flex-1 gap-y-2 mr-px'>
						<div className='space-y-1 relative'>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								value={description}
								onChange={handleDescriptionChange}
								disabled={projectSettingsLoading}
								maxLength={500}
								className='p-2 h-40 resize-none scrollbar-thin'
								placeholder={`Enter your project's description. This will give the AI a context to work with for accurate generations.`}
							/>
							<span className='text-xs text-muted-foreground absolute right-0 -bottom-5 select-none'>{description.length}/500</span>
						</div>

						<div className='space-y-1'>
							<Label htmlFor='aspectRatio'>Aspect Ratio</Label>
							<DropdownMenu open={isAspectRatioOpen} onOpenChange={onAspectRatioOpenChange}>
								<DropdownMenuTrigger disabled={projectSettingsLoading} asChild>
									<Button id='aspectRatio' variant='outline' className='w-full flex items-center justify-between px-2 [&[data-state=open]>svg]:rotate-180'>
										<div className='flex items-center gap-y-1'>
											<ProportionsIcon className='w-4 h-4 mr-2' />
											<span>
												{selectedAspectRatio
												? `${selectedAspectRatio.ratio} (${selectedAspectRatio.description})`
												: 'Select Aspect Ratio'}
											</span>
										</div>
										<ChevronDownIcon className='w-4 h-4 shrink-0 transition-transform duration-200' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='w-64 h-72 p-2 overflow-y-auto scrollbar-thin rounded-md shadow-sm'>
									<div className='grid gap-1'>
										{aspectRatios.map($ => {
											const [width, height] = $.ratio.split(':').map(Number);
											
											return (
												<DropdownMenuItem
													key={$.ratio}
													onSelect={() => selectAspectRatio($.ratio)}
													className={cn(
														'flex items-center gap-x-2 cursor-pointer rounded-md',
														aspectRatio === $.ratio && 'bg-accent text-accent-foreground'
													)}
												>
													<div className='size-8 p-1 bg-gray-200 flex justify-center items-center rounded'>
														<div className='border-core border-4 bg-core scale-125' style={{ aspectRatio: width / height }} />
													</div>
													<div className='flex-1'>
														<p className='font-medium leading-none'>{$.ratio}</p>
														<p className='text-xs text-muted-foreground h-3 italic'>
															{$.description}
														</p>
													</div>
												</DropdownMenuItem>
											)
										})}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className='space-y-1'>
							<Label htmlFor='frameRate'>Frame Rate</Label>
							<DropdownMenu open={isFrameRateOpen} onOpenChange={onFrameRateOpenChange}>
								<DropdownMenuTrigger disabled={projectSettingsLoading} asChild>
									<Button id='frameRate' variant='outline' className='w-full flex items-center justify-between px-2 [&[data-state=open]>svg]:rotate-180'>
										<div className='flex items-center gap-y-1'>
											<ProportionsIcon className='w-4 h-4 mr-2' />
											<span>
												{selectedFrameRate
													? `${selectedFrameRate.text}`
													: 'Select Frame Rate'}
											</span>
										</div>
										<ChevronDownIcon className='w-4 h-4 shrink-0 transition-transform duration-200' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='w-64 p-1.5 space-y-1.5 rounded-md shadow-sm'>
									{frameRates.map($ => (
										<DropdownMenuItem
											key={$.value}
											onSelect={() => selectFrameRate($.value)}
											className={cn(
												'flex items-center py-2.5 cursor-pointer rounded-md',
												frameRate === $.value && 'bg-accent text-accent-foreground'
											)}
										>
											<p className='font-medium leading-none'>{$.value}</p>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				)}
			</div>
			<SidebarPaneCloseButton pane='settings' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default SettingsPane;
