'use client';

import { useEffect } from 'react';
import { ProjectType } from '#/types';
import { Navbar } from '#/components/project/NavBar';
import ProjectEditor from '#/components/project/ProjectEditor';
import { useMutationState, useQueryClient } from '@tanstack/react-query';

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
	const queryClient = useQueryClient();
	const data = useMutationState({
		filters: {
			mutationKey: [`project-${initialData.id}`],
			exact: true
		},
		select: (mutation) => mutation.state.data
	});
	const currentData = data[data.length - 1] as ProjectType | undefined;

	const startOnboarding = () => {
		// TODO: Start onboarding here...
	};

	useEffect(() => {
		if (currentData) {
			// console.log('currentData :>>', currentData);
			queryClient.invalidateQueries({ queryKey: ['preview'] });

			if (currentData.title) {
				window.document.title = `${currentData.title} / Project ~ Memoire`;
			}
		}

		// Start onboarding if user has onboarded...
		const hasUserOnboarded = Boolean(localStorage.getItem('hasUserOnboarded'));
		console.log('hasUserOnboarded :>>', hasUserOnboarded);
		if (!hasUserOnboarded) {
			setTimeout(() => {
				startOnboarding();
			}, 3e3);
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
