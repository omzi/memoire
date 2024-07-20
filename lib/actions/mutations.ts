'use server';

import prisma from '#/lib/prisma';
import { Prisma } from '@prisma/client';

export const createProject = async (data: Prisma.ProjectCreateInput) => {
  const project = await prisma.project.create({ data });

  return project;
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
