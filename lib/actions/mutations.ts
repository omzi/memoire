'use server';

import prisma from '#/lib/prisma';
import { MediaMetadata } from '#/types';
import { Prisma } from '@prisma/client';
import { areArraysEqual } from '#/lib/utils';
import { edgestoreBackendClient } from '#/lib/edgestoreServer';

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
	
	// Save media files & confirm their URLs
	await Promise.all([
		prisma.media.createMany({ data }),
		...data.map(async ({ url }) => {
      await edgestoreBackendClient.projectFiles.confirmUpload({ url });
    })
	]);

	// Fetch current project's mediaOrder & all media
	const [project, allMedia, narration] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { mediaOrder: true }
    }),
    prisma.media.findMany({ where: { projectId } }),
		prisma.narration.findUnique({ where: { projectId } })
  ]);

	if (!project) {
    throw new Error('Project not found!');
  };

	// Extract IDs of newly added media
  const newMediaIds = data.map(({ url }) => {
    const media = allMedia.find($ => $.url === url);
    return media?.id;
  }).filter(id => id !== undefined) as string[];

  // Combine old mediaOrder with newMediaIds, ensuring no duplicates
  const existingMediaOrderSet = new Set(project.mediaOrder);
  const updatedMediaOrder = [...project.mediaOrder, ...newMediaIds.filter(id => !existingMediaOrderSet.has(id))];

	await prisma.project.update({
    where: { id: projectId },
    data: { mediaOrder: updatedMediaOrder }
  });

  return { media: allMedia, mediaOrder: updatedMediaOrder, narration };
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
    throw new Error('Media not found!');
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

export const deleteMedia = async ({ projectId, mediaId }: { projectId: string; mediaId: string }) => {
	const [media, project] = await Promise.all([
		prisma.media.findUnique({ where: { id: mediaId, projectId } }),
		prisma.project.findUnique({ where: { id: projectId }, select: { mediaOrder: true } })
	]);

  if (!project) {
    throw new Error('Project not found!');
  }

  if (!media || media.projectId !== projectId) {
    throw new Error('Media not found!');
  }
	
	const updatedMediaOrder = project.mediaOrder.filter(id => id !== mediaId);

	await Promise.all([
    edgestoreBackendClient.projectFiles.deleteFile({ url: media.url }),
		prisma.media.delete({ where: { id: mediaId } }),
		prisma.project.update({ where: { id: projectId }, data: { mediaOrder: updatedMediaOrder } })
  ]);

	return true;
};

export const saveMediaOrder = async ({
	projectId,
	newMediaOrder
}: { projectId: string; newMediaOrder: string[] }) => {
	const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { mediaOrder: true },
  });

	if (!project) {
    throw new Error('Project not found!');
  }

	if (!areArraysEqual(project.mediaOrder, newMediaOrder)) return;

  await prisma.project.update({
		where: { id: projectId },
		data: { mediaOrder: newMediaOrder }
	});
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

export const updateProjectSettings = async (projectId: string, data: Prisma.ProjectUpdateInput) => {
	const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error('Project not found!');
  }

	// Ensure non-allowed fields are not changed
	const allowedFields = ['description', 'aspectRatio', 'frameRate'] as (keyof Prisma.ProjectUpdateInput)[];

	for (const field in data) {
		if (!allowedFields.includes(field as keyof Prisma.ProjectUpdateInput)) {
			delete data[field as keyof Prisma.ProjectUpdateInput];
		}
	}

	const updatedProject = await prisma.project.update({
		where: { id: projectId },
		data
	});

	return updatedProject;
};

export const updateNarration = async (projectId: string, data: Prisma.NarrationUpdateInput) => {
	const [project, narration] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.narration.findUnique({ where: { projectId } })
  ]);

  if (!project) {
    throw new Error('Project not found!');
  }

	if (!narration) {
		throw new Error('Narration not found!');
	}

	// Ensure non-allowed fields are not changed
	const allowedFields = ['transcript', 'audioUrl'] as (keyof Prisma.NarrationUpdateInput)[];

	for (const field in data) {
		if (!allowedFields.includes(field as keyof Prisma.NarrationUpdateInput)) {
			delete data[field as keyof Prisma.NarrationUpdateInput];
		}
	}

	const updatedNarration = await prisma.narration.update({
		where: { projectId },
		data
	});

	return updatedNarration;
};
