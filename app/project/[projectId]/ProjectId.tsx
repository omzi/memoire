'use client';

import { useEffect } from 'react';
import { ProjectType } from '#/types';
import { Navbar } from '#/components/project/NavBar';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import ProjectEditor from '#/components/project/ProjectEditor';

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
	const queryClient = useQueryClient();
	const currentData = data[data.length - 1] as ProjectType | undefined;

	useEffect(() => {
		if (currentData) {
			// console.log('currentData :>>', currentData);
			queryClient.invalidateQueries({ queryKey: ['preview'] });

			if (currentData.title) {
				window.document.title = `${currentData.title} / Project ~ Memoire`;
			}
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
