'use client';

import { useEffect } from 'react';
import { ProjectType } from '#/types';
import { toast } from 'react-toastify';
import { Navbar } from '#/components/project/NavBar';
import ProjectEditor from '#/components/project/ProjectEditor';
import { useMutationState, useQuery } from '@tanstack/react-query';
import { getProjectByProjectAndUserId } from '#/lib/actions/queries';

interface ProjectIdProps {
	initialData: ProjectType;
	params: {
		projectId: string;
	};
};

const ProjectId = ({
	initialData,
	params
}: ProjectIdProps) => {
	const data = useMutationState({
		filters: {
			mutationKey: [`project-${initialData.id}`],
			exact: true
		},
		select: (mutation) => mutation.state.data
	});
	const currentData = data[data.length - 1] as ProjectType | undefined;
	const { isPending: getProjectLoading, data: project, refetch } = useQuery({
		queryKey: [`project-${initialData.id}`],
		queryFn: async () => {
			try {
				const project = await getProjectByProjectAndUserId(initialData.userId, params.projectId) as ProjectType;

				console.log('Get Project Query :>>', project);
				return project;
			} catch (error) {
				toast.error('Failed to fetch project ;(');
				throw error;
			}
		},
		initialData
	});

	useEffect(() => {
		if (currentData) {
			// console.log('currentData :>>', currentData);
			window.document.title = `${currentData.title} / Project ~ Memoire`;
		}
	}, [currentData]);
	
	return (
		<div className='h-svh flex flex-col'>
			<Navbar initialData={initialData} />
			<ProjectEditor projectId={params.projectId} />
		</div>
	);
}

export default ProjectId;
