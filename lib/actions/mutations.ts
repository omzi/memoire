'use server';

import prisma from '#/lib/prisma';
import { MediaMetadata } from '#/types';
import { Prisma } from '@prisma/client';

export const createProject = async (data: Prisma.ProjectCreateInput) => {
  const project = await prisma.project.create({ data });

  return project;
};

export const saveMedia = async ({
	projectId,
	mediaMetadata
}: { projectId: string; mediaMetadata: MediaMetadata[] }) => {
	const data = mediaMetadata.map(({ url, type, width, height }) => {
		return {
			url,
			type,
			width,
			height,
			projectId
		}
	});
	
	await prisma.media.createMany({ data });

	// Fetch current project's mediaOrder & all media
	const [project, allMedia] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { mediaOrder: true },
    }),
    prisma.media.findMany({
      where: { projectId }
    })
  ]);

	if (!project) {
    throw new Error('Project not found!');
  }

	const mediaOrder = allMedia.map(media => media.id);
	const updatedMediaOrder = project.mediaOrder.length > 0 ? [...project.mediaOrder, ...mediaOrder] : mediaOrder;

	await prisma.project.update({
    where: { id: projectId },
    data: { mediaOrder: updatedMediaOrder }
  });

  return { media: allMedia, mediaOrder: updatedMediaOrder };
};

export const updateMedia = async ({
  projectId,
  mediaId,
	data
}: { projectId: string; mediaId: string; data: Prisma.MediaUpdateInput }) => {
	const media = await prisma.media.findUnique({
    where: { id: mediaId, projectId }
  });

  if (!media) {
    throw new Error('Project not found!');
  }

	// Ensure sensitive fields like projectId, id, createdAt, and updatedAt are not changed
	const allowedFields = ['duration', 'description', 'transition'] as (keyof Prisma.MediaUpdateInput)[];

	for (const field in data) {
		if (!allowedFields.includes(field as keyof Prisma.MediaUpdateInput)) {
			delete data[field as keyof Prisma.MediaUpdateInput];
		}
	}

	if (data.type === 'VIDEO' && data.duration) {
		delete data.duration;
	}

	const updatedMedia = await prisma.media.update({
		where: { id: mediaId },
		data
	});

	return updatedMedia;
};

export const deleteProject = async (id: string) => {
	// TODO: Get all media URLs from the project & delete from Edgestore...

  await prisma.project.delete({ where: { id } });
};

export const renameProject = async ({ id, title } : { id: string, title: string }) => {
	if (!title) {
    throw new Error('Title is required');
  }

  if (title.length > 60) {
    throw new Error('Title cannot be longer than 60 characters');
  }

  const project = await prisma.project.update({
		where: { id },
		data: { title }
	});

  return project;
};

export const starProject = async (id: string) => {
	const existingStar = await prisma.project.findUnique({
		where: { id, isStarred: true }
	});

  if (existingStar) {
    throw new Error('Project already starred!');
  }

	const project = await prisma.project.update({
		where: { id },
		data: { isStarred: true }
	});

  return project;
};

export const unstarProject = async (id: string) => {
	const existingStar = await prisma.project.findUnique({
		where: { id, isStarred: true }
	});

  if (!existingStar) {
    throw new Error('Project has not been starred!');
  }

	const project = await prisma.project.update({
		where: { id },
		data: { isStarred: false }
	});

  return project;
};
