import type { Metadata } from 'next';
import authConfig from '#/auth.config';
import { notFound } from 'next/navigation';
import { Session, getServerSession } from 'next-auth';
import ProjectId from '#/app/project/[projectId]/ProjectId';
import { getProjectTitle, getProjectByProjectAndUserId } from '#/lib/actions/queries';

export const generateMetadata = async ({ params }: PageProps) => {
	const projectTitle = await getProjectTitle(params.projectId);
	if (!projectTitle) {
		notFound();
	}

	return {
		title: `${projectTitle} / Project ~ Memoire`,
		description: `${projectTitle}`
	} as Metadata;
};

interface PageProps {
	params: {
		projectId: string;
	};
};

const Page = async ({ params }: PageProps) => {
	const session = await getServerSession(authConfig) as Session;
	const project = await getProjectByProjectAndUserId(session.user.id, params.projectId);

	if (!project) {
		notFound();
	}

	return <ProjectId initialData={project} params={params} />;
};

export default Page;
