'use client';

import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { MouseEvent, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Star } from 'lucide-react';
import { Skeleton } from '#/components/ui/skeleton';
import { blurActiveElement, cn } from '#/lib/utils';
import ProjectActions from '#/components/shared/ProjectActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { starProject, unstarProject } from '#/lib/actions/mutations';

interface ProjectCardProps {
	id: string;
	userId: string;
	title: string;
	createdAt: Date;
	isProjectStarred: boolean;
}

const ProjectCard = ({
	id,
	userId,
	title,
	createdAt,
	isProjectStarred
}: ProjectCardProps) => {
	const authorLabel = 'You';
	const queryClient = useQueryClient();
	const [isFocused, setIsFocused] = useState(false);
	const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });
	const { mutate: starProjectMutation, isPending: starProjectLoading } = useMutation({
		mutationFn: async (projectId: string) => {
			try {
				const project = await starProject(projectId);

				console.log('Star Project Mutation :>>', project);
				return project;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('starProject Error :>>', error);
			toast.error('Failed to star project ;(');
		},
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: [`project-${response.id}`] });
		}
	});
	const { mutate: unstarProjectMutation, isPending: unstarProjectLoading } = useMutation({
		mutationFn: async (projectId: string) => {
			try {
				const project = await unstarProject(projectId);

				console.log('Star Project Mutation :>>', project);
				return project;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('unstarProject Error :>>', error);
			toast.error('Failed to unstar project ;(');
		},
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: [`project-${response.id}`] });
		}
	});

	const toggleStarred = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		
		if (isProjectStarred) {
			unstarProjectMutation(id);
		} else {
			starProjectMutation(id);
		}

		blurActiveElement();
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleBlur = () => {
		setIsFocused(false);
	};

	return (
		<Link href={`/project/${id}`} onFocus={handleFocus} onBlur={handleBlur}>
			<div className='group aspect-[16/9] border rounded-lg flex flex-col justify-between overflow-hidden'>
				<div className='relative flex-1 bg-orange-50'>
					<Image
						src={`https://api.dicebear.com/9.x/shapes/svg?seed=${id}`}
						alt={title}
						fill
						className='object-cover'
						fetchPriority='high'
					/>

					<div className={cn(
						'opacity-0 group-hover:opacity-50 transition-opacity h-full w-full bg-black',
						isFocused && 'opacity-50'
					)} />
					<ProjectActions id={id} title={title} side='bottom' align='end' sideOffset={10}>
						<div className='absolute z-10 top-1 right-1'>
							<button className={cn(
								'absolute top-1 right-1 opacity-50 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50',
								isFocused && 'opacity-100'
							)}>
								<MoreVertical className='text-white h-5 w-5' />
							</button>
						</div>
					</ProjectActions>
				</div>

				{/* Footer */}
				<div className={cn(
					'relative bg-white p-3 h-[44px] group-hover:h-[64px] transition-all',
					isFocused && 'h-[64px]'
				)}>
					<p className='text-base font-medium truncate max-w-[calc(100%-24px)]'>
						{title}
					</p>
					<p className={cn(
						'opacity-0 group-hover:opacity-100 transition-opacity text-[12px] text-muted-foreground truncate',
						isFocused && 'opacity-100'
					)}>
						{authorLabel}, {createdAtLabel}
					</p>
					<button
						disabled={starProjectLoading || unstarProjectLoading}
						onClick={toggleStarred}
						className={cn(
							'transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600',
							(starProjectLoading || unstarProjectLoading) && 'cursor-not-allowed opacity-75'
						)}
					>
						<Star className={cn(
							'h-5 w-5',
							isProjectStarred && 'fill-blue-600 text-blue-600'
						)} />
					</button>
				</div>
			</div>
		</Link>
	)
}

export default ProjectCard;

ProjectCard.Skeleton = function ProjectCardSkeleton() {
	return (
		<div className='aspect-[16/9] border rounded-lg flex flex-col justify-between'>
			<Skeleton className='flex-1' />

			{/* Footer */}
			<div className='relative bg-white p-3 h-[44px]'>
				<Skeleton className='h-5' />
			</div>
		</div>
	)
}