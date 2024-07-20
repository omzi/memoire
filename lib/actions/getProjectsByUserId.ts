'use server';

import prisma from '#/lib/prisma';
import { Prisma } from '@prisma/client';

const getProjectsByUserId = async (userId: string, isStarred: boolean) => {
	let where: Prisma.ProjectWhereInput = { userId };
	if (isStarred) where = { userId, isStarred };

	const projects = await prisma.project.findMany({
		where,
		orderBy: { createdAt: 'desc' }
	});

	return projects;
};

export default getProjectsByUserId;
