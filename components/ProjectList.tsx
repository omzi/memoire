'use client';

import Image from 'next/image';
import { cn } from '#/lib/utils';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Button } from '#/components/ui/button';
import { useQueryState, parseAsBoolean } from 'nuqs';
import { createProject } from '#/lib/actions/mutations';
import ProjectCard from '#/components/shared/ProjectCard';
import { getProjectsByUserId } from '#/lib/actions/queries';
import NewProjectButton from '#/components/shared/NewProjectButton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ProjectListProps {
	userId: string;
}

const ProjectList = ({
	userId
}: ProjectListProps) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [starred] = useQueryState('starred', parseAsBoolean.withDefault(false));
	const { isPending: getProjectsLoading, data: projects, refetch } = useQuery({
		queryKey: ['projects'],
		queryFn: async () => {
			try {
				const projects = await getProjectsByUserId(userId, starred);

				console.log('Get Projects Query :>>', projects);
				return projects;
			} catch (error) {
				toast.error('Failed to fetch your projects ;(');
				throw error;
			}
		}
	});
	const { mutate: createProjectMutation, isPending: createProjectLoading } = useMutation({
		mutationFn: async (data: Prisma.ProjectCreateInput) => {
			try {
				const project = await createProject(data);

				console.log('Create Project Mutation :>>', project);
				return project;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('createProject Error :>>', error);
			toast.error('Failed to create project ;(');
		},
		onSuccess: (response) => {
			toast.success('Project created!');

			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: [`project-${response.id}`] });

			router.push(`/project/${response.id}`);
		}
	});

	useEffect(() => {
		queryClient.removeQueries({ queryKey: ['projects'], exact: true });
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [starred]);

	const handleCreateClick = () => {
		createProjectMutation({ title: 'Untitled Project', user: { connect: { id: userId } } });
	};

	if (getProjectsLoading) {
		return (
			<div className='space-y-10'>
				<h1 className='text-3xl sm:text-4xl font-semibold font-clash-display-bold flex-wrap text-black'>
					{starred ? 'Starred Projects' : 'Your Projects'}
				</h1>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-8 pb-10'>
					<NewProjectButton userId={userId} disabled />
					<ProjectCard.Skeleton />
					<ProjectCard.Skeleton />
					<ProjectCard.Skeleton />
					<ProjectCard.Skeleton />
					<ProjectCard.Skeleton />
					<ProjectCard.Skeleton />
					<ProjectCard.Skeleton />
				</div>
			</div>
		)
	}

	if (!projects?.length && starred) {
		return (
			<div className='h-full flex flex-col items-center justify-center'>
				<Image
					src='/images/empty-starred.webp'
					width={348}
					height={500}
					alt='No starred project'
					fetchPriority='high'
					className='w-[150px] aspect-[348/500]'
				/>
				<h2 className='text-2xl font-semibold mt-6'>No Starred Project</h2>
				<p className='text-muted-foreground text-sm mt-2'>Try starring a project</p>
			</div>
		)
	}

	if (!projects?.length) {
		return (
			<div className='h-full flex flex-col items-center justify-center'>
				<Image
					src='/images/empty-project.webp'
					width={404}
					height={500}
					alt='No projects created, yet ;)'
					fetchPriority='high'
					className='w-[150px] aspect-[404/500]'
				/>
				<h2 className='text-2xl font-semibold mt-6'>No projects created, yet ;)</h2>
				<p className='text-muted-foreground text-sm mt-2'>Create your first project by clicking the button below!</p>
				<div className='mt-6'>
					<Button size='sm' onClick={handleCreateClick} disabled={createProjectLoading}>
						<span className={cn('opacity-100 flex items-center', createProjectLoading && 'opacity-0')}>
							<Plus className='h-4 w-4 mr-2' />
							Create project
						</span>
						{createProjectLoading && (
							<div className='absolute flex items-center justify-center w-full h-full'>
								<Loader type='spinner' size={28} className='text-white leading-[0]' />
							</div>
						)}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-10'>
			<h1 className='text-3xl sm:text-4xl font-semibold font-clash-display-bold flex-wrap text-black'>
				{starred ? 'Starred Projects' : 'Your Projects'}
			</h1>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-8 pb-10'>
				<NewProjectButton userId={userId} />
				{projects.map(project => (
					<ProjectCard
						key={project.id}
						id={project.id}
						userId={project.userId}
						title={project.title}
						createdAt={project.createdAt}
						isProjectStarred={project.isStarred}
					/>
				))}
			</div>
		</div>
	)
}

export default ProjectList;
