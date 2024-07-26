'use server';

import prisma from '#/lib/prisma';
import { Prisma } from '@prisma/client';

export const getProjectsByUserId = async (userId: string, isStarred: boolean) => {
	let where: Prisma.ProjectWhereInput = { userId };
	if (isStarred) where = { userId, isStarred };

	const projects = await prisma.project.findMany({
		where,
		orderBy: { createdAt: 'desc' }
	});

	return projects;
};

export const getProjectByProjectAndUserId = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, userId }
  });

  return project;
};

export const getProjectSettingsById = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { description: true, aspectRatio: true, frameRate: true }
  });

	if (!project) throw new Error('Project not found!');

  return project;
};

export const getProjectTitle = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

	if (!project) return null;

  return project.title;
};

export const getProjectMediaAndNarration = async (projectId: string) => {
	const [project, media, narration] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.media.findMany({ where: { projectId } }),
    prisma.narration.findUnique({ where: { projectId } })
  ]);

	if (!project) throw new Error('Project not found!');

  return { media, mediaOrder: project.mediaOrder, narration: narration?.transcript ?? '' };
};
