'use client';

import { cn } from '#/lib/utils';
import { Plus } from 'lucide-react';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { createProject } from '#/lib/actions/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NewProjectButtonProps {
	userId: string;
	disabled?: boolean;
}

const NewProjectButton = ({
	userId,
	disabled
}: NewProjectButtonProps) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	
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
			
			queryClient.invalidateQueries({ queryKey: ['userProjects'] });
			queryClient.invalidateQueries({ queryKey: [`userProjects-${response.id}`] });
			
			router.push(`/project/${response.id}`);
		}
	});

	const handleNewButtonClick = () => {
		createProjectMutation({ title: 'Untitled Project', user: { connect: { id: userId } } });
	};

	return (
		<button
			disabled={disabled || createProjectLoading}
			onClick={handleNewButtonClick}
			className={cn(
				'col-span-1 aspect-[16/9] bg-blue-600 relative rounded-lg flex items-center justify-center py-6',
				(disabled || createProjectLoading) && 'opacity-75 cursor-not-allowed',
				(!disabled && !createProjectLoading) && 'hover:bg-blue-800'
			)}
		>
			<span className={cn('opacity-100 flex flex-col items-center', createProjectLoading && 'opacity-0')}>
				<Plus className='h-12 w-12 mb-1 text-white stroke-1' />
				<p className='text-base text-white font-light'>New Project</p>
			</span>

			{createProjectLoading && (
				<div className='absolute flex items-center justify-center w-full h-full'>
					<Loader type='spinner' size={48} className='text-white leading-[0]' />
				</div>
			)}
		</button>
	)
}

export default NewProjectButton;
